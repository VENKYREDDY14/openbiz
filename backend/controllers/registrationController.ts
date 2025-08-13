import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  validateRequired,
  validatePAN,
  validateAadhaar,
  validateEmail,
} from '../utils/validators';
import { scrapeUdyam } from '../services/scrapeUdyam';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { businessName, organizationType, pan, ownerName, aadhar, email } = req.body;

    if (
      !validateRequired(businessName) ||
      !validateRequired(organizationType) ||
      !validatePAN(pan) ||
      !validateRequired(ownerName) ||
      !validateAadhaar(aadhar) ||
      !validateEmail(email)
    ) {
      return res.status(400).json({ error: 'Validation failed. Check your input fields.' });
    }

    const registration = await prisma.registration.create({
      data: { businessName, organizationType, pan, ownerName, aadhar, email },
    });

    res.status(201).json({ success: true, data: registration });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getUdyamFields = async (req: Request, res: Response) => {
  try {
    const data = await scrapeUdyam();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to scrape Udyam form fields' });
  }
};