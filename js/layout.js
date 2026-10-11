// Skaliert FAT/FBF gleichmäßig auf den verfügbaren Platz (z. B. Tablet im Vollbild).
// Auf schmalen oder sehr niedrigen Bildschirmen bleibt das normale, fließende Layout.
class LayoutScaler {
    static MIN_SCALE = 0.75;
    static MAX_SCALE = 3;

    constructor() {
        this.container = document.querySelector('.din-container');
        this.topNav = document.querySelector('.top-nav');

        const update = () => this.update();
        window.addEventListener('resize', update);
        document.addEventListener('fullscreenchange', update);
        this.update();
    }

    update() {
        if (!this.container || !this.topNav) return;

        const body = getComputedStyle(document.body);
        const padX = parseFloat(body.paddingLeft) + parseFloat(body.paddingRight);
        const padY = parseFloat(body.paddingTop) + parseFloat(body.paddingBottom);
        const navMargin = parseFloat(getComputedStyle(this.topNav).marginBottom);

        const availWidth = document.documentElement.clientWidth - padX;
        const availHeight = window.innerHeight - padY - this.topNav.offsetHeight - navMargin;

        // Größe des Layouts in Grundgröße (Zoom 1) messen
        this.container.classList.add('layout-scaled');
        this.container.style.setProperty('--ui-scale', '1');
        const rect = this.container.getBoundingClientRect();

        // Etwas abrunden, damit Rundungsfehler keine Scrollbalken erzeugen
        const fit = Math.min(availWidth / rect.width, availHeight / rect.height);
        const scale = Math.min(Math.floor(fit * 100) / 100, LayoutScaler.MAX_SCALE);

        if (scale < LayoutScaler.MIN_SCALE || availWidth < rect.width) {
            // Zu wenig Platz: normales, fließendes Layout (mit Scrollen)
            this.container.classList.remove('layout-scaled');
            this.container.style.removeProperty('--ui-scale');
            this.topNav.style.maxWidth = '';
            return;
        }

        this.container.style.setProperty('--ui-scale', String(scale));
        this.topNav.style.maxWidth = `${rect.width * scale}px`;
    }
}
