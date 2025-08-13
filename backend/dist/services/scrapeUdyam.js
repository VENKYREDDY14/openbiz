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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeUdyam = scrapeUdyam;
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const UDYAM_URL = "https://udyamregistration.gov.in/UdyamRegistration.aspx";
const DATA_DIR = path_1.default.join(__dirname, "..", "data");
const CACHE_FILE = path_1.default.join(DATA_DIR, "udyamForm.json");
function ensureDataDir() {
    if (!fs_1.default.existsSync(DATA_DIR))
        fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
}
function normalizeType(t) {
    const x = (t || "").toLowerCase();
    if (["text", "email", "number", "select", "password", "tel", "hidden"].includes(x)) {
        return x;
    }
    return "text";
}
function inferStepFromLabel(label) {
    const l = label.toLowerCase();
    if (l.includes("aadhaar") || l.includes("aadhar") || l.includes("otp"))
        return 1;
    return 2;
}
function guessName(label, nameAttr) {
    if (nameAttr && nameAttr.trim())
        return nameAttr.trim();
    const l = label.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (l.includes("aadhaar") || l.includes("aadhar"))
        return "aadhar";
    if (l.includes("otp"))
        return "otp";
    if (l.includes("pan"))
        return "pan";
    if (l.includes("business"))
        return "businessName";
    if (l.includes("organization") || l.includes("organisation") || l.includes("type"))
        return "organizationType";
    if (l.includes("owner") || l.includes("applicant") || l.includes("name"))
        return "ownerName";
    if (l.includes("email"))
        return "email";
    return l.split(" ").slice(0, 3).join(""); // fallback
}
function scrapeUdyam() {
    return __awaiter(this, void 0, void 0, function* () {
        ensureDataDir();
        let browser = null;
        try {
            browser = yield puppeteer_1.default.launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
            });
            const page = yield browser.newPage();
            yield page.goto(UDYAM_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
            yield page.waitForSelector("form");
            const raw = yield page.evaluate(() => {
                const results = [];
                const controls = document.querySelectorAll("input, select");
                controls.forEach((el) => {
                    var _a, _b, _c;
                    const typeAttr = (el.getAttribute("type") || "").toLowerCase();
                    const nameAttr = (el.getAttribute("name") || "").toLowerCase();
                    // Skip hidden, buttons, and unwanted ASP.NET fields
                    if (typeAttr === "hidden" || typeAttr === "button" || typeAttr === "submit")
                        return;
                    if (nameAttr.includes("contentplaceholder") || nameAttr.includes("btnvalidateaadhaar"))
                        return;
                    if (nameAttr.startsWith("ctl"))
                        return; // skip ASP.NET control IDs
                    // find nearest label text
                    let label = "";
                    const id = el.getAttribute("id");
                    if (id) {
                        const forLbl = document.querySelector(`label[for="${id}"]`);
                        if (forLbl)
                            label = ((_a = forLbl.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || "";
                    }
                    if (!label) {
                        const lbl = (_b = el.closest("div")) === null || _b === void 0 ? void 0 : _b.querySelector("label");
                        label = ((_c = lbl === null || lbl === void 0 ? void 0 : lbl.textContent) === null || _c === void 0 ? void 0 : _c.trim()) || "";
                    }
                    const name = el.getAttribute("name") || undefined;
                    const tag = el.tagName.toLowerCase();
                    const type = tag === "select" ? "select" : (el.getAttribute("type") || "text");
                    const required = el.hasAttribute("required");
                    let options = undefined;
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
            const normalized = raw.map((r) => {
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
            const upsert = (arr, f) => {
                const idx = arr.findIndex((x) => x.name === f.name);
                if (idx >= 0)
                    arr[idx] = Object.assign(Object.assign({}, arr[idx]), f);
                else
                    arr.push(f);
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
            const seenNames = new Set();
            const deduped = normalized.filter((field) => {
                const key = field.name.trim().toLowerCase();
                if (seenNames.has(key))
                    return false;
                seenNames.add(key);
                return true;
            });
            // Remove OTP for demo
            const removeOTP = true;
            const finalFields = removeOTP ? deduped.filter((f) => f.name !== "otp") : deduped;
            const schema = {
                step1: finalFields.filter((f) => f.step === 1).map((_a) => {
                    var { step } = _a, rest = __rest(_a, ["step"]);
                    return rest;
                }),
                step2: finalFields.filter((f) => f.step === 2).map((_a) => {
                    var { step } = _a, rest = __rest(_a, ["step"]);
                    return rest;
                }),
                generatedAt: new Date().toISOString(),
                source: "scraped",
            };
            fs_1.default.writeFileSync(CACHE_FILE, JSON.stringify(schema, null, 2), "utf-8");
            return schema;
        }
        catch (err) {
            if (fs_1.default.existsSync(CACHE_FILE)) {
                const cached = JSON.parse(fs_1.default.readFileSync(CACHE_FILE, "utf-8"));
                return Object.assign(Object.assign({}, cached), { source: "fallback" });
            }
            throw err;
        }
        finally {
            if (browser)
                yield browser.close();
        }
    });
}
