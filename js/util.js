// Nicht-blockierende Hinweismeldung (ersetzt alert(), das Timer und Summer anhält)
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), type === 'error' ? 8000 : 2500);
}

// Drücken/Loslassen eines Tasters über Pointer Events (Maus, Touch und Stift einheitlich).
// onRelease(cancelled): cancelled = true, wenn der Druck abgebrochen wurde (z. B. durch das System).
function bindPress(element, onPress, onRelease) {
    let pressed = false;

    element.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        // Verhindert zusätzliche Kompatibilitäts-Mausereignisse nach Touch
        e.preventDefault();
        pressed = true;
        element.setPointerCapture(e.pointerId);
        onPress();
    });

    const release = (cancelled) => {
        if (!pressed) return;
        pressed = false;
        onRelease(cancelled);
    };

    element.addEventListener('pointerup', () => release(false));
    element.addEventListener('pointercancel', () => release(true));
    element.addEventListener('lostpointercapture', () => release(true));
    // Langes Drücken soll kein Kontextmenü öffnen
    element.addEventListener('contextmenu', (e) => e.preventDefault());
}
