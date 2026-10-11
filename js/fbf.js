class FBF {
    constructor(bmz) {
        this.bmz = bmz;
        this.state = null;
        this.audioCtx = null;
        this.buzzerInterval = null;
        this.resetHoldTimer = null;

        this.initDOM();
        this.bindEvents();
    }

    initDOM() {
        this.ledBetrieb = document.getElementById('fbf-led-betrieb');
        this.ledUeAusgeloest = document.getElementById('fbf-led-ue-ausgeloest');
        this.ledLoeschanlage = document.getElementById('fbf-led-loeschanlage');
        this.ledBrandfall = document.getElementById('fbf-led-brandfall');
        this.ledAkustik = document.getElementById('fbf-led-akustik');
        this.ledUeAb = document.getElementById('fbf-led-ue-ab');

        this.btnBrandfall = document.getElementById('btn-fbf-brandfall');
        this.btnAkustik = document.getElementById('btn-fbf-akustik');
        this.btnBmzReset = document.getElementById('btn-bmz-reset');
        this.btnUeAb = document.getElementById('btn-fbf-ue-ab');
        this.btnUeTest = document.getElementById('btn-fbf-ue-test');

        this.flapBmz = document.getElementById('flap-bmz');
        this.flapUe = document.getElementById('flap-ue');
    }

    isFlapOpen(flap) {
        return !!flap && flap.classList.contains('open');
    }

    bindEvents() {
        if (this.btnBrandfall) this.btnBrandfall.addEventListener('click', () => this.bmz.toggleBrandfallSteuerung());
        if (this.btnAkustik) this.btnAkustik.addEventListener('click', () => this.bmz.toggleAkustischeSignale());
        if (this.btnUeAb) this.btnUeAb.addEventListener('click', () => this.bmz.toggleUeAb());

        [this.flapBmz, this.flapUe].forEach(flap => {
            if (!flap) return;
            flap.addEventListener('click', () => {
                const open = flap.classList.toggle('open');
                flap.setAttribute('aria-expanded', String(open));
            });
        });

        if (this.btnUeTest) {
            this.btnUeTest.addEventListener('click', () => {
                if (!this.isFlapOpen(this.flapUe)) {
                    showToast("Bitte zuerst die Schutzklappe öffnen!");
                    return;
                }
                this.bmz.testUe();
            });
        }

        // 5s Reset Hold Timer
        if (this.btnBmzReset) {
            const startReset = () => {
                if (!this.isFlapOpen(this.flapBmz)) {
                    showToast("Bitte zuerst die Schutzklappe öffnen!");
                    return;
                }
                this.btnBmzReset.classList.add('pressed');
                this.resetHoldTimer = setTimeout(() => {
                    this.resetHoldTimer = null;
                    this.btnBmzReset.classList.remove('pressed');
                    this.bmz.resetBMZ();
                }, 5000);
            };

            const stopReset = () => {
                this.btnBmzReset.classList.remove('pressed');
                if (this.resetHoldTimer) {
                    clearTimeout(this.resetHoldTimer);
                    this.resetHoldTimer = null;
                }
            };

            bindPress(this.btnBmzReset, startReset, stopReset);
        }

        // Audio bei Interaktion freischalten
        const unlock = () => this.unlockAudio();
        window.addEventListener('click', unlock, { once: true });
        window.addEventListener('touchstart', unlock, { once: true });
    }

    unlockAudio() {
        if (!this.audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) this.audioCtx = new AudioContextClass();
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    isBuzzerActive() {
        const s = this.state;
        return !!s && s.alarms.length > 0 && !s.buzzerSilenced && !s.akustikAb;
    }

    playPiezoBeep() {
        if (!this.audioCtx || this.audioCtx.state !== 'running') return;
        if (!this.isBuzzerActive()) return;

        try {
            let osc = this.audioCtx.createOscillator();
            let gain = this.audioCtx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(3000, this.audioCtx.currentTime);
            gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.15);
        } catch (e) {}
    }

    updateBuzzerSound() {
        if (this.isBuzzerActive()) {
            if (!this.buzzerInterval) {
                this.playPiezoBeep();
                this.buzzerInterval = setInterval(() => this.playPiezoBeep(), 400);
            }
        } else {
            if (this.buzzerInterval) {
                clearInterval(this.buzzerInterval);
                this.buzzerInterval = null;
            }
        }
    }

    render(state) {
        this.state = state;

        this.ledBetrieb?.classList.add('active');
        this.ledUeAusgeloest?.classList.toggle('active', !!state.ueAusgeloest);
        this.ledLoeschanlage?.classList.toggle('active', !!state.loeschanlageAusgeloest);
        this.ledBrandfall?.classList.toggle('active', !!state.brandfallAb);
        this.ledAkustik?.classList.toggle('active', !!state.akustikAb);
        this.ledUeAb?.classList.toggle('active', !!state.ueAb);

        this.updateBuzzerSound();
    }
}
