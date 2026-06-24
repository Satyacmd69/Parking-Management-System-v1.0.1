import express, { Request, Response, NextFunction } from 'express';
import { DB, hashPassword, generateId } from './db';
import { UserRole } from '../src/types';

const router = express.Router();

// Simple custom Token Engine that mimics JWT
export function generateToken(payload: { id: string; email: string; role: UserRole }): string {
  const data = JSON.stringify(payload);
  const base64Data = Buffer.from(data).toString('base64');
  // Simple HMAC-like signature
  const signature = hashPassword(base64Data);
  return `${base64Data}.${signature}`;
}

export function verifyToken(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [base64Data, signature] = parts;
    const computedSignature = hashPassword(base64Data);
    if (computedSignature !== signature) return null;
    const jsonStr = Buffer.from(base64Data, 'base64').toString('utf-8');
    return JSON.parse(jsonStr) as { id: string; email: string; role: UserRole };
  } catch (e) {
    return null;
  }
}

// Auth Middleware
export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; role: UserRole };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization header is missing or invalid' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  req.user = payload;
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access forbidden: Administrator access required' });
    return;
  }
  next();
}

// REGISTER ENDPOINT
router.post('/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    const users = DB.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    const newUserRole: UserRole = role === 'admin' ? 'admin' : 'staff';
    const passwordHash = hashPassword(password);

    const newUser = DB.createUser({
      name,
      email: email.toLowerCase(),
      role: newUserRole,
      passwordHash
    });

    DB.addAuditLog({
      type: 'auth',
      message: `New user registration: ${name} (${newUserRole})`,
      user: 'System'
    });

    const token = generateToken({ id: newUser._id, email: newUser.email, role: newUser.role });

    res.status(201).json({
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error during registration' });
  }
});

// LOGIN ENDPOINT
router.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const users = DB.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.passwordHash !== hashPassword(password)) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken({ id: user._id, email: user.email, role: user.role });

    DB.addAuditLog({
      type: 'auth',
      message: `User logged in successfully`,
      user: user.email
    });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error during login' });
  }
});

// GET CURRENT USER ME
router.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = DB.getUsers();
    const user = users.find(u => u._id === req.user?.id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching user' });
  }
});

export default router;
