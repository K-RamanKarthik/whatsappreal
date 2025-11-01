// Universal Spam Detector - Content Script

let enabled = true;
let showWarnings = true;
let threshold = 30;

// Basic spam keywords — you can customize this list
const spamWords = [
    "free money",
    "click here",
    "urgent offer",
    "win big",
    "limited time",
    "congratulations",
    "claim your prize",
    "easy cash",
    "guaranteed income"
];

// Initial load: read user settings
chrome.storage.sync.get(["enabled", "threshold", "showWarnings"], (result) => {
    enabled = result.enabled !== undefined ? result.enabled : true;
    threshold = result.threshold || 30;
    showWarnings = result.showWarnings !== undefined ? result.showWarnings : true;

    if (enabled) scanPage();
});

// Listen for popup messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case "toggle":
            enabled = message.enabled;
            if (enabled) scanPage();
            else clearHighlights();
            break;

        case "toggleWarnings":
            showWarnings = message.showWarnings;
            break;

        case "updateThreshold":
            threshold = message.threshold;
            break;

        case "rescan":
            if (enabled) {
                clearHighlights();
                scanPage();
                sendResponse({ success: true });
            }
            break;
    }
});

// --- Spam Detection Logic ---

function scanPage() {
    if (!enabled) return;

    const textNodes = getTextNodes(document.body);
    textNodes.forEach((node) => {
        const text = node.textContent.toLowerCase();
        let score = calculateSpamScore(text);
        if (score >= threshold) {
            highlightText(node);
            if (showWarnings) showTooltip(node, score);
        }
    });
}

function clearHighlights() {
    document.querySelectorAll(".spam-highlight").forEach((el) => {
        el.classList.remove("spam-highlight");
        const tooltip = el.querySelector(".spam-tooltip");
        if (tooltip) tooltip.remove();
    });
}

function calculateSpamScore(text) {
    let score = 0;
    for (const word of spamWords) {
        if (text.includes(word)) score += 20;
    }
    return Math.min(score, 100);
}

// --- DOM Utilities ---

function getTextNodes(element) {
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode(node) {
                const trimmed = node.textContent.trim();
                if (!trimmed) return NodeFilter.FILTER_REJECT;
                if (trimmed.length < 10) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
}

function highlightText(node) {
    const span = document.createElement("span");
    span.className = "spam-highlight";
    span.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
    span.style.borderRadius = "3px";
    span.style.transition = "background 0.3s ease";
    node.parentNode.replaceChild(span, node);
    span.appendChild(node);
}

function showTooltip(node, score) {
    const tooltip = document.createElement("div");
    tooltip.className = "spam-tooltip";
    tooltip.textContent = `Spam score: ${score}%`;
    tooltip.style.position = "absolute";
    tooltip.style.background = "#ff5555";
    tooltip.style.color = "#fff";
    tooltip.style.fontSize = "12px";
    tooltip.style.padding = "2px 6px";
    tooltip.style.borderRadius = "4px";
    tooltip.style.zIndex = "99999";
    tooltip.style.pointerEvents = "none";
    tooltip.style.transform = "translateY(-1.5em)";
    node.parentElement.style.position = "relative";
    node.parentElement.appendChild(tooltip);

    setTimeout(() => tooltip.remove(), 2000);
}
