import { agentRules } from '../../agentRules.js';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logFilePath = join(__dirname, '../../logs', config.getString('LOG_CONSOLE_PATH'));

class AgentRulesEnforcer {
    constructor() {
        this.rules = agentRules.rules;
        this.protectedFiles = ['agentRules.js'];
    }

    async logViolation(rule, context, details) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] RULE VIOLATION:\nRule: ${rule}\nContext: ${context}\nDetails: ${details}\n\n`;
        try {
            await fs.appendFile(logFilePath, logEntry, 'utf8');
        } catch (error) {
            console.error('Failed to log rule violation:', error);
        }
    }

    isProtectedFile(filePath) {
        return this.protectedFiles.some(file => filePath.includes(file));
    }

    async validateFileChange(filePath, content) {
        // Check if trying to modify protected files
        if (this.isProtectedFile(filePath)) {
            await this.logViolation(
                'Do not touch or edit this file - it is reserved for owner updates only.',
                'File Modification Attempt',
                `Attempted to modify protected file: ${filePath}`
            );
            return false;
        }

        // Check for mock data
        const mockDataPatterns = [
            /Math\.random\(\)/,
            /simulate/,
            /mock/,
            /fake/,
            /dummy/
        ];

        const hasMockData = mockDataPatterns.some(pattern => pattern.test(content));
        if (hasMockData) {
            await this.logViolation(
                'No mock data ever, use real blockchain data only.',
                'Mock Data Detection',
                `Found potential mock data in file: ${filePath}`
            );
            return false;
        }

        // Check for quick fixes
        const quickFixPatterns = [
            /\/\/ TODO/,
            /\/\/ FIXME/,
            /\/\/ HACK/,
            /\/\/ TEMPORARY/
        ];

        const hasQuickFix = quickFixPatterns.some(pattern => pattern.test(content));
        if (hasQuickFix) {
            await this.logViolation(
                'No emergency fixes or quick patches, find and fix the issue at the core.',
                'Quick Fix Detection',
                `Found potential quick fix in file: ${filePath}`
            );
            return false;
        }

        // Check for proper error handling
        const hasErrorHandling = /try\s*{|catch\s*\(/g.test(content);
        if (!hasErrorHandling) {
            await this.logViolation(
                'Always check for errors and proper pathing in the entire codebase after fixing, building, or upgrading.',
                'Error Handling Check',
                `Missing error handling in file: ${filePath}`
            );
            return false;
        }

        return true;
    }

    async validateModuleSize(filePath, content) {
        const lines = content.split('\n').length;
        if (lines > 500) {
            await this.logViolation(
                'Modularize code over 500 lines into separate, reusable modules.',
                'Module Size Check',
                `File ${filePath} exceeds 500 lines (${lines} lines)`
            );
            return false;
        }
        return true;
    }

    async validateNamingConventions(filePath, content) {
        // Check for camelCase variables
        const camelCasePattern = /let\s+[a-z][a-zA-Z]*\s*=|const\s+[a-z][a-zA-Z]*\s*=|var\s+[a-z][a-zA-Z]*\s*=/g;
        const hasInvalidVariables = content.match(/let\s+[A-Z]|const\s+[A-Z]|var\s+[A-Z]/g);
        
        if (hasInvalidVariables) {
            await this.logViolation(
                'Use consistent naming conventions (e.g., camelCase for variables, PascalCase for components).',
                'Naming Convention Check',
                `Found invalid variable naming in file: ${filePath}`
            );
            return false;
        }

        return true;
    }
}

// Export a singleton instance
export const agentRulesEnforcer = new AgentRulesEnforcer(); 