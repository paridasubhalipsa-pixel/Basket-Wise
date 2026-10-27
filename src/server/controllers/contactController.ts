import type { Request, Response } from 'express';
import { db } from '../db/storageEngine.js';
import type { ContactMessageDoc } from '../types.js';

export const submitContactMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400).json({
        success: false,
        message: 'Name, email, subject, and message are all required.',
        errors: ['Missing fields'],
      });
      return;
    }

    const newMessage: ContactMessageDoc = {
      _id: 'msg_' + Date.now().toString(36),
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    db.contactMessages.push(newMessage);
    db.save();

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received and logged in demo mode.',
      data: {
        message: newMessage,
        note: 'In production mode, an SMTP/SendGrid mailer will notify our operations desk.',
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to record contact message.',
      errors: [(err as Error).message],
    });
  }
};
