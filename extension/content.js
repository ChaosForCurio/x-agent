/**
 * Content script to extract page information.
 */
function extractPageData() {
    const title = document.title;
    const description = document.querySelector('meta[name="description"]')?.content || "";

    // Get a snippet of the main content
    // We prioritize 'article', 'main', or just body text
    const mainElement = document.querySelector('article') || document.querySelector('main') || document.body;
    const textContent = mainElement.innerText.substring(0, 500).replace(/\s+/g, ' ').trim();

    return {
        title,
        description,
        url: window.location.href,
        contentSnippet: textContent
    };
}

// Listen for messages from the background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractData") {
        sendResponse(extractPageData());
    }
    return true; // Keep the message channel open for async response
});
