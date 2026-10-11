# BMA-Sim

Simulator einer Feuerwehr-Erstinformationsstelle (FAT/FBF) nach **DIN 14675** – zum Üben der Bedienung einer Brandmelderzentrale (BMZ) im Einsatz- und Übungsbetrieb.

Die Anwendung läuft komplett im Browser und muss nicht installiert werden. Auf dem Smartphone oder Tablet lässt sie sich über „Zum Startbildschirm hinzufügen“ als App (PWA) ablegen.

## Funktionen

- **Feuerwehr-Anzeigetableau (FAT)** mit Meldergruppe/Melder, erster und letzter Meldung, Anzeigeebene und Historie
- **Feuerwehr-Bedienfeld (FBF)** mit den üblichen Tasten, z. B. Akustische Signale ab, BMZ rückstellen, ÜE ab, Brandfall-Steuerungen ab
- **Zustandsanzeigen** für Betrieb, Alarm, Störung und Abschaltung sowie Summer
- **Admin-Oberfläche / Übungsleiter-Steuerkonsole**: Schleifen anlegen und bearbeiten (Gruppe, Melder, Anzahl, Meldungsart, Standorttext), Szenarien auslösen
- **Meldungsarten**: automatischer Melder, Handmelder, Sprinkler, Störung
- **Import/Export** von Konfigurationen als JSON, Zurücksetzen auf die Standard-Schleifen (`default.json`). Eigene Schleifen werden im Browser gespeichert.
- **Vollbildmodus**

## Nutzung

1. **Online:** [sigtec.github.io/bma-sim](https://sigtec.github.io/bma-sim/) im Browser öffnen.
2. **Lokal:** Repository klonen oder als ZIP herunterladen (**Code → Download ZIP**) und entpacken. Browser blockieren beim direkten Öffnen von `index.html` (Doppelklick, `file://`) das Laden der Schleifen und den Offline-Betrieb. Deshalb im entpackten Ordner einen einfachen Webserver starten, z. B.
   - `python -m http.server 8000` oder
   - `npx serve`

   und anschließend [http://localhost:8000](http://localhost:8000) (bzw. die angezeigte Adresse) öffnen.

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
| `icons/` | App-Icons (BMA-Hinweisschild in Anlehnung an DIN 4066) |
| `sw.js` | Service Worker für Offline-Betrieb |

## Feedback

Feedback gerne [hier auf Github](https://github.com/sigtec/bma-sim/issues) oder per E-Mail an [bma-sim@lg6.de](mailto:bma-sim@lg6.de)
