# PoE Currency Calculator - Overlay App

A lightweight desktop overlay application for Path of Exile currency ratio calculations with custom ratio management, ratio history, and persistent configuration.

## ⚠️ DISCLAIMER ⚠️
I made this project for my personal use and am sharing it in case others find it useful. The implementation of features is probably not ideal and may contain bugs. The code could probably be refactored / optimized / cleaned up but i don't have the time or motivation to do so as long as it works well enough for my needs.
Use at your own risk.

## Features Overview

### 🎯 **Main Calculator**
- **Left Section**: Currency Amount inputs (editable)
- **Center Display**: Market Ratio (normalized to 1:X format)
- **Right Section**: Simplified Ratio (readonly, click to copy)

### 🎮 **Overlay Functionality**
- **Always on Top**: Stays above all other windows
- **Frameless Design**: Clean, minimal interface
- **Auto-Resize**: Window height automatically adjusts to fit content
- **Draggable**: Move the overlay anywhere on screen
- **Persistent Position**: Window position is saved and restored between sessions

### ⚙️ **Custom Ratios Management**
- **Persistent Storage**: Ratios saved to `config.json`
- **Add Custom Ratios**: Modal window for adding new ratios
- **Delete Ratios**: Hover over ratio buttons to reveal delete option

### 📋 **Ratio History**
- **Auto-captured**: Every copied ratio is automatically added to history
- **Max 10 Entries**: Oldest entry is removed when the list is full
- **Click to Apply**: Click any history entry to restore those values to the left inputs
- **Deduplicated**: Re-copying an existing entry moves it to the top
- **Clear Button**: Remove all history entries at once

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
| `Ctrl/Cmd + Space` | Toggle overlay visibility (configurable) |

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
- Uses a **visual hotkey recorder** : click the recorder box and press your desired key combination
- Supports modifier + key combinations (e.g., `Ctrl+Space`, `Alt+R`, `Shift+F1`, `F12`)
- Press `Escape` inside the recorder to cancel recording without changing the saved hotkey
- Changes take effect immediately after saving

### Mouse Controls
| Action | Function |
|--------|----------|
| **Left Inputs Scroll** | Increment/decrement by 1 |
| **Right Inputs Scroll** | Cycle through ratio multipliers |
| **Right Inputs Click** | Copy value to clipboard |
| **Ratio Button Click** | Apply ratio to left inputs |
| **Ratio Button Hover** | Reveal delete button (×) |
| **History Entry Click** | Restore those currency amounts to left inputs |

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
4. Click right inputs to copy values > the amount is also saved to history

### Custom Ratios
1. Click the **+** button to open the add ratio modal
2. Enter ratio in format `15:1` or `3.5:1`
3. Optionally add a custom label
4. Click **Save** or press **Enter**
5. Ratio appears in the main window
6. Hover over any ratio and click **×** to delete

### Ratio History
1. Copy a ratio by clicking the right-side inputs
2. The currency amount (left-side values) is saved in the **Ratio History** section
3. Click any history entry to instantly restore those amounts to the left inputs
4. Click **Clear** in the history header to remove all entries

### Configuring the Hotkey
1. Right-click the tray icon → **Configure Hotkey**
2. Click the recorder box (it turns gold and pulses)
3. Press your desired key combination (e.g., `Ctrl+Space`)
4. Click **Save** : the overlay hotkey updates immediately

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
│   ├── main.js                # Main window preload API (reference)
│   ├── add-ratio.js           # Add ratio modal preload API (reference)
│   └── hotkey-config.js       # Hotkey modal preload API (reference)
├── src/
│   ├── index.html              # Main window HTML
│   ├── style.css               # Main window styles
│   ├── add-ratio.html          # Add ratio modal HTML
│   ├── add-ratio.css           # Add ratio modal styles
│   ├── hotkey-config.html      # Hotkey configuration modal HTML
│   ├── hotkey-config.css       # Hotkey configuration modal styles
│   ├── launch-popup.html       # Startup notification popup
│   └── renderer/
│       ├── main.js             # Main window renderer logic
│       ├── add-ratio.js        # Add ratio modal renderer logic
│       └── hotkey-config.js    # Hotkey recorder renderer logic
├── assets/
│   └── (place icons here)      # App icons
├── main.js                     # Root Electron entry point
├── preload.js                  # Root preload for main window (contextBridge)
├── add-ratio-preload.js        # Root preload for add ratio modal (contextBridge)
├── hotkey-config-preload.js    # Root preload for hotkey modal (contextBridge)
├── config.json                 # User configuration (auto-generated)
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## Configuration

The app automatically creates and manages `config.json` in the user data directory:

```json
{
  "customRatios": [
    { "ratio": "15:1", "label": "15:1" },
    { "ratio": "127:1", "label": "Chaos to Divine" }
  ],
  "hotkey": "CommandOrControl+Space",
  "overlayPosition": { "x": 100, "y": 200 },
  "ratioHistory": ["30:2", "15:1", "100:7"]
}
```

| Field | Description |
|-------|-------------|
| `customRatios` | Array of saved custom ratio buttons |
| `hotkey` | Global shortcut in Electron accelerator format |
| `overlayPosition` | Last known overlay position (`null` = center on first launch) |
| `ratioHistory` | Up to 10 recently copied currency amounts |

## Adding Icons

To add custom icons for your app:

1. **macOS**: Add `icon.icns` to the `assets/` folder
2. **Windows**: Add `icon.ico` to the `assets/` folder
3. **Linux**: Add `icon.png` to the `assets/` folder

## Distribution

Built apps will be output to the `dist/` folder with installers for the target platform.

## Development Notes

- Window height auto-resizes to content after every render (debounced 80 ms); width is fixed
- Overlay position is validated against all connected displays on start — invalid positions fall back to center
- Hotkey recorder maps browser `KeyboardEvent` codes to Electron accelerator tokens
- Config is normalized on load — unknown fields are ignored, invalid entries are filtered out
- Validates ratio input format (numbers:numbers, supports decimals)

## Troubleshooting

- **Overlay not showing**: Press `Ctrl+Space` (or your configured hotkey) to toggle
- **Overlay off screen**: Delete the `overlayPosition` field from `config.json` to reset to center
- **Config not saving**: Check write permissions in the app user data directory
- **Ratios not loading**: Delete `config.json` to reset to defaults
- **Hotkey not working**: Open Configure Hotkey and record a new combination
- **Hotkey conflicts**: Some combinations may be reserved by the OS or other applications
