# BMA-Sim

Simulator einer Feuerwehr-Erstinformationsstelle (FAT/FBF) nach **DIN 14675** – zum Üben der Bedienung einer Brandmelderzentrale (BMZ) im Einsatz- und Übungsbetrieb.

Die Anwendung läuft komplett im Browser und muss nicht installiert werden. Auf dem Smartphone oder Tablet lässt sie sich über „Zum Startbildschirm hinzufügen“ als App (PWA) ablegen.

## Funktionen

- **Feuerwehr-Anzeigetableau (FAT)** mit Meldergruppe/Melder, erster und letzter Meldung, Anzeigeebene und Historie
- **Feuerwehr-Bedienfeld (FBF)** mit den üblichen Tasten, z. B. Akustische Signale ab, BMZ rückstellen, ÜE ab, Brandfall-Steuerungen ab
- **Zustandsanzeigen** für Betrieb, Alarm, Störung und Abschaltung sowie Summer
- **Admin-Oberfläche / Übungsleiter-Steuerkonsole**: Schleifen anlegen und bearbeiten (Gruppe, Melder, Anzahl, Meldungsart, Standorttext), Szenarien auslösen
- **Meldungsarten**: automatischer Melder, Handmelder, Sprinkler, Störung
- **Import/Export** von Konfigurationen als JSON, Reset auf Standardwerte (`default.json`)
- **Vollbildmodus**

## Nutzung

1. **Online:** [sigtec.github.io/bma-sim](https://sigtec.github.io/bma-sim/) im Browser öffnen.
2. **Lokal:** Repository klonen oder als ZIP herunterladen (**Code → Download ZIP**), entpacken und `index.html` per Doppelklick im Browser öffnen. Es ist keine Installation und kein Webserver nötig.

## Bildtafeln

Für Übungsszenarien können diese [Bildtafeln](BMA-Sim_Bildtafeln.pdf) verwendet werden. Diese lassen sich doppelseitig drucken und laminieren.

## Projektstruktur

| Datei / Ordner | Beschreibung |
| --- | --- |
| `index.html` | Oberfläche der Anwendung |
| `style.css` | Styling |
| `js/` | Programmlogik |
| `default.json` | Standardkonfiguration der Schleifen |
| `manifest.json` | PWA-Manifest |
| `sw.js` | Service Worker für Offline-Betrieb |

## Feedback

Feedback gerne [hier auf Github](https://github.com/sigtec/bma-sim/issues) oder per E-Mail an [bma-sim@lg6.de](mailto:bma-sim@lg6.de)
