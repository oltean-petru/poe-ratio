const form = document.getElementById('addRatioForm');
const ratioInput = document.getElementById('ratioInput');
const labelInput = document.getElementById('labelInput');
const cancelBtn = document.getElementById('cancelBtn');
window.addEventListener('load', () => {
    ratioInput.focus();
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const ratioValue = ratioInput.value.trim();
    const labelValue = labelInput.value.trim();

    if (!ratioValue) return;

    const ratioPattern = /^\d+(\.\d+)?:\d+(\.\d+)?$/;
    if (!ratioPattern.test(ratioValue)) {
        alert('Please enter a valid ratio format (e.g., 15:1, 3.5:1)');
        return;
    }

    try {
        await window.addRatioAPI.saveRatio(ratioValue, labelValue);
        window.addRatioAPI.closeWindow();
    } catch (error) {
        console.error('Error saving custom ratio:', error);
        alert('Error saving ratio. Please try again.');
    }
});

cancelBtn.addEventListener('click', () => {
    window.addRatioAPI.closeWindow();
});

ratioInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        labelInput.focus();
    }
});

labelInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        form.dispatchEvent(new Event('submit'));
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.addRatioAPI.closeWindow();
    }
});
