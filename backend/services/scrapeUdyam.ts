import puppeteer, { Browser } from 'puppeteer';
import fs from 'fs';
import path from 'path';

interface FormField {
  label: string;
  type: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export const scrapeUdyam = async (): Promise<FormField[]> => {
  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    console.log('Navigating to Udyam Registration...');
    await page.goto('https://udyamregistration.gov.in/UdyamRegistration.aspx', {
      waitUntil: 'domcontentloaded',
    });

    await page.waitForSelector('form');

    const formFields: FormField[] = await page.evaluate(() => {
      const fields: FormField[] = [];
      const inputs = document.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select');

      inputs.forEach(input => {
        const labelElement = input.closest('div')?.querySelector('label');
        const label = labelElement?.innerText.trim() || '';
        const type = input.tagName.toLowerCase() === 'select' ? 'select' : input.type;
        const name = input.getAttribute('name') || undefined;
        const placeholder = input.getAttribute('placeholder') || undefined;
        const required = input.hasAttribute('required');

        let options: string[] = [];
        if (type === 'select') {
          options = Array.from(input.querySelectorAll('option'))
            .map(option => option.textContent?.trim() || '')
            .filter(opt => opt.length > 0);
        }

        fields.push({ label, type, name, placeholder, required, options });
      });

      return fields;
    });

    const dataPath = path.join(__dirname, '../data/udyamForm.json');
    fs.writeFileSync(dataPath, JSON.stringify(formFields, null, 2), 'utf-8');

    console.log(`Scraping completed Saved to ${dataPath}`);
    return formFields;
  } catch (error) {
    console.error('Error while scraping:', error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
};
