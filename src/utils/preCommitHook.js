import { agentRulesEnforcer } from './agentRules.enforcer.js';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logFilePath = join(__dirname, '../../logs', config.getString('LOG_CONSOLE_PATH'));

class PreCommitHook {
    constructor() {
        this.enforcer = agentRulesEnforcer;
    }

    async validateChanges(filePath, content) {
        // Run all validations
        const validations = [
            this.enforcer.validateFileChange(filePath, content),
            this.enforcer.validateModuleSize(filePath, content),
            this.enforcer.validateNamingConventions(filePath, content)
        ];

        const results = await Promise.all(validations);
        const hasViolations = results.some(result => result === false);

        if (hasViolations) {
            await this.logValidationFailure(filePath);
            return false;
        }

        return true;
    }

    async logValidationFailure(filePath) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] PRE-COMMIT VALIDATION FAILED:\nFile: ${filePath}\nPlease check the logs for rule violations.\n\n`;
        try {
            await fs.appendFile(logFilePath, logEntry, 'utf8');
        } catch (error) {
            console.error('Failed to log validation failure:', error);
        }
    }
}

// Export a singleton instance
export const preCommitHook = new PreCommitHook(); 