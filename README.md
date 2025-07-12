# PoE Currency Calculator - Electron App

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

## App Features

- **Desktop Application**: Native desktop app with proper window management
- **Copy to Clipboard**: Click on right readonly fields to copy values
- **Scroll Wheel Support**:
  - Left inputs: increment/decrement by 1
  - Right inputs: cycle through ratio multipliers
- **Keyboard Shortcuts**:
  - `Cmd/Ctrl + R`: Clear and reload
  - `Cmd/Ctrl + Q`: Quit application

## File Structure

```
poe-ratio/
├── src/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── assets/
│   └── (place icons here)
├── main.js
├── package.json
└── README.md
```

## Adding Icons

To add custom icons for your app:

1. **macOS**: Add `icon.icns` to the `assets/` folder
2. **Windows**: Add `icon.ico` to the `assets/` folder
3. **Linux**: Add `icon.png` to the `assets/` folder

## Distribution

Built apps will be output to the `dist/` folder with installers for the target platform.
