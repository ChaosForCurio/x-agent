/**
 * Popup Logic for XAgent - Advanced Version
 */

document.addEventListener("DOMContentLoaded", async () => {
    const views = {
        initial: document.getElementById("initial-view"),
        loading: document.getElementById("loading-view"),
        result: document.getElementById("result-view"),
        settings: document.getElementById("settings-view")
    };

    const btns = {
        generate: document.getElementById("generate-btn"),
        regenerate: document.getElementById("regenerate-btn"),
        post: document.getElementById("post-btn"),
        settings: document.getElementById("settings-btn"),
        back: document.getElementById("back-btn"),
        save: document.getElementById("save-settings-btn")
    };

    const inputs = {
        postContent: document.getElementById("post-content"),
        autoPost: document.getElementById("auto-post-toggle"),
        aiService: document.getElementById("ai-service"),
        apiKey: document.getElementById("api-key"),
        apiKeyGroup: document.getElementById("api-key-group")
    };

    // Load saved settings
    const settings = await chrome.storage.local.get(["autoPost", "aiProvider", "apiKey"]);
    inputs.autoPost.checked = settings.autoPost || false;
    inputs.aiService.value = settings.aiProvider || "none";
    inputs.apiKey.value = settings.apiKey || "";

    if (inputs.aiService.value !== "none") {
        inputs.apiKeyGroup.classList.remove("hidden");
    }

    function showView(viewId) {
        Object.keys(views).forEach(id => {
            views[id].classList.toggle("hidden", id !== viewId);
        });
    }

    // Toggle API Key field visibility
    inputs.aiService.addEventListener("change", () => {
        inputs.apiKeyGroup.classList.toggle("hidden", inputs.aiService.value === "none");
    });

    // Navigation
    btns.settings.addEventListener("click", () => showView("settings"));
    btns.back.addEventListener("click", () => showView("initial"));

    btns.save.addEventListener("click", async () => {
        await chrome.storage.local.set({
            autoPost: inputs.autoPost.checked,
            aiProvider: inputs.aiService.value,
            apiKey: inputs.apiKey.value
        });
        showView("initial");
    });

    // Action: Generate Post
    async function handleGenerate() {
        showView("loading");

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab.id) throw new Error("Could not find active tab");

            const pageData = await chrome.tabs.sendMessage(tab.id, { action: "extractData" });

            // Get current settings for generation
            const currentSettings = await chrome.storage.local.get(["aiProvider", "apiKey"]);

            const response = await chrome.runtime.sendMessage({
                action: "generatePost",
                pageData,
                settings: currentSettings
            });

            if (response && response.post) {
                inputs.postContent.value = response.post;
                showView("result");
            } else {
                throw new Error("Failed to generate post");
            }
        } catch (error) {
            console.error("Error generating post:", error);
            alert("Error: " + (error.message || "Failed to analyze page."));
            showView("initial");
        }
    }

    // Action: Post to X
    function handlePostToX() {
        const text = encodeURIComponent(inputs.postContent.value);
        const autoPost = inputs.autoPost.checked;
        const xUrl = `https://twitter.com/intent/tweet?text=${text}${autoPost ? '&xagent=true' : ''}`;
        chrome.tabs.create({ url: xUrl });
    }

    // Event Listeners
    btns.generate.addEventListener("click", handleGenerate);
    btns.regenerate.addEventListener("click", handleGenerate);
    btns.post.addEventListener("click", handlePostToX);
});
