// WhatsApp Spam Detector - Content Script

(function() {
    'use strict';

    // Spam detection patterns and heuristics
    const spamDetector = {
        // Common spam indicators
        patterns: {
            urls: /(https?:\/\/[^\s]+|www\.[^\s]+)/gi,
            phoneNumbers: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
            email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
            currency: /[\$£€₹]\s*\d+|\d+\s*[\$£€₹]/gi,
            urgency: /\b(urgent|limited time|act now|click here|claim now|free money|winner|congratulations|prize)\b/gi,
            suspiciousWords: /\b(bank account|transfer money|verify account|suspended|blocked|expired|reactivate)\b/gi
        },

        // Calculate spam score (0-100)
        calculateSpamScore: function(text) {
            let score = 0;
            const textLower = text.toLowerCase();

            // URL count (more URLs = higher spam score)
            const urlMatches = text.match(this.patterns.urls);
            if (urlMatches) {
                score += Math.min(urlMatches.length * 15, 40);
            }

            // Phone numbers
            const phoneMatches = text.match(this.patterns.phoneNumbers);
            if (phoneMatches && phoneMatches.length > 1) {
                score += 20;
            }

            // Email addresses
            const emailMatches = text.match(this.patterns.email);
            if (emailMatches) {
                score += 15;
            }

            // Currency mentions
            const currencyMatches = text.match(this.patterns.currency);
            if (currencyMatches) {
                score += 10;
            }

            // Urgency keywords
            const urgencyMatches = textLower.match(this.patterns.urgency);
            if (urgencyMatches) {
                score += Math.min(urgencyMatches.length * 10, 25);
            }

            // Suspicious financial keywords
            const suspiciousMatches = textLower.match(this.patterns.suspiciousWords);
            if (suspiciousMatches) {
                score += Math.min(suspiciousMatches.length * 12, 30);
            }

            // Message length (very short or very long can be spam)
            if (text.length < 20 && score > 0) {
                score += 10;
            } else if (text.length > 500) {
                score += 5;
            }

            // Multiple exclamation marks
            const exclamationCount = (text.match(/!/g) || []).length;
            if (exclamationCount > 3) {
                score += Math.min(exclamationCount * 2, 15);
            }

            // ALL CAPS (excessive capitalization)
            const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
            if (capsRatio > 0.5 && text.length > 10) {
                score += 15;
            }

            return Math.min(score, 100);
        },

        // Determine if message is spam
        isSpam: function(text, threshold = 30) {
            return this.calculateSpamScore(text) >= threshold;
        },

        // Get risk level
        getRiskLevel: function(score) {
            if (score >= 70) return 'high';
            if (score >= 40) return 'medium';
            if (score >= 20) return 'low';
            return 'safe';
        }
    };

    // UI elements for warnings
    const warningUI = {
        createWarning: function(messageElement, score, riskLevel) {
            // Remove existing warning if any
            const existingWarning = messageElement.querySelector('.spam-warning');
            if (existingWarning) {
                existingWarning.remove();
            }

            // Create warning element
            const warning = document.createElement('div');
            warning.className = `spam-warning spam-${riskLevel}`;
            
            const icon = riskLevel === 'high' ? '⚠️' : riskLevel === 'medium' ? '⚡' : 'ℹ️';
            const message = riskLevel === 'high' ? 'HIGH RISK: Potential spam detected!' :
                           riskLevel === 'medium' ? 'CAUTION: Suspicious content detected' :
                           'INFO: Some spam indicators found';
            
            warning.innerHTML = `
                <div class="spam-warning-content">
                    <span class="spam-icon">${icon}</span>
                    <span class="spam-message">${message}</span>
                    <span class="spam-score">Spam Score: ${score}%</span>
                </div>
            `;

            // Insert warning after the message
            messageElement.appendChild(warning);
        },

        highlightMessage: function(messageElement, riskLevel) {
            messageElement.classList.add(`spam-${riskLevel}`);
        }
    };

    // Observer for new messages
    let messageObserver;

    // Function to analyze a message element
    function analyzeMessage(messageElement) {
        // Get message text
        const textSelectors = [
            '[data-testid="conversation-turn-holder"] span.selectable-text',
            '.copyable-text span.selectable-text',
            '.message span.selectable-text',
            'span.selectable-text'
        ];

        let messageText = '';
        for (const selector of textSelectors) {
            const textElement = messageElement.querySelector(selector);
            if (textElement) {
                messageText = textElement.textContent || textElement.innerText;
                break;
            }
        }

        if (!messageText || messageText.trim().length === 0) {
            return;
        }

        // Calculate spam score
        const score = spamDetector.calculateSpamScore(messageText);
        const riskLevel = spamDetector.getRiskLevel(score);
        const isSpam = spamDetector.isSpam(messageText);

        // Only show warning if spam detected
        if (isSpam) {
            warningUI.createWarning(messageElement, score, riskLevel);
            warningUI.highlightMessage(messageElement, riskLevel);
        }
    }

    // Function to scan all messages on page
    function scanAllMessages() {
        // Wait for WhatsApp to load
        const messageContainers = document.querySelectorAll('[data-testid="conversation-turn-holder"], .message, [data-id]');
        
        messageContainers.forEach((container) => {
            // Skip if already analyzed
            if (container.dataset.spamAnalyzed === 'true') {
                return;
            }
            
            analyzeMessage(container);
            container.dataset.spamAnalyzed = 'true';
        });
    }

    // Setup mutation observer for new messages
    function setupObserver() {
        const chatContainer = document.querySelector('[role="application"]') || 
                             document.querySelector('#main') || 
                             document.body;

        if (!chatContainer) {
            setTimeout(setupObserver, 1000);
            return;
        }

        messageObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // Check if it's a message container
                        if (node.matches && (
                            node.matches('[data-testid="conversation-turn-holder"]') ||
                            node.matches('.message') ||
                            node.querySelector('[data-testid="conversation-turn-holder"]') ||
                            node.querySelector('.message')
                        )) {
                            setTimeout(() => {
                                const messageContainer = node.matches('[data-testid="conversation-turn-holder"]') || 
                                                       node.matches('.message') ? 
                                                       node : 
                                                       node.querySelector('[data-testid="conversation-turn-holder"]') || 
                                                       node.querySelector('.message');
                                
                                if (messageContainer) {
                                    analyzeMessage(messageContainer);
                                }
                            }, 500);
                        }
                    }
                });
            });
        });

        messageObserver.observe(chatContainer, {
            childList: true,
            subtree: true
        });
    }

    // Initialize when page loads
    function init() {
        console.log('WhatsApp Spam Detector initialized');
        
        // Wait for WhatsApp to fully load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    scanAllMessages();
                    setupObserver();
                }, 2000);
            });
        } else {
            setTimeout(() => {
                scanAllMessages();
                setupObserver();
            }, 2000);
        }

        // Re-scan periodically (in case observer misses something)
        setInterval(scanAllMessages, 5000);
    }

    // Start initialization
    init();

    // Listen for messages from popup/background
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'rescan') {
            scanAllMessages();
            sendResponse({success: true});
        }
        return true;
    });

})();

