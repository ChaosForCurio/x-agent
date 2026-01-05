/**
 * Background Service Worker - Advanced Version
 */

// Simulation of real AI providers
async function callGeminiAPI(prompt, apiKey) {
    // Structure for a real Gemini API call
    /*
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
    */
    return "[Gemini Draft] " + simulatePost(prompt);
}

async function callOpenAIAPI(prompt, apiKey) {
    // Structure for a real OpenAI API call
    /*
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }]
        })
    });
    const data = await response.json();
    return data.choices[0].message.content;
    */
    return "[OpenAI Draft] " + simulatePost(prompt);
}

function simulatePost(prompt) {
    // Heuristic template
    return "Check this out! 🚀 " + prompt.split("Title: ")[1].split("\n")[0];
}

// Main logic
async function generatePost(pageData, settings) {
    const { title, contentSnippet, url } = pageData;
    const { aiProvider, apiKey } = settings || {};

    const prompt = `Create a short, engaging X (Twitter) post about this page: 
Title: ${title}
Content: ${contentSnippet}
URL: ${url}`;

    if (aiProvider === 'gemini' && apiKey) {
        return await callGeminiAPI(prompt, apiKey);
    } else if (aiProvider === 'openai' && apiKey) {
        return await callOpenAIAPI(prompt, apiKey);
    }

    // Default template
    return `🚀 Interesting read: "${title}"\n\n${contentSnippet.substring(0, 100)}...\n\nRead more here: ${url}`;
}

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "generatePost") {
        generatePost(request.pageData, request.settings).then(post => {
            sendResponse({ post });
        });
        return true;
    }

    if (request.action === "postSuccess") {
        console.log("[XAgent] Post confirmed successfully");
        // We could trigger a notification here
    }
});
