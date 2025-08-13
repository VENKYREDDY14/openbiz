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
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const scrapeUdyam = () => __awaiter(void 0, void 0, void 0, function* () {
    let browser = null;
    try {
        browser = yield puppeteer_1.default.launch({ headless: true });
        const page = yield browser.newPage();
        console.log('Navigating to Udyam Registration...');
        yield page.goto('https://udyamregistration.gov.in/UdyamRegistration.aspx', {
            waitUntil: 'domcontentloaded',
        });
        // Wait for the first step of the form to load
        yield page.waitForSelector('form');
        // Scrape form fields
        const formFields = yield page.evaluate(() => {
            const fields = [];
            const inputs = document.querySelectorAll('input, select');
            inputs.forEach(input => {
                var _a;
                const labelElement = (_a = input.closest('div')) === null || _a === void 0 ? void 0 : _a.querySelector('label');
                const label = (labelElement === null || labelElement === void 0 ? void 0 : labelElement.innerText.trim()) || '';
                const type = input.tagName.toLowerCase() === 'select' ? 'select' : input.type;
                const name = input.getAttribute('name') || undefined;
                const placeholder = input.getAttribute('placeholder') || undefined;
                const required = input.hasAttribute('required');
                let options = [];
                if (type === 'select') {
                    options = Array.from(input.querySelectorAll('option'))
                        .map(option => { var _a; return ((_a = option.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || ''; })
                        .filter(opt => opt.length > 0);
                }
                fields.push({ label, type, name, placeholder, required, options });
            });
            return fields;
        });
        // Save to JSON file
        const dataPath = path_1.default.join(__dirname, '../data/udyamForm.json');
        fs_1.default.writeFileSync(dataPath, JSON.stringify(formFields, null, 2), 'utf-8');
        console.log(`Scraping completed ✅ Saved to ${dataPath}`);
    }
    catch (error) {
        console.error('Error while scraping:', error);
    }
    finally {
        if (browser) {
            yield browser.close();
        }
    }
});
// Run the script
scrapeUdyam();
