export type UdyamField = {
    step: 1 | 2;
    label: string;
    name: string;
    type: "text" | "email" | "number" | "select" | "password" | "tel" | "hidden";
    required: boolean;
    pattern?: string;
    options?: string[];
  };
  
  export type UdyamSchema = {
    step1: Array<Omit<UdyamField, "step">>;
    step2: Array<Omit<UdyamField, "step">>;
    generatedAt: string;
    source: "scraped" | "fallback";
  };
  