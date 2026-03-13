const { app } = require("electron");
const fs = require("fs");
const path = require("path");

const defaultRatios = [
  { ratio: "3:1", label: "3:1" },
  { ratio: "4:1", label: "4:1" },
  { ratio: "5:1", label: "5:1" },
];

const defaultConfig = {
  customRatios: defaultRatios,
  hotkey: "CommandOrControl+Space",
  overlayPosition: null,
};

function normalizeOverlayPosition(position) {
  if (!position || typeof position !== "object") {
    return null;
  }

  const { x, y } = position;
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }

  return {
    x: Math.round(x),
    y: Math.round(y),
  };
}

function getConfigPath() {
  return path.join(app.getPath("userData"), "config.json");
}

function migrateConfigIfNeeded() {
  const newConfigPath = getConfigPath();
  const oldConfigPath = path.join(__dirname, "..", "config.json");

  if (!fs.existsSync(newConfigPath) && fs.existsSync(oldConfigPath)) {
    try {
      const oldData = fs.readFileSync(oldConfigPath, "utf8");
      const oldConfig = JSON.parse(oldData);
      const nextConfig = {
        ...defaultConfig,
        ...oldConfig,
        customRatios: oldConfig.customRatios || defaultRatios,
        hotkey: oldConfig.hotkey || defaultConfig.hotkey,
        overlayPosition: normalizeOverlayPosition(oldConfig.overlayPosition),
      };

      fs.mkdirSync(path.dirname(newConfigPath), { recursive: true });
      fs.writeFileSync(newConfigPath, JSON.stringify(nextConfig, null, 2));
    } catch (error) {
      console.error("Error migrating config:", error);
    }
  }
}

function loadConfig() {
  try {
    const configPath = getConfigPath();
    if (!fs.existsSync(configPath)) {
      return { ...defaultConfig };
    }

    const data = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(data);

    return {
      ...defaultConfig,
      ...config,
      customRatios: config.customRatios || defaultRatios,
      hotkey: config.hotkey || defaultConfig.hotkey,
      overlayPosition: normalizeOverlayPosition(config.overlayPosition),
    };
  } catch (error) {
    console.error("Error loading config, using defaults:", error);
    return { ...defaultConfig };
  }
}

function saveConfig(config) {
  try {
    const configPath = getConfigPath();
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error("Error saving config:", error);
    return false;
  }
}

module.exports = {
  defaultConfig,
  defaultRatios,
  getConfigPath,
  loadConfig,
  migrateConfigIfNeeded,
  normalizeOverlayPosition,
  saveConfig,
};