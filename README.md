# EasyReader
# 📄 Programmplan: Chrome Extension „Textübersetzer in Leichte/Einfache Sprache“

---

## Inhaltsverzeichnis

1. Projektübersicht
2. Ziele
3. Hauptfunktionen
4. Benutzerperspektive (User Storys)
5. Technikübersicht
    - 5.1 Projektarchitektur
    - 5.2 Technologien
    - 5.3 Ziel-Tags für Übersetzung
6. Ablauf / Logik
7. Milestones / To-dos
8. Tabellenstruktur (Supabase)
9. API-Proxy
10. Erweiterungen / Ideen für später

---

## 1. **Projektübersicht**

- **Name**: (Arbeitstitel, z.B. „EasyReader“)
- **Beschreibung**:\
  Chrome Extension, die Webseiteninhalte per Klick in „Leichte Sprache“ oder „Einfache Sprache“ übersetzt und direkt den Originaltext auf der Seite ersetzt. Übersetzungen werden lokal und in einer zentralen Datenbank zwischengespeichert.

---

## 2. **Ziele**

- Benutzer können Texte schnell und unkompliziert in verständlicher Sprache lesen.
- Schutz des API-Keys durch Proxy-Server.
- Minimierung der API-Requests durch intelligentes Caching (Local Storage + zentrale Datenbank).
- Datenschutzkonformität durch Filterung sensibler Inhalte.
- Gute User Experience durch Ladeanzeigen und Wechseloption auf Originaltext.

---

## 3. **Hauptfunktionen**

- **Übersetzungsmodi**: Auswahl zwischen „Leichte Sprache“ und „Einfache Sprache“.
- **Originaltext wiederherstellen**: Button zum Zurückwechseln auf den Originaltext.
- **Caching-Logik**:
  - Zuerst Suche im Local Storage.
  - Falls nicht vorhanden: Suche in Supabase-Datenbank (Hash-Verfahren).
  - Falls dort auch nicht vorhanden: Anfrage an KI-API über Proxy.
  - Übersetzungen werden für 7 Tage gespeichert.
- **Ladeanzeige**: Anzeige während Übersetzungsvorgang läuft.
- **Datenschutz**: Vermeidung der Übersetzung sensibler Daten (z.B. Passwortfelder, private Inhalte).

---

## 4. **Benutzerperspektive (User Storys)**

- *Als Nutzer* möchte ich Texte auf Webseiten in Leichte oder Einfache Sprache übersetzen lassen, *damit ich sie besser verstehen kann*.
- *Als Nutzer* möchte ich schnell zwischen Übersetzung und Originaltext wechseln können.
- *Als Nutzer* möchte ich während der Übersetzung sehen, dass der Vorgang läuft (Ladeanzeige).

---

## 5. **Technikübersicht**

## 5.1 **Projektarchitektur**

```
chrome-translate-extension/
│
├── public/                     # Statische Assets
│   └── icon.png                # Extension-Icon
│
├── src/
│   ├── content/                # Content Scripts (DOM-Manipulation)
│   │   └── main.ts             # Einstiegspunkt für DOM-Zugriff & Übersetzung
│   │
│   ├── popup/                  # Popup-UI der Extension
│   │   ├── popup.html
│   │   └── popup.ts
│   │
│   ├── background/             # Hintergrundprozesse (falls verwendet)
│   │   └── background.ts
│   │
│   ├── core/                   # Zentrale Logik & Utilities
│   │   ├── translation.ts      # Hauptlogik: Caching + KI + Supabase
│   │   ├── hashing.ts          # SHA-256 Hash-Funktionen
│   │   ├── storage.ts          # Zugriff auf Local Storage
│   │   └── supabase.ts         # Zugriff auf Supabase-Datenbank
│   │
│   └── types/                  # Gemeinsame Typdefinitionen
│       └── index.ts
│
├── proxy-server/              # Node.js-Proxy-Server zum Schutz des API-Keys
│   └── index.ts
│
├── manifest.json              # Chrome Extension Konfiguration (v3)
├── tsconfig.json              # TypeScript-Konfiguration
├── package.json               # NPM-Abhängigkeiten und Scripts
└── README.md
```

---

## 5.2 **Technologien**

- **Frontend**:

  - Chrome Extension (Manifest v3)
  - HTML/CSS/TypeScript

- **Backend**:

  - Supabase (Datenbank)
  - Node.js-Proxy-Server (für API-Request)

- **Weitere Tools**:

  - Hashing (z.B. SHA-256)
  - Local Storage API

## 5.3 **Ziel-Tags für Übersetzung**

Folgende HTML-Tags werden standardmäßig für die Übersetzung berücksichtigt, sofern sie direkt Text enthalten:

- `p` – Absatz
- `h1` bis `h6` – Überschriften
- `span` – Inline-Textcontainer
- `li` – Listenelemente
- `a` – Linktext
- `label` – Formular-Label
- `button` – Beschriftung von Buttons
- `td`, `th` – Tabellenzellen
- `div` – nur wenn keine Kindelemente vorhanden sind und Text enthalten ist

Diese Auswahl sorgt dafür, dass reiner Text ohne strukturelle oder interaktive Elemente gezielt und zuverlässig ersetzt werden kann.

---

## 6. **Ablauf / Logik**

1. Benutzer klickt auf Button „Leichte Sprache“, „Einfache Sprache“ oder „Originaltext“.
2. Extension ermittelt Text auf der Seite.
3. Hash des Textes wird erzeugt.
4. Suche im Local Storage:
   - Treffer ➔ Verwende gespeicherte Übersetzung.
   - Kein Treffer ➔ Suche in Supabase:
     - Treffer ➔ Übersetzung verwenden + ins Local Storage cachen.
     - Kein Treffer ➔ Anfrage an KI via Proxy senden.
5. Übersetzungsergebnis wird:
   - Im Local Storage gespeichert (mit Zeitstempel)
   - In Supabase gespeichert (mit Zeitstempel)
6. Übersetzter Text ersetzt den Originaltext im DOM.
7. Ladeanzeige sichtbar während des Prozesses.
8. Originaltext jederzeit durch Klick wiederherstellbar.

---

## 7. **Milestones / To-dos**

- Grundstruktur der Chrome Extension aufsetzen.
- Proxy-Server für API-Schutz bauen.
- Supabase-Tabellenstruktur planen (Hash, Übersetzung, Timestamp).
- Local Storage Caching einbauen.
- Text-Extraktion + DOM-Manipulation entwickeln.
- Übersetzungslogik einbauen (inkl. Ladeanzeige).
- Datenschutzfilter für sensible Inhalte entwickeln.
- Finales Testing auf echten Webseiten.
- Veröffentlichung im Chrome Web Store.

---

## 8. **Tabellenstruktur (Supabase)**

**Tabelle:** `translations`

| Feldname      | Typ                | Beschreibung                           |
| ------------- | ------------------ | -------------------------------------- |
| `id`          | UUID (Primary Key) | Automatisch generierte ID              |
| `hash`        | Text               | Hash des Originaltexts (z. B. SHA-256) |
| `mode`        | Text               | "leicht" oder "einfach"                |
| `translation` | Text               | Übersetzter Text                       |
| `created_at`  | Timestamp (TZ)     | Automatisch: Zeitstempel beim Einfügen |

**Zusätze:**

- Index auf `hash` und `mode` für schnellere Abfragen
- Automatisches Löschen alter Einträge (z. B. via CRON oder clientseitig nach 7 Tagen)

## 9. **API-Proxy**

Der API-Proxy wird genutzt, um sensible Informationen wie den API-Key zu schützen. Dieser wird **nicht im Frontend** sichtbar gemacht, sondern sicher auf dem Server gespeichert.

- **Speicherung**: Der API-Key wird in einer `.env` Datei auf dem Proxy-Server hinterlegt.
- **Zugriff**: Der Proxy verarbeitet eingehende Anfragen, fügt den API-Key serverseitig hinzu und leitet sie sicher an die KI-API weiter.
- **Sicherheit**: So bleibt der Schlüssel vor Client-Zugriffen verborgen und kann nicht aus dem Browser extrahiert werden.

---

## 10. **Erweiterungen / Ideen für später**

- Feedback-Button: Möglichkeit für User, Verbesserungsvorschläge für Übersetzungen abzugeben.
- Unterstützung für weitere Sprachen.
- Automatische Erkennung von schwierigem Text.
- Nutzerkonto für eigene Übersetzungsverläufe.
- Whitelisting oder Blacklisting bestimmter Domains.

