const leftNum1 = document.getElementById("leftNum1");
const leftNum2 = document.getElementById("leftNum2");
const rightNum1 = document.getElementById("rightNum1");
const rightNum2 = document.getElementById("rightNum2");
const ratioDisplay = document.getElementById("ratioDisplay");
const clearBtn = document.getElementById("clearBtn");
const addRatioBtn = document.getElementById("addRatioBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const ratioGrid = document.getElementById("ratioGrid");
const historyGrid = document.getElementById("historyGrid");

const fallbackRatios = [
  { ratio: "3:1", label: "3:1" },
  { ratio: "4:1", label: "4:1" },
  { ratio: "5:1", label: "5:1" },
];

let isUpdating = false;
const maxHistoryEntries = 10;
let resizeOverlayTimeout;

function scheduleOverlayResize() {
  if (resizeOverlayTimeout) {
    clearTimeout(resizeOverlayTimeout);
  }

  resizeOverlayTimeout = setTimeout(() => {
    if (!window.configAPI?.resizeOverlayToContent) {
      return;
    }

    window.configAPI.resizeOverlayToContent().catch((error) => {
      console.error("Failed to resize overlay:", error);
    });
  }, 80);
}

function simplifyRatio(num1, num2) {
  if (num1 <= 0 || num2 <= 0) {
    throw new Error("Numbers must be positive");
  }

  const decimals1 = (num1.toString().split(".")[1] || "").length;
  const decimals2 = (num2.toString().split(".")[1] || "").length;
  const precision = Math.min(Math.max(decimals1, decimals2), 6);
  const multiplier = 10 ** precision;

  let int1 = Math.round(num1 * multiplier);
  let int2 = Math.round(num2 * multiplier);

  while (int2 !== 0) {
    const remainder = int1 % int2;
    int1 = int2;
    int2 = remainder;
  }

  const simplified1 = Math.round(num1 * multiplier) / int1;
  const simplified2 = Math.round(num2 * multiplier) / int1;

  if (simplified1 > 10000 || simplified2 > 10000) {
    const maxValue = Math.max(simplified1, simplified2);
    const scaleFactor = Math.ceil(maxValue / 1000);

    return {
      first: Math.round(simplified1 / scaleFactor),
      second: Math.round(simplified2 / scaleFactor),
    };
  }

  return {
    first: simplified1,
    second: simplified2,
  };
}

function normalizeToOne(num1, num2) {
  if (num1 <= 0 || num2 <= 0) {
    return null;
  }

  return {
    first: 1,
    second: Number((num2 / num1).toFixed(3)),
  };
}

function updateRatioDisplay(num1, num2) {
  const normalized = normalizeToOne(num1, num2);
  ratioDisplay.textContent = normalized
    ? `${normalized.first} : ${normalized.second}`
    : "- : -";
}

function calculateFromLeft() {
  if (isUpdating) {
    return;
  }

  const val1 = Number.parseFloat(leftNum1.value);
  const val2 = Number.parseFloat(leftNum2.value);

  if (Number.isNaN(val1) || Number.isNaN(val2) || val1 <= 0 || val2 <= 0) {
    return;
  }

  isUpdating = true;

  const simplified = simplifyRatio(val1, val2);
  rightNum1.value = simplified.first;
  rightNum2.value = simplified.second;
  updateRatioDisplay(val1, val2);

  isUpdating = false;
}

function updateCenterDisplay() {
  const val1 = Number.parseFloat(rightNum1.value || leftNum1.value);
  const val2 = Number.parseFloat(rightNum2.value || leftNum2.value);

  if (Number.isNaN(val1) || Number.isNaN(val2) || val1 <= 0 || val2 <= 0) {
    ratioDisplay.textContent = "- : -";
    return;
  }

  updateRatioDisplay(val1, val2);
}

function clearInputs() {
  leftNum1.value = "";
  leftNum2.value = "";
  rightNum1.value = "";
  rightNum2.value = "";
  ratioDisplay.textContent = "- : -";
  leftNum1.focus();
}

function adjustRightRatio(delta) {
  const rightVal1 = Number.parseFloat(rightNum1.value);
  const rightVal2 = Number.parseFloat(rightNum2.value);

  if (Number.isNaN(rightVal1) || Number.isNaN(rightVal2) || rightVal1 <= 0 || rightVal2 <= 0) {
    return;
  }

  const simplified = simplifyRatio(rightVal1, rightVal2);
  const actualMultiplier = Math.round(rightVal1 / simplified.first);
  const adjustedMultiplier = Math.max(1, actualMultiplier + delta);

  isUpdating = true;
  rightNum1.value = simplified.first * adjustedMultiplier;
  rightNum2.value = simplified.second * adjustedMultiplier;

  if (leftNum1.value && leftNum2.value) {
    updateRatioDisplay(Number.parseFloat(leftNum1.value), Number.parseFloat(leftNum2.value));
  }

  isUpdating = false;
}

function adjustLeftInput(inputElement, delta) {
  const currentValue = Number.parseFloat(inputElement.value) || 0;
  inputElement.value = Math.max(0, currentValue + delta);

  setTimeout(() => {
    if (leftNum1.value && leftNum2.value) {
      calculateFromLeft();
    } else {
      updateCenterDisplay();
    }
  }, 100);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    return true;
  }
}

function handleRightInputClick(inputElement) {
  if (!inputElement.value) {
    return;
  }

  copyToClipboard(inputElement.value)
    .then(() => {
      const amountText = getCurrentCurrencyAmount();
      if (amountText) {
        addRatioToHistory(amountText);
      }
    })
    .catch((error) => {
      console.error("Failed to copy to clipboard:", error);
    });
}

function getCurrentCurrencyAmount() {
  if (!leftNum1.value || !leftNum2.value) {
    return null;
  }

  const amount = `${leftNum1.value}:${leftNum2.value}`;
  return /^\d+(\.\d+)?:\d+(\.\d+)?$/.test(amount) ? amount : null;
}

function applyRatio(ratio) {
  const [num1, num2] = ratio.split(":").map((value) => Number.parseFloat(value));
  leftNum1.value = num1;
  leftNum2.value = num2;
  setTimeout(calculateFromLeft, 100);
}

function createRatioButton(ratioData, index) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "quick-ratio-btn";
  button.dataset.ratio = ratioData.ratio;
  button.dataset.index = String(index);

  const label = document.createElement("span");
  label.textContent = ratioData.label;

  const deleteBadge = document.createElement("span");
  deleteBadge.className = "delete-btn";
  deleteBadge.dataset.action = "delete";
  deleteBadge.dataset.index = String(index);
  deleteBadge.textContent = "×";
  deleteBadge.title = "Remove ratio";

  button.append(label, deleteBadge);
  return button;
}

function renderCustomRatios(ratios) {
  ratioGrid.replaceChildren(...ratios.map(createRatioButton));
  scheduleOverlayResize();
}

function createHistoryRatioButton(ratio) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "history-ratio-btn";
  button.dataset.ratio = ratio;
  button.textContent = ratio;
  return button;
}

function renderRatioHistory(history) {
  const ratios = Array.isArray(history) ? history : [];
  clearHistoryBtn.disabled = ratios.length === 0;

  if (ratios.length === 0) {
    const emptyState = document.createElement("span");
    emptyState.className = "history-empty";
    emptyState.textContent = "No copied amounts yet.";
    historyGrid.replaceChildren(emptyState);
    scheduleOverlayResize();
    return;
  }

  historyGrid.replaceChildren(...ratios.map(createHistoryRatioButton));
  scheduleOverlayResize();
}

async function clearRatioHistory() {
  try {
    const config = await window.configAPI.loadConfig();
    config.ratioHistory = [];

    const saveSucceeded = await window.configAPI.saveConfig(config);
    if (saveSucceeded) {
      renderRatioHistory([]);
    }
  } catch (error) {
    console.error("Error clearing ratio history:", error);
  }
}

async function addRatioToHistory(ratio) {
  try {
    const config = await window.configAPI.loadConfig();
    const existingHistory = Array.isArray(config.ratioHistory) ? config.ratioHistory : [];
    const nextHistory = [ratio, ...existingHistory.filter((entry) => entry !== ratio)].slice(
      0,
      maxHistoryEntries
    );

    config.ratioHistory = nextHistory;
    const saveSucceeded = await window.configAPI.saveConfig(config);
    if (saveSucceeded) {
      renderRatioHistory(nextHistory);
    }
  } catch (error) {
    console.error("Error saving ratio history:", error);
  }
}

async function loadCustomRatios() {
  try {
    const config = await window.configAPI.loadConfig();
    renderCustomRatios(config.customRatios);
    renderRatioHistory(config.ratioHistory);
  } catch (error) {
    console.error("Error loading custom ratios:", error);
    renderCustomRatios(fallbackRatios);
    renderRatioHistory([]);
  }
}

async function removeCustomRatio(index) {
  try {
    const config = await window.configAPI.removeCustomRatio(index);
    if (config) {
      renderCustomRatios(config.customRatios);
    }
  } catch (error) {
    console.error("Error removing custom ratio:", error);
  }
}

clearBtn.addEventListener("click", clearInputs);
addRatioBtn.addEventListener("click", () => {
  window.configAPI.openAddRatioWindow();
});
clearHistoryBtn.addEventListener("click", clearRatioHistory);

ratioGrid.addEventListener("click", (event) => {
  const deleteBadge = event.target.closest(".delete-btn");
  if (deleteBadge) {
    removeCustomRatio(Number.parseInt(deleteBadge.dataset.index, 10));
    return;
  }

  const ratioButton = event.target.closest(".quick-ratio-btn");
  if (ratioButton) {
    applyRatio(ratioButton.dataset.ratio);
  }
});

historyGrid.addEventListener("click", (event) => {
  const historyButton = event.target.closest(".history-ratio-btn");
  if (historyButton) {
    applyRatio(historyButton.dataset.ratio);
  }
});

window.configAPI.onRatiosUpdated((event, config) => {
  renderCustomRatios(config.customRatios);
});

leftNum1.addEventListener("input", () => {
  setTimeout(leftNum1.value && leftNum2.value ? calculateFromLeft : updateCenterDisplay, 300);
});

leftNum2.addEventListener("input", () => {
  setTimeout(leftNum1.value && leftNum2.value ? calculateFromLeft : updateCenterDisplay, 300);
});

rightNum1.addEventListener("wheel", (event) => {
  event.preventDefault();
  adjustRightRatio(event.deltaY < 0 ? 1 : -1);
}, { passive: false });

rightNum2.addEventListener("wheel", (event) => {
  event.preventDefault();
  adjustRightRatio(event.deltaY < 0 ? 1 : -1);
}, { passive: false });

leftNum1.addEventListener("wheel", (event) => {
  event.preventDefault();
  adjustLeftInput(leftNum1, event.deltaY < 0 ? 1 : -1);
}, { passive: false });

leftNum2.addEventListener("wheel", (event) => {
  event.preventDefault();
  adjustLeftInput(leftNum2, event.deltaY < 0 ? 1 : -1);
}, { passive: false });

rightNum1.addEventListener("click", () => handleRightInputClick(rightNum1));
rightNum2.addEventListener("click", () => handleRightInputClick(rightNum2));

leftNum1.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    leftNum2.focus();
  }
});

leftNum2.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    leftNum1.focus();
  }
});

[leftNum1, leftNum2, rightNum1, rightNum2].forEach((input) => {
  input.style.transition = "all 0.3s ease";
});

window.addEventListener("load", () => {
  leftNum1.focus();
  loadCustomRatios();
  scheduleOverlayResize();
});