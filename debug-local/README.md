# Debug-Local Utility for FOMOBot

This directory contains a consolidated debugging utility that helps identify and fix common issues in the FOMOBot project.

## Quick Start

If you're experiencing the "SyntaxError: Unexpected token 'export'" error or other module issues, run:

```
node debug-local/debug-local.js fix
```

Or use the batch file (Windows only):
```
debug-local\run-debug-local.bat
```

## Features

This single utility replaces all previous debugging scripts by combining:

1. **ES Module Export Fix** - Corrects the ES Module syntax errors in debug/index.js
2. **Module Import/Export Fixes** - Corrects various module-related issues across the codebase
3. **Log Aggregation** - Consolidates and analyzes all log files
4. **Error Analysis** - Identifies patterns and recommends fixes
5. **Server Testing** - Tests if the server starts correctly after applying fixes

## Command Line Options

```
node debug-local.js [options]

Options:
  fix      Automatically fix detected issues
  test     Test the server after fixes
  analyze  Only analyze without fixing
  help     Show this help message

Examples:
  node debug-local.js                 Run analysis only
  node debug-local.js fix             Fix detected issues
  node debug-local.js fix test        Fix issues and test server
```

## Common Issues Fixed

### SyntaxError: Unexpected token 'export'
This occurs because files are using ES Module syntax (`export { ... }`) but Node.js is loading them as CommonJS modules.

### Module Not Found Errors
Errors related to missing modules, incorrect imports, or export format mismatches.

## Log File
After running the debugging utility, check these files:
- `debug-local/debug-local.log` - Comprehensive error report with recommendations

## Support
If issues persist after running the utility, review the log file for specific recommendations. 