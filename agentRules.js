// agentRules.js
const fs = typeof require !== 'undefined' ? require('fs') : null;
const logFilePath = 'C:\\Users\\chris\\Desktop\\FOMOBot\\logs\\console.log';

const agentRules = {
  project: 'Crypto Token Tracker Server',
  dateCreated: 'March 17, 2025',
  owner: 'LunaWisp',
  rules: {
    general: [
      'Do not touch or edit this file - it is reserved for owner updates only.',
      'npm run dev is the default for launching while testing, troubleshooting, and building. Before running, check if an active terminal is already running npm run dev; if so, use that terminal instead of starting a new one. If npm run dev is already running, do not run the command again.',
      'Modularization is mandatory - break code into reusable, separate modules.',
      'Enhance code when possible while updating fixes or resolving errors.',
      'Keep the same website design and color scheme - no unrequested UI changes.',
      'If something isn’t broken, don’t mess with it - avoid unnecessary changes.',
      'Make everything in the future with index.js files for consistency.',
      'Always check for errors and proper pathing in the entire codebase after fixing, building, or upgrading.'
    ],
    additional: [
      'Use consistent naming conventions (e.g., camelCase for variables, PascalCase for components).',
      'Comment complex logic or fixes with a brief explanation for future reference.',
      'Test changes locally before suggesting deployment - ensure npm run dev works.',
      'Backup original files before major edits to C:\\Users\\chris\\Desktop\\FOMOBot\\.bak, appending .bak to the filename (e.g., script.js.bak).',
      'Check C:\\Users\\chris\\Desktop\\FOMOBot\\logs\\console.log for live updates on console errors and logs.',
      'Check the Node terminal for errors by running npm run dev before submitting any code changes.',
      'No mock data ever, use real blockchain data only.',
      'No emergency fixes or quick patches, find and fix the issue at the core.',
      'Modularize code over 500 lines into separate, reusable modules.',
      '/end/'
    ]
  },

  displayRules: function(phase = 'START') {
    const timestamp = new Date().toISOString();
    console.groupCollapsed(`Agent Rules [${phase}] - ${timestamp}`);
    console.log('Project:', this.project);
    console.log('Owner:', this.owner);
    console.log('Date Created:', this.dateCreated);
    Object.keys(this.rules).forEach(category => {
      console.group(category.toUpperCase());
      this.rules[category].forEach((rule, index) => {
        console.log(`${index + 1}. ${rule}`);
      });
      console.groupEnd();
    });
    console.groupEnd();

    if (fs) {
      const logEntry = `[${timestamp}] RULES [${phase}]:\n${this.formatRulesForLog()}\n`;
      fs.appendFileSync(logFilePath, logEntry, 'utf8');
    }
  },

  formatRulesForLog: function() {
    let output = `Project: ${this.project}\nOwner: ${this.owner}\nDate Created: ${this.dateCreated}\n`;
    Object.keys(this.rules).forEach(category => {
      output += `${category.toUpperCase()}:\n`;
      this.rules[category].forEach((rule, index) => {
        output += `  ${index + 1}. ${rule}\n`;
      });
    });
    return output;
  }
};

// Auto-run START when loaded
agentRules.displayRules('START');

// Export for Node.js
if (typeof module !== 'undefined') {
  module.exports = agentRules;
}