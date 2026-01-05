/**
 * Automation script for X (Twitter)
 * Detects the xagent=true flag and automatically attempts to click the "Post" button.
 */

(function () {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('xagent') !== 'true') return;

    console.log("[XAgent] Automation triggered");

    // Helper to find and click the post button
    function tryPost() {
        // Look for the "Post" button (often data-testid="tweetButton")
        // Note: The selector might change, so we try a few common ones
        const postButton =
            document.querySelector('[data-testid="tweetButton"]') ||
            document.querySelector('[data-testid="tweetButtonInline"]') ||
            Array.from(document.querySelectorAll('button')).find(b => b.innerText === 'Post' || b.innerText === 'Tweet');

        if (postButton && !postButton.disabled) {
            console.log("[XAgent] Post button found, clicking...");
            postButton.click();

            // Optionally notify the background script that we've posted
            chrome.runtime.sendMessage({ action: "postSuccess" });

            return true;
        }
        return false;
    }

    // Poll for the button to appear (since X is an SPA)
    let attempts = 0;
    const maxAttempts = 20;
    const interval = setInterval(() => {
        attempts++;
        if (tryPost() || attempts >= maxAttempts) {
            clearInterval(interval);
            if (attempts >= maxAttempts) {
                console.warn("[XAgent] Could not find post button after 10 seconds");
            }
        }
    }, 500);
})();
