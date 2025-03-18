/**
 * Creates the actions section of a token card
 * @returns {string} The HTML for the token actions
 */
function createTokenActions() {
    return `
        <div class="token-actions">
            <button class="view-analytics" title="View Analytics">
                📈
            </button>
            <button class="remove-token" title="Remove Token">
                ❌
            </button>
        </div>
    `;
}

export { createTokenActions }; 