const recorderEl = document.getElementById("hotkeyRecorder");
const recorderIdle = document.getElementById("recorderIdle");
const recorderListening = document.getElementById("recorderListening");
const recorderKeys = document.getElementById("recorderKeys");
const currentHotkeyElement = document.getElementById("current-hotkey");
const cancelButton = document.getElementById("cancelBtn");
const saveButton = document.getElementById("saveBtn");

let recordedAccelerator = null;
let isRecording = false;

const MODIFIER_KEYS = new Set(["Control", "Alt", "Shift", "Meta", "OS", "Super", "Hyper"]);

const BROWSER_KEY_MAP = {
  " ": "Space",
  ArrowUp: "Up",
  ArrowDown: "Down",
  ArrowLeft: "Left",
  ArrowRight: "Right",
  Enter: "Return",
  Escape: "Escape",
  Backspace: "Backspace",
  Delete: "Delete",
  Tab: "Tab",
  Home: "Home",
  End: "End",
  PageUp: "PageUp",
  PageDown: "PageDown",
  Insert: "Insert",
  NumLock: "NumLock",
  CapsLock: "CapsLock",
  PrintScreen: "PrintScreen",
  Pause: "Pause",
};
for (let i = 1; i <= 24; i++) BROWSER_KEY_MAP[`F${i}`] = `F${i}`;

const DISPLAY_MAP = {
  CommandOrControl: "Ctrl",
  CmdOrCtrl: "Ctrl",
  Control: "Ctrl",
  Ctrl: "Ctrl",
  Alt: "Alt",
  Shift: "Shift",
  Meta: "Win",
  Super: "Win",
  Return: "Enter",
  Up: "↑",
  Down: "↓",
  Left: "←",
  Right: "→",
};

function browserKeyToElectron(key) {
  if (BROWSER_KEY_MAP[key]) return BROWSER_KEY_MAP[key];
  if (key.length === 1) return key.toUpperCase();
  return null;
}

function buildElectronAccelerator(event) {
  if (MODIFIER_KEYS.has(event.key)) return null;

  const mainKey = browserKeyToElectron(event.key);
  if (!mainKey) return null;

  const modifiers = [];
  if (event.ctrlKey) modifiers.push("CommandOrControl");
  if (event.altKey) modifiers.push("Alt");
  if (event.shiftKey) modifiers.push("Shift");
  if (event.metaKey && !event.ctrlKey) modifiers.push("Meta");

  if (modifiers.length === 0 && !/^F\d+$/.test(mainKey)) return null;

  return [...modifiers, mainKey].join("+");
}

function displayTokens(accelerator) {
  return accelerator.split("+").map((t) => DISPLAY_MAP[t] || t);
}

function setRecorderState(state) {
  recorderIdle.style.display = state === "idle" ? "" : "none";
  recorderListening.style.display = state === "listening" ? "" : "none";
  recorderKeys.style.display = state === "captured" ? "flex" : "none";
  recorderEl.classList.toggle("recording", state === "listening");
}

function showCaptured(accelerator) {
  const tokens = displayTokens(accelerator);
  recorderKeys.innerHTML = tokens
    .map((t, i) =>
      i < tokens.length - 1
        ? `<kbd>${t}</kbd><span class="recorder-plus">+</span>`
        : `<kbd>${t}</kbd>`
    )
    .join("");
  setRecorderState("captured");
}

recorderEl.addEventListener("click", () => {
  isRecording = true;
  setRecorderState("listening");
});

recorderEl.addEventListener("focus", () => {
  isRecording = true;
  setRecorderState("listening");
});

recorderEl.addEventListener("blur", () => {
  if (!isRecording) return;
  isRecording = false;
  if (recordedAccelerator) {
    showCaptured(recordedAccelerator);
  } else {
    setRecorderState("idle");
  }
});

recorderEl.addEventListener("keydown", (event) => {
  event.preventDefault();
  event.stopPropagation();

  if (event.key === "Escape") {
    isRecording = false;
    if (recordedAccelerator) {
      showCaptured(recordedAccelerator);
    } else {
      setRecorderState("idle");
    }
    recorderEl.blur();
    return;
  }

  if (!isRecording) return;

  const accelerator = buildElectronAccelerator(event);
  if (!accelerator) return; // modifier-only press
  recordedAccelerator = accelerator;
  isRecording = false;
  showCaptured(accelerator);
});

async function loadHotkey() {
  const config = await window.electronAPI.loadConfig();
  const currentHotkey = config.hotkey || "CommandOrControl+Space";
  currentHotkeyElement.textContent = currentHotkey;
  recordedAccelerator = currentHotkey;
  showCaptured(currentHotkey);
}

async function saveHotkey() {
  if (!recordedAccelerator) {
    recorderEl.classList.add("recorder-error");
    setTimeout(() => recorderEl.classList.remove("recorder-error"), 1000);
    return;
  }

  const result = await window.electronAPI.updateHotkey(recordedAccelerator);
  if (result) {
    window.electronAPI.closeHotkeyConfigWindow();
    return;
  }

  recorderEl.classList.add("recorder-error");
  setTimeout(() => recorderEl.classList.remove("recorder-error"), 1500);
}

cancelButton.addEventListener("click", () => {
  window.electronAPI.closeHotkeyConfigWindow();
});

saveButton.addEventListener("click", saveHotkey);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !isRecording) {
    window.electronAPI.closeHotkeyConfigWindow();
  }
});

window.addEventListener("load", () => {
  loadHotkey().catch((error) => {
    console.error("Error loading hotkey:", error);
  });
});