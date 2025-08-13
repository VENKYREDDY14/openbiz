export const validateRequired = (value: string): boolean => value.trim().length > 0;

export const validatePAN = (pan: string): boolean => {
  const panRegex = /^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/;
  return panRegex.test(pan);
};

export const validateAadhaar = (aadhaar: string): boolean => {
  const aadhaarRegex = /^[0-9]{12}$/;
  return aadhaarRegex.test(aadhaar);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePincode = (pincode: string): boolean => {
  const pincodeRegex = /^[0-9]{6}$/;
  return pincodeRegex.test(pincode);
};
