/**
 * Consolidated Debug Utility
 * Combines functionality from:
 * - fixESModuleExport.js
 * - fixDebugTool.js
 * - fixModules.js
 * - logAggregator.js
 * - captureErrors.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Configuration
const rootDir = path.resolve(__dirname, '..');
const logDir = path.join(rootDir, 'logs');
const backupDir = path.join(rootDir, '.bak');
const aggregatedLogPath = path.join(__dirname, 'debug-local.log');

// Ensure directories exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Clear previous log
fs.writeFileSync(aggregatedLogPath, `=== CONSOLIDATED DEBUG LOG ===\nCreated: ${new Date().toISOString()}\n\n`);

// Helper for logging
function log(message) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(aggregatedLogPath, formattedMessage);
}

// Helper for capturing errors
process.on('uncaughtException', (error) => {
  log(`UNCAUGHT EXCEPTION: ${error.message}`);
  log(error.stack);
});

// Begin debugging process
log('Starting consolidated debug process...');
log(`System: ${os.platform()} ${os.release()}, Node ${process.version}`);

/**
 * PART 1: Fix ES Module Export Issue
 */
function fixESModuleExport() {
  log('\n=== FIXING ES MODULE EXPORT ISSUES ===');
  
  const debugIndexPath = path.join(rootDir, 'website', 'js', 'utils', 'debug', 'index.js');
  const backupPath = path.join(backupDir, 'debug-index.js.bak');
  
  if (!fs.existsSync(debugIndexPath)) {
    log(`File not found: ${debugIndexPath}`);
    return false;
  }
  
  // Create backup
  try {
    const content = fs.readFileSync(debugIndexPath, 'utf8');
    fs.writeFileSync(backupPath, content);
    log(`Backup created at: ${backupPath}`);
  } catch (error) {
    log(`Error creating backup: ${error.message}`);
    return false;
  }
  
  // Fix the file
  try {
    let content = fs.readFileSync(debugIndexPath, 'utf8');
    
    if (content.includes('export { debugTool, debugTools }')) {
      log('Found ES module export statement. Applying fix...');
      
      // Remove ES module export
      content = content.replace(/\s*export\s*\{\s*debugTool\s*,\s*debugTools\s*\}\s*;?/g, '');
      
      // Ensure CommonJS export exists
      if (!content.includes('module.exports')) {
        content += '\n// Export for CommonJS\nmodule.exports = { debugTool, debugTools };\n';
      }
      
      // Write fixed content
      fs.writeFileSync(debugIndexPath, content);
      log('SUCCESS: Removed ES module export statement.');
    } else {
      log('ES module export statement not found. File may have been fixed already.');
    }
    
    return true;
  } catch (error) {
    log(`Error fixing ES module export: ${error.message}`);
    return false;
  }
}

/**
 * PART 2: Fix Module Issues
 */
function fixModules() {
  log('\n=== FIXING MODULE ISSUES ===');
  
  const problematicPatterns = [
    { 
      pattern: 'import {', 
      fix: 'require', 
      desc: 'ES Module import in CommonJS context' 
    },
    { 
      pattern: 'export default', 
      fix: 'module.exports =', 
      desc: 'ES Module export in CommonJS context' 
    },
    { 
      pattern: 'export const', 
      fix: 'const', 
      desc: 'ES Module export in CommonJS context' 
    }
  ];
  
  // Directories to check
  const dirsToCheck = [
    path.join(rootDir, 'website', 'js'),
    path.join(rootDir, 'website', 'utils'),
    path.join(rootDir, 'website', 'lib')
  ];
  
  let fixCount = 0;
  
  // Process JS files in the specified directories
  dirsToCheck.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    
    const processDir = (currentDir) => {
      const files = fs.readdirSync(currentDir, { withFileTypes: true });
      
      files.forEach(file => {
        const filePath = path.join(currentDir, file.name);
        
        if (file.isDirectory()) {
          processDir(filePath);
        } else if (file.name.endsWith('.js')) {
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            let modified = false;
            let newContent = content;
            
            // Check for problematic patterns
            problematicPatterns.forEach(({ pattern, fix, desc }) => {
              if (content.includes(pattern)) {
                log(`Found ${desc} in ${filePath}`);
                // Create backup before fixing
                const backupPath = path.join(backupDir, file.name + '.bak');
                if (!modified) {
                  fs.writeFileSync(backupPath, content);
                  modified = true;
                }
                
                // Apply specific fixes based on the pattern
                if (pattern === 'import {') {
                  // Replace import { x } from 'y' with const { x } = require('y')
                  newContent = newContent.replace(
                    /import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g,
                    'const {$1} = require(\'$2\')'
                  );
                } else if (pattern === 'export default') {
                  // Replace export default x with module.exports = x
                  newContent = newContent.replace(
                    /export\s+default\s+/g,
                    'module.exports = '
                  );
                } else if (pattern === 'export const') {
                  // Handle export const patterns (more complex)
                  const exportLines = [];
                  const constLines = [];
                  
                  // First pass: convert export const to const and record the exports
                  newContent = newContent.replace(
                    /export\s+const\s+(\w+)\s*=/g,
                    (match, varName) => {
                      exportLines.push(varName);
                      return `const ${varName} =`;
                    }
                  );
                  
                  // Add exports at the end
                  if (exportLines.length > 0 && !newContent.includes('module.exports')) {
                    newContent += `\n\nmodule.exports = { ${exportLines.join(', ')} };\n`;
                  }
                }
                
                fixCount++;
              }
            });
            
            if (modified) {
              fs.writeFileSync(filePath, newContent);
              log(`Fixed module issues in ${filePath}`);
            }
          } catch (error) {
            log(`Error processing ${filePath}: ${error.message}`);
          }
        }
      });
    };
    
    try {
      processDir(dir);
    } catch (error) {
      log(`Error scanning directory ${dir}: ${error.message}`);
    }
  });
  
  log(`Module fixes applied: ${fixCount}`);
  return fixCount > 0;
}

/**
 * PART 3: Aggregate Logs
 */
function aggregateLogs() {
  log('\n=== AGGREGATING LOGS ===');
  
  // List of potential log files to check
  const logFilePaths = [
    path.join(logDir, 'npm-debug-raw.log'),
    path.join(logDir, 'npm-debug-parsed.log'),
    path.join(logDir, 'module-fixes.log'),
    path.join(logDir, 'debug-tool-fix.log'),
    path.join(logDir, 'console.log')
  ];
  
  // Launch log
  const launchLogPath = path.join(rootDir, 'launcher.log');
  if (fs.existsSync(launchLogPath)) {
    logFilePaths.push(launchLogPath);
  }
  
  // Function to process log file
  function processLogFile(filePath, maxLines = 500) {
    if (!fs.existsSync(filePath)) {
      return `File not found: ${filePath}\n`;
    }
    
    const fileName = path.basename(filePath);
    let content = `\n--- ${fileName} ---\n`;
    
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const lines = fileContent.split('\n');
      
      // Analyze lines to extract errors
      let errorCount = 0;
      let moduleIssues = [];
      let syntaxErrors = [];
      let otherErrors = [];
      
      for (let i = 0; i < lines.length && i < maxLines; i++) {
        const line = lines[i];
        
        if (!line.trim()) continue;
        
        // Categorize the line
        if (line.includes('SyntaxError') || line.includes('Unexpected token')) {
          syntaxErrors.push(line);
          errorCount++;
        } else if (line.includes('Cannot find module') || 
                 line.includes('does not provide an export') ||
                 line.includes('MODULE_')) {
          moduleIssues.push(line);
          errorCount++;
        } else if (line.includes('Error:') || line.includes('error') || 
                  line.toLowerCase().includes('fail')) {
          otherErrors.push(line);
          errorCount++;
        }
      }
      
      // Summarize errors
      content += `File Size: ${(fileContent.length / 1024).toFixed(2)} KB\n`;
      content += `Total Error Count: ${errorCount}\n`;
      
      // Show critical issues
      if (syntaxErrors.length > 0) {
        content += `\n--- SYNTAX ERRORS (${syntaxErrors.length}) ---\n`;
        syntaxErrors.slice(0, 5).forEach(err => {
          content += `${err}\n`;
        });
        content += syntaxErrors.length > 5 ? `... plus ${syntaxErrors.length - 5} more\n` : '';
      }
      
      if (moduleIssues.length > 0) {
        content += `\n--- MODULE ISSUES (${moduleIssues.length}) ---\n`;
        moduleIssues.slice(0, 5).forEach(err => {
          content += `${err}\n`;
        });
        content += moduleIssues.length > 5 ? `... plus ${moduleIssues.length - 5} more\n` : '';
      }
      
      if (otherErrors.length > 0) {
        content += `\n--- OTHER ERRORS (${otherErrors.length}) ---\n`;
        otherErrors.slice(0, 5).forEach(err => {
          content += `${err}\n`;
        });
        content += otherErrors.length > 5 ? `... plus ${otherErrors.length - 5} more\n` : '';
      }
      
    } catch (error) {
      content += `Error reading file: ${error.message}\n`;
    }
    
    return content;
  }
  
  // Scan for additional log files
  try {
    const logsInDir = fs.readdirSync(logDir);
    logsInDir.forEach(file => {
      if (file.endsWith('.log') && !logFilePaths.includes(path.join(logDir, file))) {
        logFilePaths.push(path.join(logDir, file));
      }
    });
  } catch (error) {
    log(`Error scanning logs directory: ${error.message}`);
  }
  
  // Process each log file
  logFilePaths.forEach(filePath => {
    log(`Processing log: ${path.basename(filePath)}`);
    const processedContent = processLogFile(filePath);
    fs.appendFileSync(aggregatedLogPath, processedContent);
  });
  
  // Add error pattern analysis
  analyzeErrorPatterns();
  
  log(`Log aggregation complete. See ${aggregatedLogPath} for results.`);
  return true;
}

/**
 * PART 4: Analyze Error Patterns
 */
function analyzeErrorPatterns() {
  log('\n=== ANALYZING ERROR PATTERNS ===');
  
  fs.appendFileSync(aggregatedLogPath, '\n\n=== ERROR PATTERN ANALYSIS ===\n');
  
  // Check index.js for ES module issues
  try {
    const indexJsPath = path.join(rootDir, 'website', 'js', 'utils', 'debug', 'index.js');
    if (fs.existsSync(indexJsPath)) {
      const content = fs.readFileSync(indexJsPath, 'utf8');
      
      fs.appendFileSync(aggregatedLogPath, `\n--- INDEX.JS ANALYSIS ---\n`);
      fs.appendFileSync(aggregatedLogPath, `File: ${indexJsPath}\n`);
      
      // Check for ES module export statement
      if (content.includes('export {')) {
        fs.appendFileSync(aggregatedLogPath, '\nISSUE: ES Module export found in CommonJS context\n');
        fs.appendFileSync(aggregatedLogPath, 'FIX: Replace "export { ... };" with "module.exports = { ... };"\n');
      }
    }
  } catch (error) {
    log(`Error analyzing index.js: ${error.message}`);
  }
  
  // Check launch.js
  try {
    const launchJsPath = path.join(rootDir, 'launch.js');
    if (fs.existsSync(launchJsPath)) {
      const content = fs.readFileSync(launchJsPath, 'utf8');
      
      fs.appendFileSync(aggregatedLogPath, `\n--- LAUNCH.JS ANALYSIS ---\n`);
      
      // Check if launch.js is requiring debug/index.js
      if (content.includes('debug/index.js')) {
        fs.appendFileSync(aggregatedLogPath, '\nISSUE: launch.js requires debug/index.js which uses ES Module syntax\n');
        fs.appendFileSync(aggregatedLogPath, 'FIX: Update the export in debug/index.js to CommonJS style\n');
      }
    }
  } catch (error) {
    log(`Error analyzing launch.js: ${error.message}`);
  }
  
  // Add recommendations
  fs.appendFileSync(aggregatedLogPath, '\n\n=== RECOMMENDATIONS ===\n');
  fs.appendFileSync(aggregatedLogPath, '1. Run this script with the "fix" flag to automatically fix ES module issues\n');
  fs.appendFileSync(aggregatedLogPath, '2. Check package.json - consider adding "type": "module" if you want to use ES modules\n');
  fs.appendFileSync(aggregatedLogPath, '3. Restart the server with: npm run dev\n');
  
  return true;
}

/**
 * PART 5: Run the Server for Testing
 */
function runServer() {
  log('\n=== TESTING SERVER ===');
  log('Starting the server with npm run dev...');
  
  try {
    fs.appendFileSync(aggregatedLogPath, '\n\n=== SERVER TEST ===\n');
    
    // Try to run the server and capture output
    try {
      const output = execSync('npm run dev', { 
        cwd: rootDir,
        timeout: 5000, // 5 seconds timeout
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      fs.appendFileSync(aggregatedLogPath, output);
      log('Server started successfully!');
      
    } catch (error) {
      fs.appendFileSync(aggregatedLogPath, error.stdout || '');
      fs.appendFileSync(aggregatedLogPath, error.stderr || '');
      
      log('Server failed to start. See log for details.');
      log(error.message);
      
      return false;
    }
    
    return true;
  } catch (error) {
    log(`Error running server: ${error.message}`);
    return false;
  }
}

// Process command line arguments
const args = process.argv.slice(2);
const shouldFix = args.includes('fix');
const shouldTest = args.includes('test');
const showHelp = args.includes('help') || args.includes('--help');

if (showHelp) {
  console.log(`
Debug-Local Utility
Usage: node debug-local.js [options]

Options:
  fix      Automatically fix detected issues
  test     Test the server after fixes
  analyze  Only analyze without fixing
  help     Show this help message

Examples:
  node debug-local.js                 Run analysis only
  node debug-local.js fix             Fix detected issues
  node debug-local.js fix test        Fix issues and test server
  `);
  process.exit(0);
}

// Run the appropriate functions based on arguments
if (shouldFix) {
  log('Running in FIX mode - will attempt to fix detected issues');
  fixESModuleExport();
  fixModules();
  aggregateLogs();
  
  if (shouldTest) {
    runServer();
  }
} else {
  log('Running in ANALYZE mode - detecting issues without fixing');
  aggregateLogs();
  
  log('\nTo fix detected issues, run: node debug-local.js fix');
}

log('\nDebug process complete. Check debug-local.log for details.');

// Create Windows batch file
const batchContent = `@echo off
echo Running Debug-Local Utility...
echo.

node "%~dp0debug-local.js" fix

echo.
echo Fixes applied. Press any key to test the server...
pause > nul
cd ${rootDir}
npm run dev
`;

const batchPath = path.join(__dirname, 'run-debug-local.bat');
fs.writeFileSync(batchPath, batchContent);
log(`Created batch file: ${batchPath}`); 