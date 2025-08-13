import puppeteer, { Browser } from "puppeteer";
import fs from "fs";
import path from "path";
import { UdyamField, UdyamSchema } from "../types/udyam";

const UDYAM_URL = "https://udyamregistration.gov.in/UdyamRegistration.aspx";
const DATA_DIR = path.join(__dirname, "..", "data");
const CACHE_FILE = path.join(DATA_DIR, "udyamForm.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function normalizeType(t: string): UdyamField["type"] {
  const x = (t || "").toLowerCase();
  if (["text", "email", "number", "select", "password", "tel", "hidden"].includes(x as any)) {
    return x as UdyamField["type"];
  }
  return "text";
}

function inferStepFromLabel(label: string): 1 | 2 {
  const l = label.toLowerCase();
  if (l.includes("aadhaar") || l.includes("aadhar") || l.includes("otp")) return 1;
  return 2;
}

function guessName(label: string, nameAttr?: string): string {
  if (nameAttr && nameAttr.trim()) return nameAttr.trim();
  const l = label.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (l.includes("aadhaar") || l.includes("aadhar")) return "aadhar";
  if (l.includes("otp")) return "otp";
  if (l.includes("pan")) return "pan";
  if (l.includes("business")) return "businessName";
  if (l.includes("organization") || l.includes("organisation") || l.includes("type")) return "organizationType";
  if (l.includes("owner") || l.includes("applicant") || l.includes("name")) return "ownerName";
  if (l.includes("email")) return "email";
  return l.split(" ").slice(0, 3).join(""); // fallback
}

export async function scrapeUdyam(): Promise<UdyamSchema> {
  ensureDataDir();

  let browser: Browser | null = null;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(UDYAM_URL, { waitUntil: "domcontentloaded", timeout: 60000 });

    await page.waitForSelector("form");

    const raw = await page.evaluate(() => {
      const results: Array<{
        label: string;
        name?: string;
        type: string;
        required: boolean;
        options?: string[];
      }> = [];

      const controls = document.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select");
      controls.forEach((el) => {
        const typeAttr = (el.getAttribute("type") || "").toLowerCase();
        const nameAttr = (el.getAttribute("name") || "").toLowerCase();

        // Skip hidden, buttons, and unwanted ASP.NET fields
        if (typeAttr === "hidden" || typeAttr === "button" || typeAttr === "submit") return;
        if (nameAttr.includes("contentplaceholder") || nameAttr.includes("btnvalidateaadhaar")) return;
        if (nameAttr.startsWith("ctl")) return; // skip ASP.NET control IDs

        // find nearest label text
        let label = "";
        const id = el.getAttribute("id");
        if (id) {
          const forLbl = document.querySelector(`label[for="${id}"]`);
          if (forLbl) label = forLbl.textContent?.trim() || "";
        }
        if (!label) {
          const lbl = el.closest("div")?.querySelector("label");
          label = lbl?.textContent?.trim() || "";
        }

        const name = el.getAttribute("name") || undefined;
        const tag = el.tagName.toLowerCase();
        const type = tag === "select" ? "select" : (el.getAttribute("type") || "text");
        const required = el.hasAttribute("required");

        let options: string[] | undefined = undefined;
        if (tag === "select") {
          options = Array.from(el.querySelectorAll("option"))
            .map((o) => (o.textContent || "").trim())
            .filter(Boolean);
        }

        if (label || name) {
          results.push({ label, name, type, required, options });
        }
      });

      return results;
    });

    const normalized: UdyamField[] = raw.map((r) => {
      const label = r.label || r.name || "Field";
      const step = inferStepFromLabel(label);
      const name = guessName(label, r.name);
      const type = normalizeType(r.type);
      return {
        step,
        label,
        name,
        type,
        required: !!r.required,
        options: r.options,
      };
    });

    const upsert = (arr: UdyamField[], f: UdyamField) => {
      const idx = arr.findIndex((x) => x.name === f.name);
      if (idx >= 0) arr[idx] = { ...arr[idx], ...f };
      else arr.push(f);
    };

    // Inject known critical fields
    upsert(normalized, {
      step: 1,
      label: "Aadhaar Number",
      name: "aadhar",
      type: "text",
      required: true,
      pattern: "^[0-9]{12}$",
    });
    upsert(normalized, {
      step: 1,
      label: "OTP",
      name: "otp",
      type: "text",
      required: false,
      pattern: "^[0-9]{6}$",
    });
    upsert(normalized, {
      step: 2,
      label: "PAN Number",
      name: "pan",
      type: "text",
      required: true,
      pattern: "^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$",
    });
    upsert(normalized, {
      step: 2,
      label: "PIN Code",
      name: "pincode",
      type: "text",
      required: true,
      pattern: "^[0-9]{6}$",
    });
    upsert(normalized, { step: 2, label: "City", name: "city", type: "text", required: true });
    upsert(normalized, { step: 2, label: "State", name: "state", type: "text", required: true });
    upsert(normalized, { step: 1, label: "Business Name", name: "businessName", type: "text", required: true });
    upsert(normalized, { step: 2, label: "Owner Name", name: "ownerName", type: "text", required: true });
    upsert(normalized, {
      step: 2,
      label: "Email",
      name: "email",
      type: "email",
      required: true,
      pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
    });
    upsert(normalized, { step: 1, label: "Type of Organization", name: "organizationType", type: "text", required: true });

    // Deduplicate so Aadhaar appears only once
    const seenNames = new Set<string>();
    const deduped = normalized.filter((field) => {
      const key = field.name.trim().toLowerCase();
      if (seenNames.has(key)) return false;
      seenNames.add(key);
      return true;
    });

    // Remove OTP for demo
    const removeOTP = true;
    const finalFields = removeOTP ? deduped.filter((f) => f.name !== "otp") : deduped;

    const schema: UdyamSchema = {
      step1: finalFields.filter((f) => f.step === 1).map(({ step, ...rest }) => rest),
      step2: finalFields.filter((f) => f.step === 2).map(({ step, ...rest }) => rest),
      generatedAt: new Date().toISOString(),
      source: "scraped",
    };

    fs.writeFileSync(CACHE_FILE, JSON.stringify(schema, null, 2), "utf-8");
    return schema;
  } catch (err) {
    if (fs.existsSync(CACHE_FILE)) {
      const cached = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
      return { ...cached, source: "fallback" };
    }
    throw err;
  } finally {
    if (browser) await browser.close();
  }
}
