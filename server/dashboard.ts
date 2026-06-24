import express, { Response } from 'express';
import { DB } from './db';
import { authMiddleware, AuthenticatedRequest } from './auth';
import { DashboardMetrics, VehicleType } from '../src/types';

const router = express.Router();

router.get('/metrics', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const slots = DB.getSlots();
    const floors = DB.getFloors();
    const vehicles = DB.getVehicles();
    const transactions = DB.getTransactions();

    // 1. Slot stats
    const totalSlots = slots.length;
    const occupiedSlots = slots.filter(s => s.status === 'occupied').length;
    const availableSlots = totalSlots - occupiedSlots;

    // 2. Active Parked Vehicles inside now
    const activeParkings = vehicles.filter(v => v.exitTime === null).length;

    // 3. Total revenue from completed transactions
    const totalRevenue = transactions
      .filter(t => t.paymentStatus === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);

    // 4. Total Vehicles Checked In Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalVehiclesToday = vehicles.filter(v => {
      const entryDate = new Date(v.entryTime);
      return entryDate >= today;
    }).length;

    // 5. Floor occupancy monitoring
    const floorOccupancy = floors.map(floor => {
      const floorSlots = slots.filter(s => s.floorId === floor._id);
      const occupied = floorSlots.filter(s => s.status === 'occupied').length;
      return {
        floorNumber: floor.floorNumber,
        name: floor.name,
        occupied,
        total: floorSlots.length
      };
    });

    // 6. Vehicle Type Analytics (Cars vs Bikes vs Trucks count and their completed revenue)
    const vehicleTypes: VehicleType[] = ['car', 'bike', 'truck'];
    const vehicleTypeAnalytics = vehicleTypes.map(type => {
      // count is active parking + historical parking of this type
      const activeCount = vehicles.filter(v => v.vehicleType === type && v.exitTime === null).length;
      const histCount = vehicles.filter(v => v.vehicleType === type && v.exitTime !== null).length;
      
      // Calculate revenue collected for this vehicle type
      const collectedRevenue = transactions
        .filter(t => {
          // Find the vehicle corresponding to this transaction
          const v = vehicles.find(veh => veh._id === t.vehicleId);
          return (v && v.vehicleType === type) || (!v && t.vehicleNumber && (
            (type === 'bike' && t.amount % 15 === 0) || // loose heuristics for demo data
            (type === 'truck' && t.amount >= 80) ||
            (type === 'car' && t.amount % 20 === 0)
          ));
        })
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        type,
        count: activeCount + histCount,
        revenue: collectedRevenue
      };
    });

    // 7. Recent Entries (last 5 entries sorted by entry time descending)
    const recentEntries = [...vehicles]
      .sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime())
      .slice(0, 5);

    // 8. Revenue timeline for charts (group by last 7 days)
    const revenueTimeline: { date: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Filter transactions completed on this specific day
      const dailySum = transactions
        .filter(t => {
          const tDate = new Date(t.timestamp);
          return tDate.getDate() === d.getDate() &&
                 tDate.getMonth() === d.getMonth() &&
                 tDate.getFullYear() === d.getFullYear() &&
                 t.paymentStatus === 'paid';
        })
        .reduce((sum, t) => sum + t.amount, 0);

      revenueTimeline.push({
        date: dateStr,
        amount: dailySum
      });
    }

    const metrics: DashboardMetrics = {
      totalSlots,
      occupiedSlots,
      availableSlots,
      totalRevenue,
      activeParkings,
      totalVehiclesToday,
      floorOccupancy,
      vehicleTypeAnalytics,
      recentEntries,
      revenueTimeline
    };

    res.json(metrics);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error compiling dashboard metrics' });
  }
});

export default router;
