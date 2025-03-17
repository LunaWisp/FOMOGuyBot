// website/js/router/router.js

// Try to import page components, with graceful fallbacks
let loadDashboard, loadTokenTracker, loadAnalytics, loadSettings;

try {
  // Import the page modules
  const dashboardModule = require('../pages/dashboard/dashboard.js');
  loadDashboard = dashboardModule.loadDashboard;
} catch (error) {
  console.log('Dashboard module import failed, using fallback');
  loadDashboard = () => console.log('Dashboard loaded (fallback)');
}

try {
  const tokenModule = require('../pages/tokenTracker/tokenTracker.js');
  loadTokenTracker = tokenModule.loadTokenTracker;
} catch (error) {
  console.log('Token Tracker module import failed, using fallback');
  loadTokenTracker = () => console.log('Token Tracker loaded (fallback)');
}

try {
  const analyticsModule = require('../pages/analytics/analytics.js');
  loadAnalytics = analyticsModule.loadAnalytics;
} catch (error) {
  console.log('Analytics module import failed, using fallback');
  loadAnalytics = () => console.log('Analytics loaded (fallback)');
}

try {
  const settingsModule = require('../pages/settings/settings.js');
  loadSettings = settingsModule.loadSettings;
} catch (error) {
  console.log('Settings module import failed, using fallback');
  loadSettings = () => console.log('Settings loaded (fallback)');
}

// Define routes
const routes = {
  'dashboard': loadDashboard,
  'tokenTracker': loadTokenTracker,
  'analytics': loadAnalytics,
  'settings': loadSettings
};

// Create fallback content loader
function loadContent(pageId) {
  const content = document.getElementById('content');
  if (!content) return;
  
  // Clear current content
  content.innerHTML = '';
  
  // Show the section for this page
  const section = document.getElementById(pageId);
  if (section) {
    section.classList.remove('hidden');
  } else {
    console.error(`Section not found for page: ${pageId}`);
  }
}

// Router initialization
export function initRouter() {
  const buttons = document.querySelectorAll('.sidebar-btn');
  console.log(`Found ${buttons.length} sidebar buttons`);
  
  if (buttons.length === 0) {
    console.error('No sidebar buttons found - check DOM');
    return;
  }
  
  buttons.forEach(button => {
    const page = button.dataset.page;
    console.log(`Listener on button for: ${page}`);
    
    button.addEventListener('click', () => {
      console.log(`Clicked: ${page}`);
      
      const content = document.getElementById('content');
      if (!content) {
        console.error('No #content div found');
        return;
      }
      
      if (routes[page]) {
        try {
          routes[page]();
          console.log(`Loaded: ${page}`);
          
          // Also ensure the proper section is visible
          loadContent(page);
        } catch (error) {
          console.error(`Load failed for ${page}:`, error);
          // Fallback to basic content display
          loadContent(page);
        }
      } else {
        console.error(`No route for: ${page}`);
        // Try to at least show the section
        loadContent(page);
      }
    });
  });
  
  // Handle initial page on load
  const hash = window.location.hash;
  if (hash) {
    const page = hash.substring(1);
    const button = document.querySelector(`.sidebar-btn[data-page="${page}"]`);
    if (button) {
      button.click();
    }
  } else {
    // Default to dashboard
    const dashboardButton = document.querySelector('.sidebar-btn[data-page="dashboard"]');
    if (dashboardButton) {
      dashboardButton.click();
    }
  }
} 