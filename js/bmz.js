class BMZ {
    constructor() {
        this.alarms = [];
        this.currentIndex = 0;

        // Zustände
        this.buzzerSilenced = false;
        this.brandfallAb = false;
        this.akustikAb = false;
        this.ueAb = false;
        this.ueAusgeloest = false;
        this.bmzStoerung = false;
        this.loeschanlageAusgeloest = false;
        this.lampTestActive = false;

        this.subscribers = [];
    }

    subscribe(callback) {
        this.subscribers.push(callback);
    }

    notify() {
        const state = {
            alarms: this.alarms,
            currentIndex: this.currentIndex,
            buzzerSilenced: this.buzzerSilenced,
            brandfallAb: this.brandfallAb,
            akustikAb: this.akustikAb,
            ueAb: this.ueAb,
            ueAusgeloest: this.ueAusgeloest,
            bmzStoerung: this.bmzStoerung,
            loeschanlageAusgeloest: this.loeschanlageAusgeloest,
            lampTestActive: this.lampTestActive
        };

        this.subscribers.forEach(callback => callback(state));
    }

    addAlarm(group, detector, count, typeText, loc) {
        const newAlarm = {
            id: Date.now() + Math.random(),
            group: String(group).padStart(3, '0'),
            detector: String(detector).padStart(2, '0'),
            count: String(count).padStart(2, '0'),
            typeText: typeText,
            loc: loc.substring(0, 20),
            read: false // Jeder Alarm startet rein als unread
        };

        this.alarms.push(newAlarm);
        // Fokus auf die neueste Meldung setzen
        this.currentIndex = this.alarms.length - 1;

        // Die ÜE bleibt ausgelöst, bis die BMZ zurückgestellt wird
        if (!this.ueAb) this.ueAusgeloest = true;

        this.buzzerSilenced = false;
        this.notify();
    }

    navigateAlarm(dir) {
        if (this.alarms.length <= 2) return;

        let targetIndex = this.currentIndex + dir;
        if (targetIndex >= 0 && targetIndex < this.alarms.length) {
            this.currentIndex = targetIndex;

            // Erst durch manuelles Durchscrollen wird die angelaufene Meldung gelesen
            if (this.alarms[this.currentIndex]) {
                this.alarms[this.currentIndex].read = true;
            }

            this.notify();
        }
    }

    removeAlarm(id) {
        this.alarms = this.alarms.filter(a => a.id !== id);
        if (this.currentIndex >= this.alarms.length) {
            this.currentIndex = Math.max(0, this.alarms.length - 1);
        }
        this.notify();
    }

    resetBMZ() {
        this.alarms = [];
        this.currentIndex = 0;
        this.buzzerSilenced = false;
        this.ueAusgeloest = false;
        this.loeschanlageAusgeloest = false;
        this.bmzStoerung = false;
        this.notify();
    }

    // "ÜE prüfen": löst die ÜE aus, ohne dass die BMZ in den Alarmzustand geht
    testUe() {
        this.ueAusgeloest = true;
        this.notify();
    }

    silenceBuzzer() {
        this.buzzerSilenced = true;
        this.notify();
    }

    setLampTest(active) {
        this.lampTestActive = active;
        this.notify();
    }

    toggleBrandfallSteuerung() {
        this.brandfallAb = !this.brandfallAb;
        this.notify();
    }

    toggleAkustischeSignale() {
        this.akustikAb = !this.akustikAb;
        this.notify();
    }

    toggleUeAb() {
        this.ueAb = !this.ueAb;
        this.notify();
    }

    toggleBMZStoerung() {
        this.bmzStoerung = !this.bmzStoerung;
        this.notify();
    }

    toggleLoeschanlage() {
        this.loeschanlageAusgeloest = !this.loeschanlageAusgeloest;
        this.notify();
    }
}
