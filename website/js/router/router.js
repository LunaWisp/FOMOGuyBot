// website/js/router/router.js

// Router version flag - makes it easy to check if router is working
window.ROUTER_VERSION = "1.0.0";

// Try to import page components, with graceful fallbacks
let loadDashboard, loadTokenTracker, loadAnalytics, loadSettings;

console.log('Router module loading...');

try {
  // Import the page modules
  console.log('Trying to load dashboard module');
  const dashboardModule = await import('../pages/dashboard/dashboard.js');
  loadDashboard = dashboardModule.loadDashboard;
  console.log('Dashboard module loaded successfully');
} catch (error) {
  console.error('Dashboard module import failed:', error);
  loadDashboard = () => {
    console.log('Dashboard loaded (fallback)');
    return { initialize: () => {}, cleanup: () => {} };
  };
}

try {
  console.log('Trying to load token tracker module');
  const tokenModule = await import('../pages/tokenTracker/tokenTracker.js');
  loadTokenTracker = tokenModule.loadTokenTracker;
  console.log('Token tracker module loaded successfully');
} catch (error) {
  console.error('Token Tracker module import failed:', error);
  loadTokenTracker = () => {
    console.log('Token Tracker loaded (fallback)');
    return { 
      initialize: () => {
        console.log('Token Tracker initialized (fallback)');
      }, 
      cleanup: () => {
        console.log('Token Tracker cleaned up (fallback)');
      } 
    };
  };
}

try {
  console.log('Trying to load analytics module');
  const analyticsModule = await import('../pages/analytics/analytics.js');
  loadAnalytics = analyticsModule.loadAnalytics;
  console.log('Analytics module loaded successfully');
} catch (error) {
  console.error('Analytics module import failed:', error);
  loadAnalytics = () => {
    console.log('Analytics loaded (fallback)');
    return { initialize: () => {}, cleanup: () => {} };
  };
}

try {
  console.log('Trying to load settings module');
  const settingsModule = await import('../pages/settings/settings.js');
  loadSettings = settingsModule.loadSettings;
  console.log('Settings module loaded successfully');
} catch (error) {
  console.error('Settings module import failed:', error);
  loadSettings = () => {
    console.log('Settings loaded (fallback)');
    return { initialize: () => {}, cleanup: () => {} };
  };
}

// Define routes
const routes = {
  'dashboard': loadDashboard,
  'tokenTracker': loadTokenTracker,
  'analytics': loadAnalytics,
  'settings': loadSettings
};

// Page loading instances
const pageInstances = {};

// Check if DirectNav is handling navigation
function isDirectNavActive() {
  return typeof DirectNav !== 'undefined';
}

// Create content loader
function loadContent(pageId) {
  // If DirectNav is active, let it handle the content switching
  if (isDirectNavActive()) {
    console.log(`Router: DirectNav active, delegating content loading for ${pageId}`);
    DirectNav.navigateTo(pageId);
    return;
  }

  console.log(`Router: Loading content for: ${pageId}`);
  
  // Hide all content sections first
  const allSections = document.querySelectorAll('.content-section');
  console.log(`Router: Found ${allSections.length} content sections`);
  allSections.forEach(section => {
    section.classList.add('hidden');
    console.log(`Router: Hiding section: ${section.id}`);
  });
  
  // Show only the requested section
  const section = document.getElementById(pageId);
  if (section) {
    section.classList.remove('hidden');
    console.log(`Router: Showing section: ${pageId}`);
    
    // Update the active sidebar button
    const sidebarButtons = document.querySelectorAll('.sidebar-btn');
    sidebarButtons.forEach(btn => {
      if (btn.dataset.page === pageId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  } else {
    console.error(`Router: Section not found for page: ${pageId}`);
  }
}

// Navigate to a specific page
function navigateTo(pageId) {
  // If DirectNav is active, let it handle the navigation
  if (isDirectNavActive()) {
    console.log(`Router: DirectNav active, delegating navigation to ${pageId}`);
    DirectNav.navigateTo(pageId);
    return;
  }
  
  console.log(`Router: Navigating to: ${pageId}`);
  
  // Clean up existing page if needed
  Object.keys(pageInstances).forEach(id => {
    if (id !== pageId && pageInstances[id] && typeof pageInstances[id].cleanup === 'function') {
      console.log(`Router: Cleaning up page: ${id}`);
      pageInstances[id].cleanup();
    }
  });
  
  // Load the new page
  if (routes[pageId]) {
    try {
      // Check if we need to create a new instance or reuse existing
      if (!pageInstances[pageId]) {
        console.log(`Router: Creating new instance for: ${pageId}`);
        pageInstances[pageId] = routes[pageId]();
      } else if (typeof pageInstances[pageId].initialize === 'function') {
        // Re-initialize existing instance
        console.log(`Router: Re-initializing existing instance for: ${pageId}`);
        pageInstances[pageId].initialize();
      }
      console.log(`Router: Loaded: ${pageId}`);
    } catch (error) {
      console.error(`Router: Load failed for ${pageId}:`, error);
    }
  } else {
    console.error(`Router: No route for: ${pageId}`);
  }
  
  // Always ensure the proper section is visible
  loadContent(pageId);
}

// Router initialization
export function initRouter() {
  window.ROUTER_INITIALIZED = true;
  console.log("Router: Router initialization started");
  
  // If DirectNav is handling navigation, just set up the pages
  if (isDirectNavActive()) {
    console.log("Router: DirectNav detected, setting up pages only");
    
    // Initialize the pages based on the current hash
    const hash = window.location.hash.substring(1) || 'dashboard';
    if (routes[hash]) {
      try {
        pageInstances[hash] = routes[hash]();
        console.log(`Router: Initialized page ${hash} via DirectNav`);
      } catch (error) {
        console.error(`Router: Failed to initialize page ${hash}:`, error);
      }
    }
    
    return;
  }
  
  const buttons = document.querySelectorAll('.sidebar-btn');
  console.log(`Router: Found ${buttons.length} sidebar buttons`);
  
  if (buttons.length === 0) {
    console.error('Router: No sidebar buttons found - check DOM');
    return;
  }
  
  // First, hide all sections
  const allSections = document.querySelectorAll('.content-section');
  console.log(`Router: Hiding all ${allSections.length} content sections initially`);
  allSections.forEach(section => {
    section.classList.add('hidden');
  });
  
  // Set up click event listeners for sidebar buttons
  buttons.forEach(button => {
    const page = button.dataset.page;
    console.log(`Router: Setting up listener for page: ${page}`);
    
    button.addEventListener('click', (e) => {
      e.preventDefault();
      console.log(`Router: Clicked: ${page}`);
      
      // Update the URL hash
      window.location.hash = page;
      
      // Navigate to the page
      navigateTo(page);
    });
  });
  
  // Handle hash changes in URL
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    const page = hash.substring(1);
    console.log(`Router: Hash changed to: ${page}`);
    if (page && routes[page]) {
      navigateTo(page);
    }
  });
  
  // Handle initial page on load
  const hash = window.location.hash;
  console.log(`Router: Initial hash: ${hash}`);
  if (hash) {
    const page = hash.substring(1);
    if (routes[page]) {
      console.log(`Router: Loading initial page: ${page}`);
      navigateTo(page);
    } else {
      // Default to dashboard if invalid hash
      console.log('Router: Invalid hash, defaulting to dashboard');
      window.location.hash = 'dashboard';
    }
  } else {
    // Default to dashboard if no hash
    console.log('Router: No hash, defaulting to dashboard');
    window.location.hash = 'dashboard';
    navigateTo('dashboard');
  }
  
  console.log("Router: Router initialization completed");
} 