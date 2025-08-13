import React from "react";
import InputField from "./InputField";

interface StepOneProps {
  formData: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const StepOne: React.FC<StepOneProps> = ({ formData, handleChange }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Step 1: Business Details</h2>
      <InputField
        label="Business Name"
        name="businessName"
        value={formData.businessName || ""}
        onChange={handleChange}
        required
      />
      <InputField
        label="Type of Organization"
        name="organizationType"
        value={formData.organizationType || ""}
        onChange={handleChange}
        required
      />
      <InputField
        label="PAN Number"
        name="pan"
        value={formData.pan || ""}
        onChange={handleChange}
        required
      />
    </div>
  );
};

export default StepOne;
