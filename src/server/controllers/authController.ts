import type { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/storageEngine.js';
import { JWT_SECRET, type AuthenticatedRequest } from '../middleware/auth.js';
import type { UserDoc } from '../types.js';

const sanitizeUser = (user: UserDoc) => {
  const { passwordHash: _hash, ...safe } = user;
  return safe;
};

const sendTokenResponse = (user: UserDoc, statusCode: number, res: Response, message: string) => {
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: sanitizeUser(user),
      token,
    },
  });
};

export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
        errors: ['Missing required fields'],
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
        errors: ['Weak password'],
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
        errors: ['Email already registered'],
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const now = new Date().toISOString();

    const newUser: UserDoc = {
      _id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'user',
      createdAt: now,
      updatedAt: now,
    };

    db.users.push(newUser);
    db.save();

    sendTokenResponse(newUser, 201, res, 'Registration successful. Welcome to BasketWise!');
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to complete registration.',
      errors: [(err as Error).message],
    });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
        errors: ['Missing credentials'],
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        errors: ['Authentication failed'],
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        errors: ['Authentication failed'],
      });
      return;
    }

    sendTokenResponse(user, 200, res, 'Login successful.');
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to authenticate user.',
      errors: [(err as Error).message],
    });
  }
};

export const logout = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.clearCookie('token');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
    data: null,
  });
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(200).json({
      success: true,
      data: { user: null },
      message: 'No active session.',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(req.user),
    },
    message: 'User session verified.',
  });
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(req.user),
    },
    message: 'Profile retrieved successfully.',
  });
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    res.status(400).json({ success: false, message: 'Valid name is required.' });
    return;
  }

  const user = db.users.find((u) => u._id === req.user?._id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  user.name = name.trim();
  user.updatedAt = new Date().toISOString();
  db.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    data: {
      user: sanitizeUser(user),
    },
  });
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({
      success: false,
      message: 'Both current password and new password are required.',
    });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters long.',
    });
    return;
  }

  const user = db.users.find((u) => u._id === req.user?._id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    res.status(400).json({
      success: false,
      message: 'Current password does not match.',
      errors: ['Incorrect password'],
    });
    return;
  }

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  user.updatedAt = new Date().toISOString();
  db.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully.',
    data: null,
  });
};
