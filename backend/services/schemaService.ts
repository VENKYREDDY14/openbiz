import fs from "fs";
import path from "path";
import { scrapeUdyam } from "./scrapeUdyam";
import { UdyamSchema } from "../types/udyam";

const CACHE_FILE = path.join(__dirname, "..", "data", "udyamForm.json");

export async function getUdyamSchema(force = false): Promise<UdyamSchema> {
  if (!force && fs.existsSync(CACHE_FILE)) {
    const cached = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
    return cached;
  }
  return scrapeUdyam();
}
