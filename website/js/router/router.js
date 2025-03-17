// website/js/router/router.js
import { loadDashboard } from '../pages/dashboard/dashboard.js';
import { loadTokenTracker } from '../pages/tokenTracker/tokenTracker.js';
import { loadAnalytics } from '../pages/analytics/analytics.js';
import { loadSettings } from '../pages/settings/settings.js';

const routes = {
  'dashboard': loadDashboard,
  'token-tracker': loadTokenTracker,
  'analytics': loadAnalytics,
  'settings': loadSettings
};

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
        } catch (error) {
          console.error(`Load failed for ${page}:`, error);
        }
      } else {
        console.error(`No route for: ${page}`);
      }
    });
  });
} 