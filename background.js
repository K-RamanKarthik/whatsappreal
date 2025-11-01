// WhatsApp Spam Detector - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
    console.log('WhatsApp Spam Detector installed', details);
    
    // Set default settings
    chrome.storage.sync.set({
        enabled: true,
        threshold: 30,
        showWarnings: true,
        riskLevels: {
            high: true,
            medium: true,
            low: true
        }
    });
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSettings') {
        chrome.storage.sync.get(['enabled', 'threshold', 'showWarnings'], (result) => {
            sendResponse(result);
        });
        return true;
    }
    
    if (request.action === 'saveSettings') {
        chrome.storage.sync.set(request.settings, () => {
            sendResponse({success: true});
        });
        return true;
    }
});

// Keep service worker alive
chrome.runtime.onStartup.addListener(() => {
    console.log('WhatsApp Spam Detector started');
});

