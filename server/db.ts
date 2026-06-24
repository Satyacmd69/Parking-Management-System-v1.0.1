import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { User, Floor, Slot, Vehicle, Transaction, AuditLog, AppNotification } from '../src/types';

const DATA_FILE = path.join(process.cwd(), 'data.json');

interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  floors: Floor[];
  slots: Slot[];
  vehicles: Vehicle[];
  transactions: Transaction[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
}

// Simple salt + hash helper using Node crypto
export function hashPassword(password: string): string {
  const salt = 'parking_salt_123';
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

export function generateId(): string {
  return crypto.randomUUID();
}

function getInitialDatabase(): DatabaseSchema {
  const users = [
    {
      _id: 'user-admin',
      name: 'Admin Manager',
      email: 'admin@parking.com',
      role: 'admin' as const,
      passwordHash: hashPassword('admin123')
    },
    {
      _id: 'user-staff',
      name: 'Staff Operator',
      email: 'staff@parking.com',
      role: 'staff' as const,
      passwordHash: hashPassword('staff123')
    }
  ];

  const floors: Floor[] = [
    { _id: 'floor-g', floorNumber: 0, totalSlots: 10, name: 'Ground Floor' },
    { _id: 'floor-1', floorNumber: 1, totalSlots: 12, name: 'First Floor' },
    { _id: 'floor-2', floorNumber: 2, totalSlots: 8, name: 'Second Floor' }
  ];

  const slots: Slot[] = [];
  // Seeding slots
  // Ground Floor: 5 Car slots, 3 Bike slots, 2 Truck slots
  for (let i = 1; i <= 5; i++) {
    slots.push({ _id: `slot-g-c${i}`, slotNumber: `G-C0${i}`, floorId: 'floor-g', slotType: 'car', status: 'available' });
  }
  for (let i = 1; i <= 3; i++) {
    slots.push({ _id: `slot-g-b${i}`, slotNumber: `G-B0${i}`, floorId: 'floor-g', slotType: 'bike', status: 'available' });
  }
  for (let i = 1; i <= 2; i++) {
    slots.push({ _id: `slot-g-t${i}`, slotNumber: `G-T0${i}`, floorId: 'floor-g', slotType: 'truck', status: 'available' });
  }

  // First Floor: 8 Car slots, 4 Bike slots
  for (let i = 1; i <= 8; i++) {
    slots.push({ _id: `slot-1-c${i}`, slotNumber: `1-C0${i}`, floorId: 'floor-1', slotType: 'car', status: 'available' });
  }
  for (let i = 1; i <= 4; i++) {
    slots.push({ _id: `slot-1-b${i}`, slotNumber: `1-B0${i}`, floorId: 'floor-1', slotType: 'bike', status: 'available' });
  }

  // Second Floor: 8 Car slots
  for (let i = 1; i <= 8; i++) {
    slots.push({ _id: `slot-2-c${i}`, slotNumber: `2-C0${i}`, floorId: 'floor-2', slotType: 'car', status: 'available' });
  }

  // Set some slots to occupied for demo
  slots[0].status = 'occupied'; // G-C01
  slots[1].status = 'occupied'; // G-C02
  slots[5].status = 'occupied'; // G-B01
  slots[8].status = 'occupied'; // G-T01
  slots[11].status = 'occupied'; // 1-C02

  const vehicles: Vehicle[] = [
    {
      _id: 'veh-1',
      vehicleNumber: 'KA-01-ME-1122',
      ownerName: 'Rahul Sharma',
      vehicleType: 'car',
      entryTime: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(), // 3.5 hours ago
      exitTime: null,
      assignedSlot: 'G-C01'
    },
    {
      _id: 'veh-2',
      vehicleNumber: 'MH-12-PQ-8899',
      ownerName: 'Priya Patel',
      vehicleType: 'car',
      entryTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), // 1.5 hours ago
      exitTime: null,
      assignedSlot: 'G-C02'
    },
    {
      _id: 'veh-3',
      vehicleNumber: 'DL-03-TC-4455',
      ownerName: 'Amit Verma',
      vehicleType: 'bike',
      entryTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      exitTime: null,
      assignedSlot: 'G-B01'
    },
    {
      _id: 'veh-4',
      vehicleNumber: 'HR-26-TR-7777',
      ownerName: 'Sardar Logistics',
      vehicleType: 'truck',
      entryTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      exitTime: null,
      assignedSlot: 'G-T01'
    },
    {
      _id: 'veh-5',
      vehicleNumber: 'TS-09-EX-9090',
      ownerName: 'Vikram Reddy',
      vehicleType: 'car',
      entryTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago
      exitTime: null,
      assignedSlot: '1-C02'
    }
  ];

  const transactions: Transaction[] = [
    {
      _id: 'tx-1',
      vehicleId: 'veh-hist-1',
      vehicleNumber: 'KA-03-NY-9876',
      amount: 40, // 3 hours (First hr 20 + 2 hrs 20)
      duration: 180,
      paymentStatus: 'paid',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'tx-2',
      vehicleId: 'veh-hist-2',
      vehicleNumber: 'MH-02-AB-1234',
      amount: 15, // Bike, 2 hours. Normal cost: 20 + 10 = 30. Bike 50% discount = 15.
      duration: 120,
      paymentStatus: 'paid',
      timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'tx-3',
      vehicleId: 'veh-hist-3',
      vehicleNumber: 'DL-01-CC-5566',
      amount: 100, // Truck, 3 hours. Normal cost: 20 + 10 + 10 = 40. Truck 2x = 80 + base. Wait logic: (20 + 10*2) * 2 = 80.
      duration: 180,
      paymentStatus: 'paid',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'tx-4',
      vehicleId: 'veh-hist-4',
      vehicleNumber: 'UP-16-AM-8888',
      amount: 20, // Car, 1 hour
      duration: 55,
      paymentStatus: 'paid',
      timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString()
    }
  ];

  const auditLogs: AuditLog[] = [
    {
      _id: 'log-1',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      type: 'auth',
      message: 'Staff user logged in successfully',
      user: 'staff@parking.com'
    },
    {
      _id: 'log-2',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      type: 'vehicle',
      message: 'Vehicle KA-01-ME-1122 checked in at slot G-C01',
      user: 'staff@parking.com'
    },
    {
      _id: 'log-3',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      type: 'billing',
      message: 'Transaction completed for vehicle KA-03-NY-9876. Amount: ₹40',
      user: 'staff@parking.com'
    }
  ];

  const notifications: AppNotification[] = [
    {
      _id: 'notif-1',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      type: 'warning',
      message: 'Ground Floor occupancy reached 50%',
      read: false
    },
    {
      _id: 'notif-2',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      type: 'success',
      message: 'Checkout completed successfully for KA-03-NY-9876',
      read: true
    }
  ];

  return { users, floors, slots, vehicles, transactions, auditLogs, notifications };
}

export class DB {
  private static load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_FILE)) {
        const initData = getInitialDatabase();
        fs.writeFileSync(DATA_FILE, JSON.stringify(initData, null, 2));
        return initData;
      }
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error loading database file. Initializing default.', e);
      return getInitialDatabase();
    }
  }

  private static save(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Error saving database file:', e);
    }
  }

  // --- USERS API ---
  static getUsers() {
    return this.load().users;
  }

  static createUser(user: Omit<User, '_id'> & { passwordHash: string }) {
    const db = this.load();
    const newUser = { ...user, _id: generateId() };
    db.users.push(newUser);
    this.save(db);
    return newUser;
  }

  // --- FLOORS API ---
  static getFloors() {
    return this.load().floors;
  }

  static createFloor(floor: Omit<Floor, '_id'>) {
    const db = this.load();
    const newFloor = { ...floor, _id: generateId() };
    db.floors.push(newFloor);
    this.save(db);
    return newFloor;
  }

  static updateFloor(id: string, updates: Partial<Floor>) {
    const db = this.load();
    const index = db.floors.findIndex(f => f._id === id);
    if (index === -1) return null;
    db.floors[index] = { ...db.floors[index], ...updates };
    this.save(db);
    return db.floors[index];
  }

  static deleteFloor(id: string) {
    const db = this.load();
    db.floors = db.floors.filter(f => f._id !== id);
    // Also cascades and removes associated slots!
    db.slots = db.slots.filter(s => s.floorId !== id);
    this.save(db);
    return true;
  }

  // --- SLOTS API ---
  static getSlots() {
    return this.load().slots;
  }

  static createSlot(slot: Omit<Slot, '_id' | 'status'>) {
    const db = this.load();
    const newSlot: Slot = { ...slot, _id: generateId(), status: 'available' };
    db.slots.push(newSlot);
    this.save(db);
    return newSlot;
  }

  static updateSlot(id: string, updates: Partial<Slot>) {
    const db = this.load();
    const index = db.slots.findIndex(s => s._id === id);
    if (index === -1) return null;
    db.slots[index] = { ...db.slots[index], ...updates };
    this.save(db);
    return db.slots[index];
  }

  static deleteSlot(id: string) {
    const db = this.load();
    db.slots = db.slots.filter(s => s._id !== id);
    this.save(db);
    return true;
  }

  // --- VEHICLES API ---
  static getVehicles() {
    return this.load().vehicles;
  }

  static checkInVehicle(vehicle: Omit<Vehicle, '_id' | 'exitTime'>) {
    const db = this.load();
    const newVehicle: Vehicle = {
      ...vehicle,
      _id: generateId(),
      exitTime: null
    };
    db.vehicles.push(newVehicle);

    // Update the associated slot status to occupied
    const slotIndex = db.slots.findIndex(s => s.slotNumber === vehicle.assignedSlot);
    if (slotIndex !== -1) {
      db.slots[slotIndex].status = 'occupied';
    }

    // Add Audit Log
    db.auditLogs.unshift({
      _id: generateId(),
      timestamp: new Date().toISOString(),
      type: 'vehicle',
      message: `Vehicle ${vehicle.vehicleNumber} checked in at slot ${vehicle.assignedSlot}`,
      user: vehicle.ownerName || 'Staff Operator'
    });

    // Add Notification
    db.notifications.unshift({
      _id: generateId(),
      timestamp: new Date().toISOString(),
      type: 'info',
      message: `Vehicle ${vehicle.vehicleNumber} has entered. Assigned slot ${vehicle.assignedSlot}`,
      read: false
    });

    this.save(db);
    return newVehicle;
  }

  static checkOutVehicle(id: string, amount: number, duration: number, paymentStatus: 'paid' | 'pending') {
    const db = this.load();
    const vehIndex = db.vehicles.findIndex(v => v._id === id);
    if (vehIndex === -1) return null;

    const vehicle = db.vehicles[vehIndex];
    const exitTime = new Date().toISOString();
    vehicle.exitTime = exitTime;

    // Free the slot
    const slotIndex = db.slots.findIndex(s => s.slotNumber === vehicle.assignedSlot);
    if (slotIndex !== -1) {
      db.slots[slotIndex].status = 'available';
    }

    // Create Transaction
    const newTx: Transaction = {
      _id: generateId(),
      vehicleId: id,
      vehicleNumber: vehicle.vehicleNumber,
      amount,
      duration,
      paymentStatus,
      timestamp: exitTime
    };
    db.transactions.unshift(newTx);

    // Add Audit Log
    db.auditLogs.unshift({
      _id: generateId(),
      timestamp: exitTime,
      type: 'billing',
      message: `Checked out vehicle ${vehicle.vehicleNumber}. Parking fee ₹${amount} collected.`,
      user: 'Staff Operator'
    });

    // Add Notification
    db.notifications.unshift({
      _id: generateId(),
      timestamp: exitTime,
      type: 'success',
      message: `Vehicle ${vehicle.vehicleNumber} checked out successfully. Fee: ₹${amount}`,
      read: false
    });

    this.save(db);
    return { vehicle, transaction: newTx };
  }

  // --- TRANSACTIONS API ---
  static getTransactions() {
    return this.load().transactions;
  }

  // --- AUDIT LOGS API ---
  static getAuditLogs() {
    return this.load().auditLogs;
  }

  static addAuditLog(log: Omit<AuditLog, '_id' | 'timestamp'>) {
    const db = this.load();
    const newLog: AuditLog = {
      ...log,
      _id: generateId(),
      timestamp: new Date().toISOString()
    };
    db.auditLogs.unshift(newLog);
    this.save(db);
    return newLog;
  }

  // --- NOTIFICATIONS API ---
  static getNotifications() {
    return this.load().notifications;
  }

  static markNotificationsAsRead() {
    const db = this.load();
    db.notifications.forEach(n => {
      n.read = true;
    });
    this.save(db);
    return true;
  }

  static clearNotifications() {
    const db = this.load();
    db.notifications = [];
    this.save(db);
    return true;
  }
}
