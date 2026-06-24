import express, { Request, Response } from 'express';
import { DB, generateId } from './db';
import { authMiddleware, AuthenticatedRequest, requireAdmin } from './auth';
import { VehicleType, Slot, Floor } from '../src/types';

const router = express.Router();

// --- FLOORS ENDPOINTS ---

// GET ALL FLOORS
router.get('/floors', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const floors = DB.getFloors();
    const slots = DB.getSlots();

    // Aggregate statistics per floor
    const floorsWithStats = floors.map(floor => {
      const floorSlots = slots.filter(s => s.floorId === floor._id);
      const occupied = floorSlots.filter(s => s.status === 'occupied').length;
      return {
        ...floor,
        totalSlots: floorSlots.length,
        occupiedSlots: occupied,
        availableSlots: floorSlots.length - occupied
      };
    });

    res.json(floorsWithStats);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching floors' });
  }
});

// CREATE FLOOR
router.post('/floors', authMiddleware, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { floorNumber, name, autoCreateSlots } = req.body;

    if (floorNumber === undefined || !name) {
      res.status(400).json({ error: 'Floor number and name are required' });
      return;
    }

    const floors = DB.getFloors();
    if (floors.some(f => f.floorNumber === Number(floorNumber))) {
      res.status(400).json({ error: `Floor ${floorNumber} already exists` });
      return;
    }

    const newFloor = DB.createFloor({
      floorNumber: Number(floorNumber),
      name,
      totalSlots: 0
    });

    // Auto-create initial default slots if requested (e.g. 10 slots of varying types)
    if (autoCreateSlots) {
      const defaultSlots = [
        { slotNumber: `${floorNumber}-C01`, slotType: 'car' as const },
        { slotNumber: `${floorNumber}-C02`, slotType: 'car' as const },
        { slotNumber: `${floorNumber}-C03`, slotType: 'car' as const },
        { slotNumber: `${floorNumber}-C04`, slotType: 'car' as const },
        { slotNumber: `${floorNumber}-B01`, slotType: 'bike' as const },
        { slotNumber: `${floorNumber}-B02`, slotType: 'bike' as const },
        { slotNumber: `${floorNumber}-T01`, slotType: 'truck' as const }
      ];

      for (const slot of defaultSlots) {
        DB.createSlot({
          slotNumber: slot.slotNumber,
          floorId: newFloor._id,
          slotType: slot.slotType
        });
      }
    }

    DB.addAuditLog({
      type: 'floor',
      message: `Created floor: ${name} (Floor ${floorNumber}) with auto-slots: ${!!autoCreateSlots}`,
      user: req.user?.email || 'Admin'
    });

    res.status(201).json(newFloor);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error creating floor' });
  }
});

// UPDATE FLOOR
router.put('/floors/:id', authMiddleware, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, floorNumber } = req.body;
    const updated = DB.updateFloor(req.params.id, { name, floorNumber: floorNumber !== undefined ? Number(floorNumber) : undefined });

    if (!updated) {
      res.status(404).json({ error: 'Floor not found' });
      return;
    }

    DB.addAuditLog({
      type: 'floor',
      message: `Updated floor details for ID ${req.params.id}`,
      user: req.user?.email || 'Admin'
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error updating floor' });
  }
});

// DELETE FLOOR
router.delete('/floors/:id', authMiddleware, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = DB.deleteFloor(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Floor not found' });
      return;
    }

    DB.addAuditLog({
      type: 'floor',
      message: `Deleted floor and all associated slots for ID ${req.params.id}`,
      user: req.user?.email || 'Admin'
    });

    res.json({ success: true, message: 'Floor and its associated slots deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error deleting floor' });
  }
});


// --- SLOTS ENDPOINTS ---

// GET ALL SLOTS
router.get('/slots', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const slots = DB.getSlots();
    res.json(slots);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching slots' });
  }
});

// CREATE SLOT
router.post('/slots', authMiddleware, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { slotNumber, floorId, slotType } = req.body;

    if (!slotNumber || !floorId || !slotType) {
      res.status(400).json({ error: 'Slot number, floor ID, and slot type are required' });
      return;
    }

    const slots = DB.getSlots();
    if (slots.some(s => s.slotNumber.toUpperCase() === slotNumber.toUpperCase())) {
      res.status(400).json({ error: `Slot number ${slotNumber} already exists` });
      return;
    }

    const newSlot = DB.createSlot({
      slotNumber: slotNumber.toUpperCase(),
      floorId,
      slotType: slotType as VehicleType
    });

    DB.addAuditLog({
      type: 'slot',
      message: `Created parking slot ${slotNumber} of type ${slotType}`,
      user: req.user?.email || 'Admin'
    });

    res.status(201).json(newSlot);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error creating slot' });
  }
});

// UPDATE SLOT (Toggle status, change type, edit number)
router.put('/slots/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { slotNumber, slotType, status } = req.body;
    const updated = DB.updateSlot(req.params.id, {
      slotNumber: slotNumber ? slotNumber.toUpperCase() : undefined,
      slotType,
      status
    });

    if (!updated) {
      res.status(404).json({ error: 'Slot not found' });
      return;
    }

    DB.addAuditLog({
      type: 'slot',
      message: `Updated slot ${updated.slotNumber} properties (status: ${updated.status})`,
      user: req.user?.email || 'Operator'
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error updating slot' });
  }
});

// DELETE SLOT
router.delete('/slots/:id', authMiddleware, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = DB.deleteSlot(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Slot not found' });
      return;
    }

    DB.addAuditLog({
      type: 'slot',
      message: `Deleted slot with ID ${req.params.id}`,
      user: req.user?.email || 'Admin'
    });

    res.json({ success: true, message: 'Slot deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error deleting slot' });
  }
});


// --- VEHICLES / ENTRY SYSTEM ---

// VEHICLE CHECK-IN (Automatic Allocation + Entry Save)
router.post('/vehicles/checkin', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { vehicleNumber, ownerName, vehicleType } = req.body;

    if (!vehicleNumber || !vehicleType) {
      res.status(400).json({ error: 'Vehicle number and type are required' });
      return;
    }

    // Check if vehicle is already parked inside
    const activeVehicles = DB.getVehicles().filter(v => v.exitTime === null);
    if (activeVehicles.some(v => v.vehicleNumber.toUpperCase() === vehicleNumber.toUpperCase())) {
      res.status(400).json({ error: `Vehicle ${vehicleNumber} is already checked in` });
      return;
    }

    // AUTO SLOT ALLOCATION: find available slot that matches type
    const slots = DB.getSlots();
    const availableSlot = slots.find(s => s.slotType === vehicleType && s.status === 'available');

    if (!availableSlot) {
      res.status(400).json({ error: `No available slots of type "${vehicleType}" are left` });
      return;
    }

    const newVehicle = DB.checkInVehicle({
      vehicleNumber: vehicleNumber.toUpperCase(),
      ownerName: ownerName || 'Guest Owner',
      vehicleType: vehicleType as VehicleType,
      entryTime: new Date().toISOString(),
      assignedSlot: availableSlot.slotNumber
    });

    res.status(201).json(newVehicle);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error checking in vehicle' });
  }
});

// LIST ACTIVE PARKINGS
router.get('/vehicles/active', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const active = DB.getVehicles().filter(v => v.exitTime === null);
    res.json(active);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching active vehicles' });
  }
});

// SEARCH VEHICLE (Active or Past)
router.get('/vehicles/search', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { query } = req.query;
    if (!query) {
      res.json([]);
      return;
    }

    const q = String(query).toUpperCase();
    const allVehicles = DB.getVehicles();
    const results = allVehicles.filter(v =>
      v.vehicleNumber.toUpperCase().includes(q) ||
      v.ownerName.toUpperCase().includes(q) ||
      v.assignedSlot.toUpperCase().includes(q)
    );

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error searching vehicles' });
  }
});

// CALCULATE CURRENT CHARGES FOR AN ACTIVE VEHICLE
// Epic 4 Pricing Logic: First Hour = ₹20, Next Hour = ₹10. Bike = 50% Disc, Truck = 2x Charge.
export function calculateCharges(entryTimeStr: string, vehicleType: VehicleType): { durationMins: number; amount: number } {
  const entryTime = new Date(entryTimeStr);
  const now = new Date();
  const diffMs = now.getTime() - entryTime.getTime();
  const durationMins = Math.max(1, Math.round(diffMs / (60 * 1000))); // Minimum 1 minute
  const durationHours = Math.ceil(durationMins / 60);

  let amount = 20; // First hour base charge
  if (durationHours > 1) {
    amount += (durationHours - 1) * 10; // ₹10 per additional hour
  }

  // Type modifiers
  if (vehicleType === 'bike') {
    amount = amount * 0.5; // 50% discount
  } else if (vehicleType === 'truck') {
    amount = amount * 2.0; // 2x charge
  }

  return { durationMins, amount };
}

router.get('/vehicles/calculate-charges/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const vehicles = DB.getVehicles();
    const vehicle = vehicles.find(v => v._id === req.params.id);

    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }

    if (vehicle.exitTime !== null) {
      // Already checked out, return past transaction details
      const tx = DB.getTransactions().find(t => t.vehicleId === vehicle._id);
      res.json({
        checkedOut: true,
        durationMins: tx?.duration || 0,
        amount: tx?.amount || 0,
        paymentStatus: tx?.paymentStatus || 'paid'
      });
      return;
    }

    const calculation = calculateCharges(vehicle.entryTime, vehicle.vehicleType);
    res.json({
      checkedOut: false,
      durationMins: calculation.durationMins,
      amount: calculation.amount,
      paymentStatus: 'pending'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error calculating charges' });
  }
});

// VEHICLE CHECK-OUT (BILLS AND FREES SLOT)
router.post('/vehicles/checkout/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const vehicles = DB.getVehicles();
    const vehicle = vehicles.find(v => v._id === req.params.id);

    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }

    if (vehicle.exitTime !== null) {
      res.status(400).json({ error: 'Vehicle is already checked out' });
      return;
    }

    const { amount, durationMins, paymentStatus } = req.body;

    // Run fallback safety check calculation
    const calc = calculateCharges(vehicle.entryTime, vehicle.vehicleType);
    const finalAmount = amount !== undefined ? Number(amount) : calc.amount;
    const finalDuration = durationMins !== undefined ? Number(durationMins) : calc.durationMins;

    const result = DB.checkOutVehicle(
      vehicle._id,
      finalAmount,
      finalDuration,
      paymentStatus || 'paid'
    );

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error checkout out vehicle' });
  }
});


// --- TRANSACTIONS & REVENUE ---
router.get('/transactions', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json(DB.getTransactions());
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching transactions' });
  }
});


// --- AUDIT LOGS ---
router.get('/audit-logs', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json(DB.getAuditLogs());
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching audit logs' });
  }
});


// --- NOTIFICATIONS ---
router.get('/notifications', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json(DB.getNotifications());
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching notifications' });
  }
});

router.post('/notifications/read', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    DB.markNotificationsAsRead();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error updating notifications' });
  }
});

router.delete('/notifications', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    DB.clearNotifications();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error clearing notifications' });
  }
});

export default router;
