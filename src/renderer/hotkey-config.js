const hotkeyInput = document.getElementById("hotkey-input");
const currentHotkeyElement = document.getElementById("current-hotkey");
const cancelButton = document.getElementById("cancelBtn");
const saveButton = document.getElementById("saveBtn");

const functionKeys = new Set([
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "F11",
  "F12",
]);

function isValidHotkey(hotkey) {
  return hotkey.includes("+") || functionKeys.has(hotkey);
}

async function loadHotkey() {
  const config = await window.electronAPI.loadConfig();
  const currentHotkey = config.hotkey || "CommandOrControl+Space";

  currentHotkeyElement.textContent = currentHotkey;
  hotkeyInput.value = currentHotkey;
}

async function saveHotkey() {
  const newHotkey = hotkeyInput.value.trim();

  if (!newHotkey) {
    alert("Please enter a hotkey");
    return;
  }

  if (!isValidHotkey(newHotkey)) {
    alert("Please use a valid hotkey format (e.g., CommandOrControl+Space)");
    return;
  }

  const result = await window.electronAPI.updateHotkey(newHotkey);
  if (result) {
    window.electronAPI.closeHotkeyConfigWindow();
    return;
  }

  alert("Failed to update hotkey. Please try a different combination.");
}

cancelButton.addEventListener("click", () => {
  window.electronAPI.closeHotkeyConfigWindow();
});

saveButton.addEventListener("click", () => {
  saveHotkey();
});

hotkeyInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    saveHotkey();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    window.electronAPI.closeHotkeyConfigWindow();
  }
});

window.addEventListener("load", () => {
  loadHotkey().catch((error) => {
    console.error("Error loading hotkey:", error);
  });
});