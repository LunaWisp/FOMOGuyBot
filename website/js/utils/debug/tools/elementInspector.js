/**
 * Element Inspector
 * Tools for inspecting element details and attributes
 */

/**
 * Inspect all buttons in a container and log their details
 * @param {HTMLElement} container - Container to inspect
 * @param {string} section - Section name for logging
 * @returns {Array} - Array of button objects with metadata
 */
export function inspectAllButtons(container = document, section = 'unknown') {
    const buttons = container.querySelectorAll(
        'button, a[href], [role="button"], [type="submit"], .btn, .button, [data-action], [onclick]'
    );
    
    console.log(`Inspecting ${buttons.length} buttons in ${section}`);
    
    const buttonInfo = [];
    
    buttons.forEach(button => {
        const info = inspectElement(button);
        buttonInfo.push(info);
    });
    
    // Log detailed breakdown of buttons
    logButtonBreakdown(buttonInfo, section);
    
    return buttonInfo;
}

/**
 * Log a breakdown of buttons by type and event handlers
 * @param {Array} buttonInfo - Array of button info objects
 * @param {string} section - Section name
 */
function logButtonBreakdown(buttonInfo, section) {
    // Count buttons by type
    const typeCount = {};
    buttonInfo.forEach(info => {
        typeCount[info.type] = (typeCount[info.type] || 0) + 1;
    });
    
    // Count buttons by handler status
    const handlerStats = {
        withHandlers: 0,
        withoutHandlers: 0,
        href: 0,
        form: 0,
        dataAction: 0
    };
    
    buttonInfo.forEach(info => {
        if (info.hasHandlers) {
            handlerStats.withHandlers++;
        } else {
            handlerStats.withoutHandlers++;
        }
        
        if (info.href) handlerStats.href++;
        if (info.form) handlerStats.form++;
        if (info.attributes['data-action']) handlerStats.dataAction++;
    });
    
    console.log(`Button breakdown for ${section}:`, {
        total: buttonInfo.length,
        byType: typeCount,
        handlerStats
    });
    
    // Log potential issues
    if (handlerStats.withoutHandlers > 0) {
        console.warn(`Found ${handlerStats.withoutHandlers} buttons without visible handlers in ${section}`, {
            buttons: buttonInfo.filter(info => !info.hasHandlers).map(b => ({ 
                id: b.id, 
                text: b.text, 
                type: b.type 
            }))
        });
    }
}

/**
 * Inspect an element and return detailed information
 * @param {HTMLElement} element - Element to inspect
 * @returns {Object} - Element information
 */
export function inspectElement(element) {
    if (!element || !(element instanceof HTMLElement)) {
        return null;
    }
    
    // Basic info
    const tag = element.tagName.toLowerCase();
    const id = element.id;
    const classList = Array.from(element.classList);
    const text = element.textContent?.trim();
    
    // Element type
    let type = tag;
    if (tag === 'input') {
        type = `${tag}[${element.type || 'text'}]`;
    } else if (element.getAttribute('role')) {
        type = `${tag}[role=${element.getAttribute('role')}]`;
    }
    
    // Extract attributes
    const attributes = {};
    for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        attributes[attr.name] = attr.value;
    }
    
    // Check for event handlers
    const hasOnClick = !!element.onclick;
    const hasOnClickAttr = !!element.getAttribute('onclick');
    const hasHref = tag === 'a' && !!element.getAttribute('href');
    const hasForm = tag === 'button' && !!element.form;
    const hasAction = !!element.getAttribute('data-action');
    
    const hasHandlers = hasOnClick || hasOnClickAttr || hasHref || hasForm || hasAction;
    
    // Check if inspected element is rendered and visible
    const rect = element.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0 && 
                    window.getComputedStyle(element).display !== 'none' && 
                    window.getComputedStyle(element).visibility !== 'hidden';
    
    // Create result object
    return {
        element,
        tag,
        type,
        id,
        classList,
        text,
        attributes,
        isVisible,
        dimensions: {
            width: rect.width,
            height: rect.height
        },
        position: {
            top: rect.top,
            left: rect.left
        },
        hasHandlers,
        handlerInfo: {
            onClick: hasOnClick,
            onClickAttr: hasOnClickAttr,
            href: hasHref ? element.getAttribute('href') : null,
            form: hasForm ? (element.form.id || 'form') : null,
            action: hasAction ? element.getAttribute('data-action') : null
        }
    };
}

/**
 * Create an element path string showing the DOM hierarchy
 * @param {HTMLElement} element - Element to create path for
 * @returns {string} - Path string
 */
export function getElementPath(element) {
    if (!element || !(element instanceof HTMLElement)) {
        return '';
    }
    
    const parts = [];
    let current = element;
    
    while (current && current !== document.body) {
        let partName = current.tagName.toLowerCase();
        
        if (current.id) {
            partName += `#${current.id}`;
        } else if (current.className) {
            const classes = Array.from(current.classList).join('.');
            if (classes) {
                partName += `.${classes}`;
            }
        }
        
        parts.unshift(partName);
        current = current.parentElement;
    }
    
    return parts.join(' > ');
}

/**
 * Highlight an element in the DOM for visual debugging
 * @param {HTMLElement} element - Element to highlight
 * @param {Object} options - Options object
 * @param {string} options.color - Highlight color 
 * @param {number} options.duration - Duration in ms
 * @param {boolean} options.showInfo - Show element info tooltip
 */
export function highlightElement(element, options = {}) {
    if (!element || !(element instanceof HTMLElement)) {
        return;
    }
    
    const color = options.color || 'rgba(255, 0, 0, 0.3)';
    const duration = options.duration || 2000;
    const showInfo = options.showInfo !== false;
    
    // Create highlight overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '9999';
    overlay.style.border = `2px solid ${color}`;
    overlay.style.backgroundColor = color.replace(')', ', 0.1)');
    overlay.style.boxShadow = `0 0 0 2000px rgba(0, 0, 0, 0.1)`;
    overlay.style.transition = 'opacity 0.3s ease-in-out';
    
    // Position overlay
    const rect = element.getBoundingClientRect();
    overlay.style.top = `${rect.top + window.scrollY}px`;
    overlay.style.left = `${rect.left + window.scrollX}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    
    // Add info tooltip
    if (showInfo) {
        const tooltip = document.createElement('div');
        tooltip.style.position = 'absolute';
        tooltip.style.top = '-30px';
        tooltip.style.left = '0';
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '4px 8px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '12px';
        tooltip.style.whiteSpace = 'nowrap';
        
        // Element info
        const info = element.tagName.toLowerCase();
        const id = element.id ? `#${element.id}` : '';
        tooltip.textContent = `${info}${id}`;
        
        overlay.appendChild(tooltip);
    }
    
    // Add to DOM
    document.body.appendChild(overlay);
    
    // Fade out and remove
    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 300);
    }, duration);
    
    return overlay;
}

/**
 * Create an interactive inspector for debugging
 * Allows hovering over elements to see details
 * @param {boolean} enable - Whether to enable the inspector
 */
export function toggleInteractiveInspector(enable = true) {
    // Remove existing inspector
    const existingInspector = document.getElementById('debug-interactive-inspector');
    if (existingInspector) {
        document.body.removeChild(existingInspector);
    }
    
    if (!enable) {
        return;
    }
    
    // Create inspector container
    const inspector = document.createElement('div');
    inspector.id = 'debug-interactive-inspector';
    inspector.style.position = 'fixed';
    inspector.style.bottom = '10px';
    inspector.style.right = '10px';
    inspector.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    inspector.style.color = 'white';
    inspector.style.padding = '10px';
    inspector.style.borderRadius = '4px';
    inspector.style.zIndex = '10000';
    inspector.style.maxWidth = '300px';
    inspector.style.maxHeight = '200px';
    inspector.style.overflow = 'auto';
    inspector.style.fontSize = '12px';
    inspector.style.fontFamily = 'monospace';
    
    // Add title
    const title = document.createElement('div');
    title.textContent = 'Element Inspector';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '5px';
    inspector.appendChild(title);
    
    // Add info container
    const infoContainer = document.createElement('pre');
    infoContainer.style.margin = '0';
    infoContainer.style.whiteSpace = 'pre-wrap';
    infoContainer.textContent = 'Hover over elements to inspect';
    inspector.appendChild(infoContainer);
    
    // Add to DOM
    document.body.appendChild(inspector);
    
    // Track currently highlighted element
    let highlightedElement = null;
    
    // Add mousemove handler
    const mouseMoveHandler = (e) => {
        const target = e.target;
        
        // Skip inspector itself
        if (target === inspector || inspector.contains(target)) {
            return;
        }
        
        // Skip if same element
        if (target === highlightedElement) {
            return;
        }
        
        highlightedElement = target;
        
        // Get element info
        const info = inspectElement(target);
        
        // Update info display
        if (info) {
            const path = getElementPath(target);
            
            infoContainer.textContent = `
Path: ${path}
Tag: ${info.tag}${info.id ? ` #${info.id}` : ''}
Classes: ${info.classList.join(' ')}
Size: ${Math.round(info.dimensions.width)}×${Math.round(info.dimensions.height)}
Handlers: ${info.hasHandlers ? 'Yes' : 'No'}
Text: ${info.text?.substring(0, 30) || ''}${info.text?.length > 30 ? '...' : ''}
            `.trim();
            
            // Highlight element briefly
            highlightElement(target, { 
                color: info.hasHandlers ? 'rgba(0, 128, 255, 0.5)' : 'rgba(255, 0, 0, 0.5)',
                duration: 300,
                showInfo: false
            });
        }
    };
    
    document.addEventListener('mousemove', mouseMoveHandler);
    
    // Add click handler to log full details
    const clickHandler = (e) => {
        // Only if holding Ctrl key
        if (!e.ctrlKey) {
            return;
        }
        
        const target = e.target;
        
        // Skip inspector itself
        if (target === inspector || inspector.contains(target)) {
            return;
        }
        
        // Prevent default browser action
        e.preventDefault();
        e.stopPropagation();
        
        // Get and log element info
        const info = inspectElement(target);
        const path = getElementPath(target);
        
        console.log(`Element inspected: ${path}`, info);
        
        // Highlight element
        highlightElement(target, { duration: 1500 });
    };
    
    document.addEventListener('click', clickHandler, true);
    
    // Add cleanup function
    inspector.cleanup = () => {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('click', clickHandler, true);
        if (inspector.parentNode) {
            inspector.parentNode.removeChild(inspector);
        }
    };
    
    return inspector;
}

/**
 * Monitor an element for changes
 * @param {HTMLElement} element - Element to monitor
 * @param {Object} options - Monitoring options
 */
export function monitorElement(element, options = {}) {
    if (!element) return;
    
    const config = {
        attributes: options.attributes !== false,
        childList: options.childList !== false,
        subtree: options.subtree !== false,
        attributeFilter: options.attributeFilter || undefined
    };
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes') {
                console.log(`Attribute '${mutation.attributeName}' changed:`, {
                    element: mutation.target,
                    oldValue: mutation.oldValue,
                    newValue: mutation.target.getAttribute(mutation.attributeName)
                });
            } else if (mutation.type === 'childList') {
                if (mutation.addedNodes.length > 0) {
                    console.log('Child nodes added:', Array.from(mutation.addedNodes));
                }
                if (mutation.removedNodes.length > 0) {
                    console.log('Child nodes removed:', Array.from(mutation.removedNodes));
                }
            }
        });
    });
    
    observer.observe(element, config);
    console.log(`Now monitoring element:`, element);
    
    // Return observer so it can be disconnected later
    return observer;
}

/**
 * Find and inspect elements matching a selector
 * @param {string} selector - CSS selector
 * @param {HTMLElement} container - Container element
 */
export function findAndInspectElements(selector, container) {
    if (!selector) return;
    if (!container) container = document;
    
    const elements = container.querySelectorAll(selector);
    console.log(`Found ${elements.length} elements matching '${selector}'`);
    
    elements.forEach((element, index) => {
        console.log(`Element ${index + 1}:`, inspectElement(element));
    });
} 