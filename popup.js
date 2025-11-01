// Universal Spam Detector - Popup Script

document.addEventListener('DOMContentLoaded', () => {
    // Load settings from storage
    chrome.storage.sync.get(['enabled', 'threshold', 'showWarnings'], (result) => {
        const enabled = result.enabled !== undefined ? result.enabled : true;
        const threshold = result.threshold || 30;
        const showWarnings = result.showWarnings !== undefined ? result.showWarnings : true;

        // Set initial UI state
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
            notifyActiveTab({ action: 'toggle', enabled });
        });
    });

    // Warnings toggle
    document.getElementById('warningsToggle').addEventListener('change', (e) => {
        const showWarnings = e.target.checked;
        chrome.storage.sync.set({ showWarnings }, () => {
            updateLabels(document.getElementById('enableToggle').checked, showWarnings);
            notifyActiveTab({ action: 'toggleWarnings', showWarnings });
        });
    });

    // Threshold slider
    document.getElementById('thresholdSlider').addEventListener('input', (e) => {
        const threshold = parseInt(e.target.value);
        document.getElementById('thresholdValue').textContent = threshold + '%';
        chrome.storage.sync.set({ threshold }, () => {
            notifyActiveTab({ action: 'updateThreshold', threshold });
        });
    });

    // Rescan button
    document.getElementById('rescanButton').addEventListener('click', () => {
        notifyActiveTab({ action: 'rescan' }, (response, error) => {
            const button = document.getElementById('rescanButton');
            if (error) {
                button.textContent = '⚠️ Error';
                button.style.background = '#e74c3c';
                setTimeout(() => resetRescanButton(button), 2000);
                return;
            }
            button.textContent = '✓ Rescanned!';
            button.style.background = '#2ecc71';
            setTimeout(() => resetRescanButton(button), 2000);
        });
    });
});

// --- Helper Functions ---

function notifyActiveTab(message, callback = () => {}) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (!tab) return;

        chrome.tabs.sendMessage(tab.id, message, (response) => {
            if (chrome.runtime.lastError) {
                console.warn('Content script not available on this page:', chrome.runtime.lastError.message);
                callback(null, true);
            } else {
                callback(response, false);
            }
        });
    });
}

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

function resetRescanButton(button) {
    button.textContent = 'Rescan Page';
    button.style.background = '#25D366';
}
