import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configPath = join(__dirname, '../../.config');

class Config {
    constructor() {
        this.config = {};
        this.loadConfigSync();
    }

    loadConfigSync() {
        try {
            const content = fs.readFileSync(configPath, 'utf8');
            const lines = content.split('\n');
            
            for (const line of lines) {
                if (line.trim() && !line.startsWith('#')) {
                    const [key, value] = line.split('=').map(s => s.trim());
                    if (key && value) {
                        this.config[key] = value;
                    }
                }
            }
        } catch (error) {
            console.error('Error loading config:', error);
            throw error; // Fail fast if config can't be loaded
        }
    }

    getString(key) {
        const value = this.config[key];
        if (value === undefined) {
            throw new Error(`Config key not found: ${key}`);
        }
        return value;
    }

    getNumber(key) {
        const value = this.config[key];
        if (value === undefined) {
            throw new Error(`Config key not found: ${key}`);
        }
        return Number(value);
    }

    getBoolean(key) {
        const value = this.config[key];
        if (value === undefined) {
            throw new Error(`Config key not found: ${key}`);
        }
        return value.toLowerCase() === 'true';
    }
}

// Export a singleton instance
export const config = new Config(); 