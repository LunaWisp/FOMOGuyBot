/**
 * Element Logger
 * Tools for logging and inspecting DOM elements
 */

let debugTool;

// Check if we're in a Node.js environment
const isNode = typeof window === 'undefined';

if (isNode) {
    // Import debugTool in Node.js environment
    debugTool = require('../debugTool');
} else {
    // In browser, use the global debugTool
    debugTool = window.debugTool || console;
}

/**
 * Inspect an element's properties and state
 * @param {HTMLElement} element - Element to inspect
 * @param {string} elementName - Name to identify this element in logs
 */
function inspectElement(element, elementName = 'unnamed-element') {
    if (!element) {
        debugTool.logWarning(`Element "${elementName}" not found`);
        return;
    }
    
    const elementInfo = {
        id: element.id,
        className: element.className,
        tagName: element.tagName,
        textContent: element.textContent?.substring(0, 100),
        attributes: {},
        style: {},
        boundingRect: element.getBoundingClientRect(),
        children: element.children.length,
        visible: !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length)
    };
    
    // Get all attributes
    Array.from(element.attributes || []).forEach(attr => {
        elementInfo.attributes[attr.name] = attr.value;
    });
    
    // Get computed styles
    if (window.getComputedStyle) {
        const computedStyle = window.getComputedStyle(element);
        ['display', 'visibility', 'position', 'width', 'height', 'color', 'backgroundColor'].forEach(prop => {
            elementInfo.style[prop] = computedStyle[prop];
        });
    }
    
    debugTool.logInfo(`Element inspection: ${elementName}`);
    console.log(elementInfo);
    
    return elementInfo;
}

/**
 * Inspect all buttons in a container
 * @param {HTMLElement} container - Container to search for buttons
 */
function inspectAllButtons(container) {
    if (!container) {
        debugTool.logWarning('Container not found for button inspection');
        return [];
    }
    
    const buttons = container.querySelectorAll('button');
    const buttonsInfo = [];
    
    debugTool.logInfo(`Inspecting ${buttons.length} buttons`);
    
    buttons.forEach((button, index) => {
        const buttonName = button.textContent.trim() || button.id || `button-${index}`;
        const info = inspectElement(button, buttonName);
        buttonsInfo.push(info);
    });
    
    return buttonsInfo;
}

/**
 * Monitor changes to an element
 * @param {HTMLElement} element - Element to monitor
 * @param {string} elementName - Name to identify this element in logs
 */
function monitorElement(element, elementName = 'unnamed-element') {
    if (!element) {
        debugTool.logWarning(`Element "${elementName}" not found for monitoring`);
        return;
    }
    
    debugTool.logInfo(`Starting to monitor element: ${elementName}`);
    
    // Create a MutationObserver to watch for changes
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            const mutationInfo = {
                type: mutation.type,
                target: mutation.target.tagName + (mutation.target.id ? `#${mutation.target.id}` : ''),
                timestamp: new Date().toISOString()
            };
            
            if (mutation.type === 'attributes') {
                mutationInfo.attribute = mutation.attributeName;
                mutationInfo.oldValue = mutation.oldValue;
                mutationInfo.newValue = element.getAttribute(mutation.attributeName);
            } else if (mutation.type === 'childList') {
                mutationInfo.addedNodes = mutation.addedNodes.length;
                mutationInfo.removedNodes = mutation.removedNodes.length;
            }
            
            debugTool.logInfo(`Element change detected: ${elementName}`);
            console.log(mutationInfo);
        });
    });
    
    // Start observing
    observer.observe(element, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
        attributeOldValue: true,
        characterDataOldValue: true
    });
    
    // Add visual indicator for monitored element
    const originalOutline = element.style.outline;
    element.style.outline = '1px dashed rgba(255, 0, 0, 0.5)';
    
    // Return a function to stop monitoring
    return () => {
        observer.disconnect();
        element.style.outline = originalOutline;
        debugTool.logInfo(`Stopped monitoring element: ${elementName}`);
    };
}

/**
 * Find and inspect elements matching a CSS selector
 * @param {string} selector - CSS selector to find elements
 * @param {HTMLElement} context - Context element to search within
 */
function findAndInspectElements(selector, context = document) {
    if (!selector) {
        debugTool.logWarning('No selector provided for element inspection');
        return [];
    }
    
    const elements = context.querySelectorAll(selector);
    const elementsInfo = [];
    
    debugTool.logInfo(`Found ${elements.length} elements matching "${selector}"`);
    
    elements.forEach((element, index) => {
        const elementName = element.id || `${selector}-${index}`;
        const info = inspectElement(element, elementName);
        elementsInfo.push(info);
    });
    
    return elementsInfo;
}

// Export functions
if (isNode) {
    module.exports = {
        inspectElement,
        inspectAllButtons,
        monitorElement,
        findAndInspectElements
    };
} else {
    // For browser usage with ES modules
    export {
        inspectElement,
        inspectAllButtons,
        monitorElement,
        findAndInspectElements
    };
} 