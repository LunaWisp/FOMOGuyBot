import { preCommitHook } from './preCommitHook.js';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logFilePath = join(__dirname, '../../logs', config.getString('LOG_CONSOLE_PATH'));

async function validateFileChanges(filePath, content) {
    try {
        const isValid = await preCommitHook.validateChanges(filePath, content);
        if (!isValid) {
            console.error(`Validation failed for ${filePath}. Check logs for details.`);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error validating changes:', error);
        return false;
    }
}

// Export the validation function
export { validateFileChanges }; 