import React from "react";
import InputField from "./InputField";

interface StepTwoProps {
  formData: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const StepTwo: React.FC<StepTwoProps> = ({ formData, handleChange }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Step 2: Owner Details</h2>
      <InputField
        label="Owner Name"
        name="ownerName"
        value={formData.ownerName || ""}
        onChange={handleChange}
        required
      />
      <InputField
        label="Aadhar Number"
        name="aadhar"
        value={formData.aadhar || ""}
        onChange={handleChange}
        required
      />
      <InputField
        label="Email"
        name="email"
        type="email"
        value={formData.email || ""}
        onChange={handleChange}
        required
      />
    </div>
  );
};

export default StepTwo;
