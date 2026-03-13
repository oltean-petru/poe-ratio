# PoE Currency Calculator - Overlay App

A lightweight desktop overlay application for Path of Exile currency ratio calculations with custom ratio management and persistent configuration.

## Features Overview

### 🎯 **Main Calculator**
- **Left Section**: Currency Amount inputs (editable)
- **Center Display**: Market Ratio (normalized to 1:X format)
- **Right Section**: Simplified Ratio (readonly, click to copy)

### 🎮 **Overlay Functionality**
- **Always on Top**: Stays above all other windows
- **Frameless Design**: Clean, minimal interface
- **Auto-Resize**: Window automatically fits content
- **Draggable**: Move the overlay anywhere on screen

### ⚙️ **Custom Ratios Management**
- **Persistent Storage**: Ratios saved to `config.json`
- **Add Custom Ratios**: Modal window for adding new ratios
- **Delete Ratios**: Hover over ratio buttons to reveal delete option
- **Flexible Layout**: Ratios use flexbox for optimal space usage

### 🖱️ **Interactive Controls**
- **Scroll Wheel Support**:
  - Left inputs: Increment/decrement values by 1
  - Right inputs: Cycle through ratio multipliers
- **Click to Copy**: Click any right-side input to copy value to clipboard
- **Quick Ratio Buttons**: One-click application of saved ratios

## Keyboard Shortcuts & Controls

### Global Shortcuts
| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Space` | Toggle overlay visibility (configurable) |

### Navigation
| Key | Action |
|-----|--------|
| `Enter` | Navigate between input fields (Left1 → Left2 → Left1) |
| `Escape` | Close add ratio modal (when open) |

### Add Ratio Modal
| Key | Action |
|-----|--------|
| `Enter` | Navigate: Ratio → Label → Submit |
| `Escape` | Close modal |

### Hotkey Configuration
- **Right-click tray icon** → **Configure Hotkey** to change the global shortcut
- Supports various modifier combinations (Ctrl, Alt, Shift, etc.)
- Examples: `CommandOrControl+Space`, `Alt+R`, `Shift+F1`

### Mouse Controls
| Action | Function |
|--------|----------|
| **Left Inputs Scroll** | Increment/decrement by 1 |
| **Right Inputs Scroll** | Cycle through ratio multipliers |
| **Right Inputs Click** | Copy value to clipboard |
| **Ratio Button Click** | Apply ratio to left inputs |
| **Ratio Button Hover** | Reveal delete button (×) |

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development
```bash
npm start
```

### 3. Build for Distribution

#### Build for your current platform:
```bash
npm run build
```

#### Build for specific platforms:
```bash
npm run build-win    # Windows
npm run build-mac    # macOS
npm run build-linux  # Linux
```

## Usage Guide

### Basic Ratio Calculation
1. Enter currency amounts in the left inputs (e.g., 30:2)
2. The center displays the market ratio (e.g., 1:0.067)
3. The right shows the simplified ratio (e.g., 15:1)
4. Click right inputs to copy values

### Custom Ratios
1. Click the **+** button to open add ratio modal
2. Enter ratio in format `15:1` or `3.5:1`
3. Optionally add a custom label
4. Click **Save** or press **Enter**
5. Ratio appears in the main window
6. Hover over any ratio and click **×** to delete

### Tray Menu Options
Right-click the tray icon to access:
- **Show/Hide Overlay**: Toggle overlay visibility
- **Add Custom Ratio**: Open the add ratio modal
- **Configure Hotkey**: Change the global shortcut key
- **Quit**: Exit the application

## File Structure

```
poe-ratio/
├── main/
│   ├── app.js                 # Electron lifecycle bootstrap
│   ├── config.js              # Persistent config storage and migration
│   ├── ipc.js                 # IPC handler registration
│   └── windows.js             # Window, tray, and popup management
├── preload/
│   ├── main.js                # Main window preload API
│   ├── add-ratio.js           # Add ratio modal preload API
│   └── hotkey-config.js       # Hotkey modal preload API
├── src/
│   ├── index.html              # Main window HTML
│   ├── style.css               # Main window styles
│   ├── add-ratio.html          # Add ratio modal HTML
│   ├── add-ratio.css           # Add ratio modal styles
│   ├── hotkey-config.html      # Hotkey configuration modal HTML
│   ├── hotkey-config.css       # Hotkey configuration modal styles
│   ├── launch-popup.html       # Startup popup window
│   └── renderer/
│       ├── main.js             # Main window renderer logic
│       ├── add-ratio.js        # Add ratio modal renderer logic
│       └── hotkey-config.js    # Hotkey configuration renderer logic
├── assets/
│   └── (place icons here)      # App icons
├── main.js                     # Root Electron bootstrap
├── preload.js                  # Root preload bootstrap for main window
├── add-ratio-preload.js        # Root preload bootstrap for add ratio modal
├── hotkey-config-preload.js    # Root preload bootstrap for hotkey modal
├── config.json                 # User configuration (auto-generated)
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## Configuration

The app automatically creates a `config.json` file to store your custom ratios and hotkey preferences:

```json
{
  "customRatios": [
    { "ratio": "15:1", "label": "15:1" },
    { "ratio": "127:1", "label": "Chaos to Divine" }
  ],
  "hotkey": "CommandOrControl+Space"
}
```

### Hotkey Configuration
- Access via right-click tray icon → "Configure Hotkey"
- Supports various modifier combinations
- Examples: `CommandOrControl+Space`, `Alt+R`, `Shift+F1`, `F12`
- Changes are saved automatically and take effect immediately

## Adding Icons

To add custom icons for your app:

1. **macOS**: Add `icon.icns` to the `assets/` folder
2. **Windows**: Add `icon.ico` to the `assets/` folder
3. **Linux**: Add `icon.png` to the `assets/` folder

## Distribution

Built apps will be output to the `dist/` folder with installers for the target platform.

## Development Notes

- Window auto-resizes to content on load
- Persistent overlay state between sessions
- Smooth transitions and hover effects
- Validates ratio input format (numbers:numbers)
- Handles decimal ratios (e.g., 3.5:1)

## Troubleshooting

- **Overlay not showing**: Press `Cmd/Ctrl + Space` (or your configured hotkey) to toggle
- **Config not saving**: Check write permissions in app directory
- **Ratios not loading**: Delete `config.json` to reset to defaults
- **Hotkey not working**: Try a different key combination in the hotkey configuration
- **Hotkey conflicts**: Some combinations may be reserved by the system or other applications
