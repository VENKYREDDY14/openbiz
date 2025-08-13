import React, { useState } from "react";
import schema from "../schema/scrapedSchema.json";
import InputField from "../components/InputField";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

interface Errors {
  [key: string]: string;
}

const UdyamForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  // Live validation patterns
  const patterns: Record<string, RegExp> = {
    pan: /^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/,
    aadhar: /^[0-9]{12}$/,
    pincode: /^[0-9]{6}$/
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    // Auto-format PAN & Aadhaar
    if (name === "pan") {
      value = value.toUpperCase();
    }
    if (name === "aadhar") {
      value = value.replace(/\D/g, "").slice(0, 12); // only digits
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Live validation
    if (patterns[name] && value && !patterns[name].test(value)) {
      setErrors((prev) => ({ ...prev, [name]: `Invalid ${name}` }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Auto-fetch city/state from PIN
    if (name === "pincode" && patterns.pincode.test(value)) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
        const data = await res.json();
        if (data[0].Status === "Success") {
          const { District, State } = data[0].PostOffice[0];
          setFormData((prev) => ({
            ...prev,
            city: District,
            state: State
          }));
        }
      } catch {
        console.error("PIN lookup failed");
      }
    }
  };

  const validateStep = () => {
    const currentFields = step === 1 ? schema.step1 : schema.step2;
    const newErrors: Errors = {};

    currentFields.forEach((field) => {
      const value = formData[field.name] || "";
      if (field.required && !value) {
        newErrors[field.name] = `${field.label} is required`;
      } else if (field.pattern && !new RegExp(field.pattern).test(value)) {
        newErrors[field.name] = `Invalid ${field.label}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Registration successful!");
        setFormData({});
        setStep(1);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error or server is down.");
    }
    setLoading(false);
  };

  const renderFields = () => {
    const currentFields = step === 1 ? schema.step1 : schema.step2;
    return currentFields.map((field) => (
      <div key={field.name}>
        <InputField
          label={field.label}
          name={field.name}
          type={field.type}
          value={formData[field.name] || ""}
          onChange={handleChange}
          required={field.required}
        />
        {errors[field.name] && (
          <p className="text-red-500 text-sm mb-2">{errors[field.name]}</p>
        )}
      </div>
    ));
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded">
      {/* Progress Tracker */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className={step === 1 ? "font-bold text-blue-600" : ""}>Step 1</span>
          <span className={step === 2 ? "font-bold text-blue-600" : ""}>Step 2</span>
        </div>
        <div className="relative w-full bg-gray-200 h-2 rounded-full">
          <div
            className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${
              step === 1 ? "w-1/2 bg-blue-500" : "w-full bg-green-500"
            }`}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {renderFields()}

        <div className="flex justify-between mt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Back
            </button>
          )}
          {step < 2 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-white rounded ${
                loading ? "bg-green-300" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UdyamForm;
