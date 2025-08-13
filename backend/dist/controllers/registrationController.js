"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshUdyamFields = exports.getUdyamFields = exports.register = void 0;
const client_1 = require("@prisma/client");
const schemaService_1 = require("../services/schemaService");
const validators_1 = require("../utils/validators");
const prisma = new client_1.PrismaClient();
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { businessName, organizationType, pan, ownerName, aadhar, email, pincode, city, state } = req.body;
        if (!(0, validators_1.validateRequired)(businessName) ||
            !(0, validators_1.validateRequired)(organizationType) ||
            !(0, validators_1.validatePAN)(pan) ||
            !(0, validators_1.validateRequired)(ownerName) ||
            !(0, validators_1.validateAadhaar)(aadhar) ||
            !(0, validators_1.validateEmail)(email) ||
            !(0, validators_1.validatePincode)(pincode) ||
            !(0, validators_1.validateRequired)(city) ||
            !(0, validators_1.validateRequired)(state)) {
            return res.status(400).json({
                error: 'Validation failed. Check your input fields.'
            });
        }
        const existing = yield prisma.registration.findFirst({
            where: { OR: [{ pan }, { aadhar }] }
        });
        if (existing) {
            return res.status(409).json({
                error: 'A registration with this PAN or Aadhaar already exists.'
            });
        }
        const registration = yield prisma.registration.create({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.register = register;
const getUdyamFields = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, schemaService_1.getUdyamSchema)(false);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to load Udyam form fields" });
    }
});
exports.getUdyamFields = getUdyamFields;
const refreshUdyamFields = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, schemaService_1.getUdyamSchema)(true);
        res.status(200).json({ success: true, data, refreshed: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to scrape Udyam form fields" });
    }
});
exports.refreshUdyamFields = refreshUdyamFields;
