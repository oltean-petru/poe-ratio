const leftNum1 = document.getElementById('leftNum1');
const leftNum2 = document.getElementById('leftNum2');
const rightNum1 = document.getElementById('rightNum1');
const rightNum2 = document.getElementById('rightNum2');
const ratioDisplay = document.getElementById('ratioDisplay');
const clearBtn = document.getElementById('clearBtn');

let isUpdating = false;

function simplifyRatio(num1, num2) {
    if (num1 <= 0 || num2 <= 0) {
        throw new Error('Numbers must be positive');
    }
    const str1 = num1.toString();
    const str2 = num2.toString();

    const decimals1 = (str1.split('.')[1] || '').length;
    const decimals2 = (str2.split('.')[1] || '').length;
    const maxDecimals = Math.max(decimals1, decimals2);

    const precision = Math.min(maxDecimals, 6);
    const multiplier = Math.pow(10, precision);

    let int1 = Math.round(num1 * multiplier);
    let int2 = Math.round(num2 * multiplier);
    function simpleGCD(a, b) {
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    const divisor = simpleGCD(int1, int2);

    const simplified1 = int1 / divisor;
    const simplified2 = int2 / divisor;
    if (simplified1 > 10000 || simplified2 > 10000) {
        const maxVal = Math.max(simplified1, simplified2);
        const scaleFactor = Math.ceil(maxVal / 1000);

        return {
            first: Math.round(simplified1 / scaleFactor),
            second: Math.round(simplified2 / scaleFactor)
        };
    }

    return {
        first: simplified1,
        second: simplified2
    };
}

function normalizeToOne(num1, num2) {
    if (num1 <= 0 || num2 <= 0) {
        return null;
    }

    const ratio = num2 / num1;
    return {
        first: 1,
        second: parseFloat(ratio.toFixed(3))
    };
}

function calculateFromLeft() {
    if (isUpdating) return;

    const val1 = parseFloat(leftNum1.value);
    const val2 = parseFloat(leftNum2.value);

    if (isNaN(val1) || isNaN(val2) || val1 <= 0 || val2 <= 0) {
        return;
    }

    isUpdating = true;

    const simplified = simplifyRatio(val1, val2);
    rightNum1.value = simplified.first;
    rightNum2.value = simplified.second;

    const normalized = normalizeToOne(val1, val2);
    if (normalized) {
        ratioDisplay.textContent = `${normalized.first} : ${normalized.second}`;
    }

    isUpdating = false;
}

function updateCenterDisplay() {
    let val1, val2;

    if (rightNum1.value && rightNum2.value) {
        val1 = parseFloat(rightNum1.value);
        val2 = parseFloat(rightNum2.value);
    } else if (leftNum1.value && leftNum2.value) {
        val1 = parseFloat(leftNum1.value);
        val2 = parseFloat(leftNum2.value);
    }

    if (val1 && val2 && val1 > 0 && val2 > 0) {
        const normalized = normalizeToOne(val1, val2);
        if (normalized) {
            ratioDisplay.textContent = `${normalized.first} : ${normalized.second}`;
        }
    } else {
        ratioDisplay.textContent = '- : -';
    }
}

function clearInputs() {
    leftNum1.value = '';
    leftNum2.value = '';
    rightNum1.value = '';
    rightNum2.value = '';
    ratioDisplay.textContent = '- : -';
    leftNum1.focus();
}

function adjustRightRatio(delta) {
    const rightVal1 = parseFloat(rightNum1.value);
    const rightVal2 = parseFloat(rightNum2.value);

    if (isNaN(rightVal1) || isNaN(rightVal2) || rightVal1 <= 0 || rightVal2 <= 0) {
        return;
    }

    const simplified = simplifyRatio(rightVal1, rightVal2);
    const baseRatio1 = simplified.first;
    const baseRatio2 = simplified.second;

    const actualMultiplier = Math.round(rightVal1 / baseRatio1);
    let adjustedMultiplier = Math.max(1, actualMultiplier + delta);

    const newVal1 = baseRatio1 * adjustedMultiplier;
    const newVal2 = baseRatio2 * adjustedMultiplier;

    isUpdating = true;
    rightNum1.value = newVal1;
    rightNum2.value = newVal2;

    if (leftNum1.value && leftNum2.value) {
        const leftVal1 = parseFloat(leftNum1.value);
        const leftVal2 = parseFloat(leftNum2.value);
        const normalized = normalizeToOne(leftVal1, leftVal2);
        if (normalized) {
            ratioDisplay.textContent = `${normalized.first} : ${normalized.second}`;
        }
    }

    isUpdating = false;
}

function adjustLeftInput(inputElement, delta) {
    const currentValue = parseFloat(inputElement.value) || 0;
    const newValue = Math.max(0, currentValue + delta);

    inputElement.value = newValue;
    if (leftNum1.value && leftNum2.value) {
        setTimeout(calculateFromLeft, 100);
    } else {
        setTimeout(updateCenterDisplay, 100);
    }
}

function handleScrollRight(e) {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1 : -1;
    adjustRightRatio(delta);
}

function handleScrollLeftNum1(e) {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1 : -1;
    adjustLeftInput(leftNum1, delta);
}

function handleScrollLeftNum2(e) {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1 : -1;
    adjustLeftInput(leftNum2, delta);
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
    }
}

function handleRightInputClick(inputElement) {
    if (inputElement.value) {
        copyToClipboard(inputElement.value)
            .catch(err => {
                console.error('Failed to copy to clipboard:', err);
            });
    }
}

clearBtn.addEventListener('click', clearInputs);

leftNum1.addEventListener('input', () => {
    if (leftNum1.value && leftNum2.value) {
        setTimeout(calculateFromLeft, 300);
    } else {
        setTimeout(updateCenterDisplay, 300);
    }
});

leftNum2.addEventListener('input', () => {
    if (leftNum1.value && leftNum2.value) {
        setTimeout(calculateFromLeft, 300);
    } else {
        setTimeout(updateCenterDisplay, 300);
    }
});

rightNum1.addEventListener('wheel', handleScrollRight, { passive: false });
rightNum2.addEventListener('wheel', handleScrollRight, { passive: false });
rightNum1.addEventListener('click', () => handleRightInputClick(rightNum1));
rightNum2.addEventListener('click', () => handleRightInputClick(rightNum2));

leftNum1.addEventListener('wheel', handleScrollLeftNum1, { passive: false });
leftNum2.addEventListener('wheel', handleScrollLeftNum2, { passive: false });

rightNum1.addEventListener('click', () => handleRightInputClick(rightNum1));
rightNum2.addEventListener('click', () => handleRightInputClick(rightNum2));

leftNum1.addEventListener('wheel', handleScrollLeftNum1, { passive: false });
leftNum2.addEventListener('wheel', handleScrollLeftNum2, { passive: false });

leftNum1.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') leftNum2.focus();
});

leftNum2.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') leftNum1.focus();
});

const inputs = [leftNum1, leftNum2, rightNum1, rightNum2];
inputs.forEach(input => {
    input.style.transition = 'all 0.3s ease';
});

window.addEventListener('load', () => {
    leftNum1.focus();
});