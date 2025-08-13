"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEmail = exports.validateAadhaar = exports.validatePAN = exports.validateRequired = void 0;
const validateRequired = (value) => value.trim().length > 0;
exports.validateRequired = validateRequired;
const validatePAN = (pan) => {
    const panRegex = /^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/;
    return panRegex.test(pan);
};
exports.validatePAN = validatePAN;
const validateAadhaar = (aadhaar) => {
    const aadhaarRegex = /^[0-9]{12}$/;
    return aadhaarRegex.test(aadhaar);
};
exports.validateAadhaar = validateAadhaar;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
