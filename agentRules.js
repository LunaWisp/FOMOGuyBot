// agentRules.js
const agentRules = {
  project: 'Crypto Token Tracker Server',
  dateCreated: 'March 17, 2025',
  owner: 'You', // Replace with your name or identifier
  rules: {
    general: [
      'Do not touch or edit this file - it is reserved for owner updates only.',
      'npm run dev is the default for launching while testing, troubleshooting, and building.',
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
      '/end/'
    ]
  },

  // Function to display rules in console for agents
  displayRules: function() {
    console.groupCollapsed('Agent Rules for Crypto Token Tracker Server');
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
  }
};

// Export for use in other scripts (optional)
if (typeof module !== 'undefined') {
  module.exports = agentRules;
}

// Auto-display if run directly in a browser
if (typeof window !== 'undefined') {
  agentRules.displayRules();
}