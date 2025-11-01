# WhatsApp Spam Detector

A browser extension that automatically detects fake and spam messages on WhatsApp Web using advanced heuristics and pattern matching.

## Features

- 🔍 **Real-time Detection**: Automatically analyzes incoming messages as they appear
- ⚠️ **Visual Warnings**: Color-coded warnings (High/Medium/Low risk) with spam scores
- 🎛️ **Customizable Threshold**: Adjust detection sensitivity to your preference
- 🛡️ **Multiple Detection Patterns**:
  - Suspicious URLs and links
  - Phone numbers and contact requests
  - Email addresses
  - Financial/currency mentions
  - Urgency keywords (urgent, limited time, etc.)
  - Suspicious financial terms
  - Excessive capitalization and punctuation

## Installation

### Chrome/Edge/Brave

1. Download or clone this repository
2. Open your browser and navigate to:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the `whatsapp-spam-detector` folder
6. The extension should now be installed!

### Firefox

1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging`
3. Click **This Firefox**
4. Click **Load Temporary Add-on**
5. Select the `manifest.json` file from the extension folder

## Usage

1. Open [WhatsApp Web](https://web.whatsapp.com/)
2. The extension will automatically start analyzing messages
3. Messages with spam indicators will show warnings below them:
   - 🔴 **High Risk**: Red warning for obvious spam
   - 🟡 **Medium Risk**: Orange warning for suspicious content
   - 🔵 **Low Risk**: Blue warning for minor indicators
4. Click the extension icon to:
   - Enable/disable detection
   - Adjust spam detection threshold
   - Toggle warning visibility
   - Manually rescan messages

## Configuration

### Threshold Levels

- **10-20%**: Less strict - Only flags obvious spam
- **30-40%**: Balanced (recommended)
- **50-70%**: More strict - Flags more messages as suspicious

### Detection Indicators

The extension checks for:
- Multiple URLs in a message
- Multiple phone numbers
- Email addresses
- Currency symbols and amounts
- Urgency keywords (urgent, limited time, act now, etc.)
- Financial terms (bank account, transfer money, verify account)
- Excessive exclamation marks
- ALL CAPS text
- Message length anomalies

## How It Works

1. **Content Script Injection**: The extension injects a content script into WhatsApp Web pages
2. **Message Monitoring**: Uses a MutationObserver to detect new messages as they appear
3. **Pattern Analysis**: Each message is analyzed against multiple spam patterns
4. **Score Calculation**: A spam score (0-100) is calculated based on detected indicators
5. **Visual Feedback**: Messages above the threshold are highlighted with color-coded warnings

## File Structure

```
whatsapp-spam-detector/
├── manifest.json       # Extension manifest (Manifest V3)
├── content.js         # Main content script for message analysis
├── background.js      # Service worker for extension logic
├── popup.html         # Extension popup UI
├── popup.js           # Popup functionality
├── styles.css         # Warning styles and animations
├── icons/             # Extension icons (you'll need to add these)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md          # This file
```

## Privacy

- ✅ **No Data Collection**: All analysis happens locally in your browser
- ✅ **No Server Communication**: No messages are sent to external servers
- ✅ **No Account Access**: Does not access your WhatsApp account or credentials
- ✅ **Open Source**: Full source code available for review

## Limitations

- Only works on WhatsApp Web (web.whatsapp.com)
- Detection is based on heuristics and patterns, not AI/ML
- May have false positives (especially with stricter thresholds)
- May miss sophisticated spam that doesn't match known patterns

## Development

### Adding Icons

You'll need to create icon files:
- `icons/icon16.png` (16x16 pixels)
- `icons/icon48.png` (48x48 pixels)
- `icons/icon128.png` (128x128 pixels)

You can use any image editing tool or online icon generator.

### Testing

1. Load the extension in developer mode
2. Open WhatsApp Web
3. Send yourself a test message with spam indicators (URLs, urgency words, etc.)
4. Verify warnings appear correctly

## Contributing

Contributions are welcome! Areas for improvement:
- Machine learning-based detection
- Custom pattern rules
- Whitelist/blacklist functionality
- Statistics and reporting
- Additional language support

## License

MIT License - Feel free to use and modify as needed.

## Disclaimer

This extension is provided as-is for educational and protective purposes. It should not be the sole method of verifying message authenticity. Always use your judgment and be cautious with suspicious messages, especially those involving financial transactions or personal information.

## Support

For issues, feature requests, or contributions, please open an issue on the repository.

---

**Stay Safe! 🛡️**

