// WhatsApp Spam Detector - Popup Script

document.addEventListener('DOMContentLoaded', () => {
    // Load settings
    chrome.storage.sync.get(['enabled', 'threshold', 'showWarnings'], (result) => {
        const enabled = result.enabled !== undefined ? result.enabled : true;
        const threshold = result.threshold || 30;
        const showWarnings = result.showWarnings !== undefined ? result.showWarnings : true;

        // Set UI elements
        document.getElementById('enableToggle').checked = enabled;
        document.getElementById('warningsToggle').checked = showWarnings;
        document.getElementById('thresholdSlider').value = threshold;
        document.getElementById('thresholdValue').textContent = threshold + '%';

        updateStatus(enabled);
        updateLabels(enabled, showWarnings);
    });

    // Enable/Disable toggle
    document.getElementById('enableToggle').addEventListener('change', (e) => {
        const enabled = e.target.checked;
        chrome.storage.sync.set({ enabled }, () => {
            updateStatus(enabled);
            updateLabels(enabled, document.getElementById('warningsToggle').checked);
            
            // Notify content script
            chrome.tabs.query({ url: 'https://web.whatsapp.com/*' }, (tabs) => {
                tabs.forEach(tab => {
                    chrome.tabs.sendMessage(tab.id, { action: 'toggle', enabled });
                });
            });
        });
    });

    // Warnings toggle
    document.getElementById('warningsToggle').addEventListener('change', (e) => {
        const showWarnings = e.target.checked;
        chrome.storage.sync.set({ showWarnings }, () => {
            updateLabels(document.getElementById('enableToggle').checked, showWarnings);
            
            // Notify content script
            chrome.tabs.query({ url: 'https://web.whatsapp.com/*' }, (tabs) => {
                tabs.forEach(tab => {
                    chrome.tabs.sendMessage(tab.id, { action: 'toggleWarnings', showWarnings });
                });
            });
        });
    });

    // Threshold slider
    document.getElementById('thresholdSlider').addEventListener('input', (e) => {
        const threshold = parseInt(e.target.value);
        document.getElementById('thresholdValue').textContent = threshold + '%';
        
        chrome.storage.sync.set({ threshold }, () => {
            // Notify content script
            chrome.tabs.query({ url: 'https://web.whatsapp.com/*' }, (tabs) => {
                tabs.forEach(tab => {
                    chrome.tabs.sendMessage(tab.id, { action: 'updateThreshold', threshold });
                });
            });
        });
    });

    // Rescan button
    document.getElementById('rescanButton').addEventListener('click', () => {
        chrome.tabs.query({ url: 'https://web.whatsapp.com/*' }, (tabs) => {
            if (tabs.length === 0) {
                alert('Please open WhatsApp Web first!');
                return;
            }

            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, { action: 'rescan' }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError);
                    } else {
                        // Visual feedback
                        const button = document.getElementById('rescanButton');
                        button.textContent = '✓ Rescanned!';
                        button.style.background = '#2ecc71';
                        setTimeout(() => {
                            button.textContent = 'Rescan Messages';
                            button.style.background = '#25D366';
                        }, 2000);
                    }
                });
            });
        });
    });
});

function updateStatus(enabled) {
    const indicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    
    if (enabled) {
        indicator.classList.remove('inactive');
        statusText.textContent = 'Active';
    } else {
        indicator.classList.add('inactive');
        statusText.textContent = 'Inactive';
    }
}

function updateLabels(enabled, showWarnings) {
    document.getElementById('enableLabel').textContent = enabled ? 'Enabled' : 'Disabled';
    document.getElementById('warningsLabel').textContent = showWarnings ? 'Enabled' : 'Disabled';
}

