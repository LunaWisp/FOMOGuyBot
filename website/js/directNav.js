/**
 * Direct Navigation Script
 * Provides immediate navigation functionality regardless of router implementation
 */

// Direct navigation handler
const DirectNav = {
    init: function() {
        console.log('DirectNav: Initializing direct navigation handler');
        this.setupListeners();
        this.handleInitialNavigation();
    },
    
    setupListeners: function() {
        // Get all sidebar buttons
        const sidebarButtons = document.querySelectorAll('.sidebar-btn');
        
        // Add click event listeners
        sidebarButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const pageId = button.dataset.page;
                console.log(`DirectNav: Button clicked for ${pageId}`);
                this.navigateTo(pageId);
            });
        });
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1);
            console.log(`DirectNav: Hash changed to ${hash}`);
            if (hash) {
                this.navigateTo(hash);
            }
        });
        
        console.log('DirectNav: Event listeners set up');
    },
    
    handleInitialNavigation: function() {
        // Handle initial hash
        const hash = window.location.hash.substring(1);
        console.log(`DirectNav: Initial hash: ${hash}`);
        
        if (hash) {
            // Navigate to the hash section
            this.navigateTo(hash);
        } else {
            // Default to dashboard
            this.navigateTo('dashboard');
        }
    },
    
    navigateTo: function(pageId) {
        console.log(`DirectNav: Navigating to ${pageId}`);
        
        // Hide all sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.add('hidden');
            console.log(`DirectNav: Hiding section ${section.id}`);
        });
        
        // Show the requested section
        const targetSection = document.getElementById(pageId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            console.log(`DirectNav: Showing section ${pageId}`);
            
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
            console.error(`DirectNav: Section not found - ${pageId}`);
        }
    }
};

// Initialize the direct navigation handler once the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a short time to ensure all other scripts have loaded
    setTimeout(() => {
        DirectNav.init();
    }, 100);
}); 