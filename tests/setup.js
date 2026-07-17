/**
 * Vitest setup file — loads js/app.js into the jsdom global scope
 * so StorageService, GreetingWidget, and FocusTimer are available as globals.
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const appCode = readFileSync(resolve(__dirname, '../js/app.js'), 'utf-8');

// Evaluate app.js in the current (jsdom) global scope
// eslint-disable-next-line no-eval
(0, eval)(appCode);
