import React, { useEffect, useState } from "react";
import InputField from "../components/InputField";
import { ClipLoader } from "react-spinners";
import { FaCircle } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL+"/api";

interface Field {
  label: string;
  name: string;
  type: string;
  required: boolean;
  pattern?: string;
}

interface Schema {
  step1: Field[];
  step2: Field[];
}

interface Errors {
  [key: string]: string;
}

const UdyamForm: React.FC = () => {
  const [schema, setSchema] = useState<Schema | null>(null);
  const [loadingSchema, setLoadingSchema] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Errors>({});
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingPin, setLoadingPin] = useState(false);

  const patterns: Record<string, RegExp> = {
    pan: /^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/,
    aadhar: /^[0-9]{12}$/,
    pincode: /^[0-9]{6}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  };

  useEffect(() => {
    (async () => {
      setLoadingSchema(true);
      try {
        const res = await fetch(`${API_BASE_URL}/udyam-fields`);
        if (!res.ok) throw new Error("Network response not ok");
        const data = await res.json();
        if (data.success) {
          const clean = {
            step1: data.data.step1.filter(
              (f: Field) =>
                !f.name.startsWith("__") &&
                !f.name.toLowerCase().includes("contentplaceholder") &&
                f.name.toLowerCase() !== "otp"
            ),
            step2: data.data.step2.filter(
              (f: Field) =>
                !f.name.startsWith("__") &&
                !f.name.toLowerCase().includes("contentplaceholder") &&
                f.name.toLowerCase() !== "otp"
            ),
          };
          setSchema(clean);
        }
      } catch (err) {
        console.error("Error fetching schema:", err);
        toast.error("Failed to load form schema.");
      } finally {
        setLoadingSchema(false);
      }
    })();
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    if (name === "pan") value = value.toUpperCase();
    if (name === "aadhar") value = value.replace(/\D/g, "").slice(0, 12);

    setFormData((prev) => ({ ...prev, [name]: value }));

    const pattern =
      schema?.step1.concat(schema.step2).find((f) => f.name === name)?.pattern;
    const regex = pattern ? new RegExp(pattern) : patterns[name];
    if (regex && value && !regex.test(value)) {
      setErrors((prev) => ({ ...prev, [name]: `Invalid ${name}` }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "pincode" && patterns.pincode.test(value)) {
      setLoadingPin(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
        const data = await res.json();
        if (data[0].Status === "Success") {
          const { District, State } = data[0].PostOffice[0];
          setFormData((prev) => ({
            ...prev,
            city: District,
            state: State,
          }));
        }
      } catch (err) {
        console.error("PIN lookup failed", err);
        toast.error("Failed to fetch city/state for given pincode.");
      } finally {
        setLoadingPin(false);
      }
    }
  };

  const validateStep = () => {
    if (!schema) return false;
    const currentFields = (step === 1 ? schema.step1 : schema.step2).filter(
      (f) =>
        !f.name.startsWith("__") &&
        !f.name.toLowerCase().includes("contentplaceholder") &&
        f.name.toLowerCase() !== "otp"
    );
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
    if (validateStep()) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoadingSubmit(true);
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Registration successful!");
        setFormData({});
        setStep(1);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error or server is down.");
    }
    setLoadingSubmit(false);
  };

  const renderFields = () => {
    if (!schema) return null;
    const currentFields = (step === 1 ? schema.step1 : schema.step2).filter(
      (f) =>
        !f.name.startsWith("__") &&
        !f.name.toLowerCase().includes("contentplaceholder") &&
        f.name.toLowerCase() !== "otp"
    );

    return currentFields.map((field) => (
      <div key={field.name} className="relative">
        <InputField
          label={field.label}
          name={field.name}
          type={field.type}
          value={formData[field.name] || ""}
          onChange={handleChange}
          required={field.required}
        />
        {loadingPin && (field.name === "city" || field.name === "state") && (
          <div className="absolute right-3 top-9">
            <ClipLoader size={20} color="#2584C6" />
          </div>
        )}
        {errors[field.name] && (
          <p className="text-red-500 text-sm mb-2">{errors[field.name]}</p>
        )}
      </div>
    ));
  };

  if (loadingSchema) {
    return (
      <div className="max-w-lg mx-auto p-6 bg-white shadow rounded flex items-center justify-center">
        <ClipLoader size={40} color="#2584C6" />
        <span className="ml-3 text-gray-700">Loading form…</span>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="max-w-lg mx-auto p-6 bg-white shadow rounded text-red-600">
        Failed to load form schema.
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded">
      <div className="flex items-center justify-center mb-6">
        <FaCircle className={step >= 1 ? "text-[#2584C6]" : "text-gray-300"} />
        <div
          className={`flex-1 h-1 ${step >= 2 ? "bg-[#2584C6]" : "bg-gray-300"}`}
        ></div>
        <FaCircle className={step === 2 ? "text-[#2584C6]" : "text-gray-300"} />
      </div>

      <h2 className="text-xl font-bold mb-4">
        {step === 1
          ? "Step 1: Business Details"
          : "Step 2: Owner & Address Details"}
      </h2>

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
              className="px-4 py-2 bg-[#2584C6] text-white rounded hover:bg-[#1f6fa7]"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loadingSubmit}
              className={`px-4 py-2 text-white rounded ${
                loadingSubmit
                  ? "bg-green-300 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loadingSubmit ? (
                <div className="flex items-center">
                  <ClipLoader size={18} color="#fff" />
                  <span className="ml-2">Submitting...</span>
                </div>
              ) : (
                "Submit"
              )}
            </button>
          )}
        </div>
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default UdyamForm;
