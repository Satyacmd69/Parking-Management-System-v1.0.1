export type UserRole = 'admin' | 'staff';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Floor {
  _id: string;
  floorNumber: number;
  totalSlots: number;
  name: string; // e.g. "Ground Floor", "Floor 1"
}

export type VehicleType = 'car' | 'bike' | 'truck';

export interface Slot {
  _id: string;
  slotNumber: string;
  floorId: string;
  slotType: VehicleType;
  status: 'available' | 'occupied';
}

export interface Vehicle {
  _id: string;
  vehicleNumber: string;
  ownerName: string;
  vehicleType: VehicleType;
  entryTime: string; // ISO String
  exitTime: string | null; // ISO String or null
  assignedSlot: string; // Slot ID or slot number
}

export interface Transaction {
  _id: string;
  vehicleId: string;
  vehicleNumber: string;
  amount: number;
  duration: number; // in minutes
  paymentStatus: 'pending' | 'paid';
  timestamp: string; // ISO String
}

export interface AuditLog {
  _id: string;
  timestamp: string;
  type: 'auth' | 'slot' | 'vehicle' | 'floor' | 'billing';
  message: string;
  user: string;
}

export interface AppNotification {
  _id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success';
  message: string;
  read: boolean;
}

export interface DashboardMetrics {
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  totalRevenue: number;
  activeParkings: number;
  totalVehiclesToday: number;
  floorOccupancy: { floorNumber: number; occupied: number; total: number; name: string }[];
  vehicleTypeAnalytics: { type: VehicleType; count: number; revenue: number }[];
  recentEntries: Vehicle[];
  revenueTimeline: { date: string; amount: number }[];
}
