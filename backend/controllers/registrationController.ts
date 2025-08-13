import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getUdyamSchema } from "../services/schemaService";
import {
  validateRequired,
  validatePAN,
  validateAadhaar,
  validateEmail,
  validatePincode
} from '../utils/validators';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const {
      businessName,
      organizationType,
      pan,
      ownerName,
      aadhar,
      email,
      pincode,
      city,
      state
    } = req.body;

    if (
      !validateRequired(businessName) ||
      !validateRequired(organizationType) ||
      !validatePAN(pan) ||
      !validateRequired(ownerName) ||
      !validateAadhaar(aadhar) ||
      !validateEmail(email) ||
      !validatePincode(pincode) ||
      !validateRequired(city) ||
      !validateRequired(state)
    ) {
      return res.status(400).json({
        error: 'Validation failed. Check your input fields.'
      });
    }

    const existing = await prisma.registration.findFirst({
      where: { OR: [{ pan }, { aadhar }] }
    });
    if (existing) {
      return res.status(409).json({
        error: 'A registration with this PAN or Aadhaar already exists.'
      });
    }

    const registration = await prisma.registration.create({
      data: {
        businessName,
        organizationType,
        pan,
        ownerName,
        aadhar,
        email,
        pincode,
        city,
        state
      }
    });

    res.status(201).json({ success: true, data: registration });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getUdyamFields = async (req: Request, res: Response) => {
  try {
    const data = await getUdyamSchema(false);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load Udyam form fields" });
  }
};

export const refreshUdyamFields = async (req: Request, res: Response) => {
  try {
    const data = await getUdyamSchema(true);
    res.status(200).json({ success: true, data, refreshed: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to scrape Udyam form fields" });
  }
};
