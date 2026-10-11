const PRESET_STORAGE_KEY = 'bma_scenario_presets';
const ALARM_TYPES = ['aut Meld', 'Handmeld', 'Sprinkler', 'Störung'];

// Prüft eine Liste von Schleifen und vereinheitlicht sie. Wirft einen Error mit lesbarer Meldung.
function normalizePresets(data) {
    if (!Array.isArray(data)) {
        throw new Error("Erwartet wird eine Liste von Schleifen (JSON-Array).");
    }

    const toInt = (value, min, max, field, where) => {
        const n = Number(value);
        if (!Number.isInteger(n) || n < min || n > max) {
            throw new Error(`${where}: ${field} muss eine Zahl von ${min} bis ${max} sein (ist: ${JSON.stringify(value)}).`);
        }
        return n;
    };

    return data.map((p, i) => {
        const where = `Eintrag ${i + 1}`;
        if (!p || typeof p !== 'object') throw new Error(`${where}: kein gültiges Objekt.`);

        const typeText = p.typeText ?? 'aut Meld';
        if (!ALARM_TYPES.includes(typeText)) {
            throw new Error(`${where}: unbekannte Meldungsart ${JSON.stringify(typeText)}.`);
        }
        if (typeof p.loc !== 'string') {
            throw new Error(`${where}: Standorttext (loc) fehlt.`);
        }

        return {
            group: toInt(p.group, 1, 999, 'Gruppe', where),
            detector: toInt(p.detector, 1, 99, 'Melder', where),
            count: toInt(p.count ?? 1, 1, 99, 'Anzahl', where),
            typeText: typeText,
            loc: p.loc.substring(0, 20)
        };
    });
}

class AdminUI {
    constructor(bmz) {
        this.bmz = bmz;
        this.presetAlarms = [];

        this.initDOM();
        this.bindEvents();

        this.initPresets();
    }

    // Lädt Presets: 1. ?scenario=... (explizit angefordert) -> 2. LocalStorage -> 3. default.json
    async initPresets() {
        const urlParams = new URLSearchParams(window.location.search);
        const scenarioParam = urlParams.get('scenario') || urlParams.get('szenario');

        if (scenarioParam) {
            // Nur relative Dateinamen zulassen (z. B. "foobar", "foobar.json", "szenarien/foobar")
            if (/^[\w-]+(\/[\w-]+)*(\.json)?$/.test(scenarioParam)) {
                const fileName = scenarioParam.endsWith('.json') ? scenarioParam : `${scenarioParam}.json`;
                if (await this.loadPresetsFromFile(fileName)) return;
            } else {
                showToast(`Ungültiger Szenario-Name: ${scenarioParam}`, 'error');
            }
        }

        if (this.loadPresetsFromStorage()) return;

        await this.loadPresetsFromFile('default.json');
    }

    async loadPresetsFromFile(fileName) {
        try {
            const response = await fetch(fileName, { cache: 'no-cache' });
            if (!response.ok) throw new Error(`HTTP-Status ${response.status}`);
            this.setPresets(normalizePresets(await response.json()));
            return true;
        } catch (err) {
            showToast(`Datei ${fileName} konnte nicht geladen werden: ${err.message}`, 'error');
            return false;
        }
    }

    loadPresetsFromStorage() {
        let saved = null;
        try {
            saved = localStorage.getItem(PRESET_STORAGE_KEY);
        } catch (e) {
            return false;
        }
        if (saved === null) return false;

        try {
            this.presetAlarms = normalizePresets(JSON.parse(saved));
            this.renderPresets();
            return true;
        } catch (err) {
            showToast(`Gespeicherte Schleifen sind ungültig und werden ignoriert: ${err.message}`, 'error');
            return false;
        }
    }

    setPresets(presets) {
        this.presetAlarms = presets;
        this.saveToStorage();
        this.renderPresets();
    }

    saveToStorage() {
        try {
            localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(this.presetAlarms));
        } catch (e) {
            showToast("Schleifen konnten nicht im Browser gespeichert werden.", 'error');
        }
    }

    initDOM() {
        this.drawer = document.getElementById('admin-drawer');
        this.btnToggle = document.getElementById('btn-toggle-admin');
        this.btnClose = document.getElementById('btn-close-admin');

        // Top Command Buttons
        this.btnNew = document.getElementById('btn-adm-new');
        this.btnImportTrigger = document.getElementById('btn-adm-import-trigger');
        this.btnExport = document.getElementById('btn-adm-export');
        this.btnDefaults = document.getElementById('btn-adm-defaults');
        this.btnClear = document.getElementById('btn-adm-clear');
        this.inputFile = document.getElementById('input-adm-file');

        // Container
        this.alarmListContainer = document.getElementById('admin-alarm-list');
        this.presetListContainer = document.getElementById('admin-preset-list');

        // Modal Elements
        this.modal = document.getElementById('admin-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalIndex = document.getElementById('modal-preset-index');
        this.modalGroup = document.getElementById('modal-group');
        this.modalDetector = document.getElementById('modal-detector');
        this.modalCount = document.getElementById('modal-count');
        this.modalType = document.getElementById('modal-type');
        this.modalLoc = document.getElementById('modal-loc');
        this.btnModalCancel = document.getElementById('btn-modal-cancel');
        this.btnModalSave = document.getElementById('btn-modal-save');
    }

    bindEvents() {
        if (this.btnToggle) this.btnToggle.addEventListener('click', () => this.drawer?.classList.toggle('open'));
        if (this.btnClose) this.btnClose.addEventListener('click', () => this.drawer?.classList.remove('open'));

        // BMZ Reset
        if (this.btnClear) this.btnClear.addEventListener('click', () => this.bmz.resetBMZ());

        // Neue Schleife erfassen
        if (this.btnNew) {
            this.btnNew.addEventListener('click', () => this.openModalForNew());
        }

        // Standard-Schleifen aus default.json wiederherstellen
        if (this.btnDefaults) {
            this.btnDefaults.addEventListener('click', async () => {
                if (!confirm("Alle Schleifen durch die Standard-Schleifen ersetzen? Eigene Änderungen gehen verloren.")) return;
                if (await this.loadPresetsFromFile('default.json')) {
                    showToast("Standard-Schleifen geladen.");
                }
            });
        }

        // Export (JSON)
        if (this.btnExport) {
            this.btnExport.addEventListener('click', () => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.presetAlarms, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", "bma_szenario.json");
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
            });
        }

        // Import (JSON)
        if (this.btnImportTrigger && this.inputFile) {
            this.btnImportTrigger.addEventListener('click', () => this.inputFile.click());

            this.inputFile.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        this.setPresets(normalizePresets(JSON.parse(event.target.result)));
                        showToast(`${this.presetAlarms.length} Schleifen importiert.`);
                    } catch (err) {
                        showToast(`Import fehlgeschlagen: ${err.message}`, 'error');
                    }
                };
                reader.readAsText(file);
                this.inputFile.value = '';
            });
        }

        // Modal Handler
        if (this.btnModalCancel) this.btnModalCancel.addEventListener('click', () => this.closeModal());
        if (this.btnModalSave) this.btnModalSave.addEventListener('click', () => this.saveModalData());
    }

    openModalForNew() {
        this.modalTitle.innerText = "Neue Schleife erfassen";
        this.modalIndex.value = "-1";
        this.modalGroup.value = "1";
        this.modalDetector.value = "1";
        this.modalCount.value = "1";
        this.modalType.value = "aut Meld";
        this.modalLoc.value = "";
        this.modal.classList.add('open');
    }

    openModalForEdit(index) {
        const item = this.presetAlarms[index];
        if (!item) return;

        this.modalTitle.innerText = "Schleife bearbeiten";
        this.modalIndex.value = index;
        this.modalGroup.value = item.group;
        this.modalDetector.value = item.detector;
        this.modalCount.value = item.count;
        this.modalType.value = item.typeText;
        this.modalLoc.value = item.loc;
        this.modal.classList.add('open');
    }

    closeModal() {
        this.modal.classList.remove('open');
    }

    saveModalData() {
        const index = parseInt(this.modalIndex.value, 10);
        let newItem;
        try {
            [newItem] = normalizePresets([{
                group: Number(this.modalGroup.value),
                detector: Number(this.modalDetector.value),
                count: Number(this.modalCount.value),
                typeText: this.modalType.value,
                loc: this.modalLoc.value
            }]);
        } catch (err) {
            showToast(err.message.replace(/^Eintrag 1: /, ''), 'error');
            return;
        }

        const presets = [...this.presetAlarms];
        if (index === -1) {
            presets.push(newItem);
        } else {
            presets[index] = newItem;
        }

        this.setPresets(presets);
        this.closeModal();
    }

    createListItem(text, buttons) {
        const div = document.createElement('div');
        div.className = 'admin-list-item';

        const info = document.createElement('span');
        info.className = 'admin-list-text';
        info.innerText = text;

        const actionContainer = document.createElement('div');
        actionContainer.className = 'admin-list-actions';
        buttons.forEach(({ label, className, onClick }) => {
            const btn = document.createElement('button');
            btn.className = `btn-small ${className}`;
            btn.innerText = label;
            btn.addEventListener('click', onClick);
            actionContainer.appendChild(btn);
        });

        div.appendChild(info);
        div.appendChild(actionContainer);
        return div;
    }

    renderEmpty(container, text) {
        const span = document.createElement('span');
        span.className = 'admin-empty';
        span.innerText = text;
        container.replaceChildren(span);
    }

    // Rendert die verfügbaren Schleifen (inkl. Meldungsart)
    renderPresets() {
        if (!this.presetListContainer) return;

        if (this.presetAlarms.length === 0) {
            this.renderEmpty(this.presetListContainer, "Keine Schleifen vorhanden");
            return;
        }

        this.presetListContainer.replaceChildren(...this.presetAlarms.map((p, index) =>
            this.createListItem(
                // Anzeige von [Gruppe/Melder] Art - Standort
                `[${String(p.group).padStart(3,'0')}/${String(p.detector).padStart(2,'0')}] ${p.typeText} - ${p.loc}`,
                [
                    { label: "Auslösen", className: 'btn-trigger', onClick: () => this.bmz.addAlarm(p.group, p.detector, p.count, p.typeText, p.loc) },
                    { label: "Bearbeiten", className: 'btn-edit', onClick: () => this.openModalForEdit(index) }
                ]
            )
        ));
    }

    // Rendert aktive Schleifen (inkl. Meldungsart)
    render(state) {
        if (!this.alarmListContainer) return;

        if (!state.alarms || state.alarms.length === 0) {
            this.renderEmpty(this.alarmListContainer, "Keine aktiven Schleifen");
            return;
        }

        this.alarmListContainer.replaceChildren(...state.alarms.map((a) =>
            this.createListItem(
                `[${a.group}/${a.detector}] ${a.typeText} - ${a.loc}`,
                [{ label: "Löschen", className: 'btn-delete', onClick: () => this.bmz.removeAlarm(a.id) }]
            )
        ));
    }
}
