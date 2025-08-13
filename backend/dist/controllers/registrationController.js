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
exports.getUdyamFields = exports.register = void 0;
const client_1 = require("@prisma/client");
const validators_1 = require("../utils/validators");
const scrapeUdyam_1 = require("../services/scrapeUdyam");
const prisma = new client_1.PrismaClient();
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { businessName, organizationType, pan, ownerName, aadhar, email } = req.body;
        if (!(0, validators_1.validateRequired)(businessName) ||
            !(0, validators_1.validateRequired)(organizationType) ||
            !(0, validators_1.validatePAN)(pan) ||
            !(0, validators_1.validateRequired)(ownerName) ||
            !(0, validators_1.validateAadhaar)(aadhar) ||
            !(0, validators_1.validateEmail)(email)) {
            return res.status(400).json({ error: 'Validation failed. Check your input fields.' });
        }
        const registration = yield prisma.registration.create({
            data: { businessName, organizationType, pan, ownerName, aadhar, email },
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
        const data = yield (0, scrapeUdyam_1.scrapeUdyam)();
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to scrape Udyam form fields' });
    }
});
exports.getUdyamFields = getUdyamFields;
