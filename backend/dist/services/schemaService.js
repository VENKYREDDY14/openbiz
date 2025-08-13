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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUdyamSchema = getUdyamSchema;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const scrapeUdyam_1 = require("./scrapeUdyam");
const CACHE_FILE = path_1.default.join(__dirname, "..", "data", "udyamForm.json");
function getUdyamSchema() {
    return __awaiter(this, arguments, void 0, function* (force = false) {
        if (!force && fs_1.default.existsSync(CACHE_FILE)) {
            const cached = JSON.parse(fs_1.default.readFileSync(CACHE_FILE, "utf-8"));
            return cached;
        }
        return (0, scrapeUdyam_1.scrapeUdyam)();
    });
}
