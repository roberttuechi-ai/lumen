# Lumen – KI-Fotoassistent (Prototyp)

Web-App (`public/`) mit einem kleinen Node-Server (`server.js`, keine npm-Pakete nötig), der die Fotoanalyse über **OpenRouter** an drei Vision-Modelle schickt.

## Voraussetzungen
- Node.js 18 oder neuer (keine weiteren Pakete nötig)
- Ein OpenRouter-API-Schlüssel (https://openrouter.ai/keys) mit etwas Guthaben

## Starten (eigener Rechner)
Der Schlüssel wird **nur als Umgebungsvariable** an den Server übergeben. Er steht nie in der HTML-Datei und wird nie an den Browser geschickt.

macOS / Linux:
```bash
cd fotoassistent-prototyp
export OPENROUTER_API_KEY="sk-or-v1-…"   # eigenen Schlüssel einsetzen
node server.js
```
Windows (PowerShell):
```powershell
cd fotoassistent-prototyp
$env:OPENROUTER_API_KEY="sk-or-v1-…"
node server.js
```
Dann im Browser **http://localhost:8787** öffnen (am besten mit den Entwicklertools in der Handy-Ansicht).

Am Handy im selben WLAN: `http://<IP-des-Rechners>:8787`.

## Was passiert
- Das Foto wird **im Browser auf max. 1024 px verkleinert** (JPEG) und an `POST /api/analyse` geschickt.
- Der Server fragt **parallel** drei Modelle an (Standard):
  - GPT: `openai/gpt-6-luna`
  - Gemini: `google/gemini-3.8-flash`
  - Claude: `anthropic/claude-haiku-5.5`
- Jedes Modell liefert strenges JSON:
  - Punkte 0–10 und eine Begründung für Bildaufbau, Licht, Fokus & Schärfe, Belichtung, Farbe und Bildwirkung
  - 3 Tipps
  - Gesamteindruck
- Robustes Parsing: Markdown-Codeblöcke werden entfernt, das JSON-Objekt wird herausgelöst und überzählige Kommas werden korrigiert. Pro Modell gilt ein Timeout von 60 s.
- Fällt ein Modell aus, werden die anderen trotzdem angezeigt. Fallen alle aus, zeigt die App einen Hinweis und **Beispieldaten**.
- Der Prompt enthält einen **gemeinsamen Bewertungsmaßstab** (3 = schwach, 5 = solide, 7 = gut, 8 = sehr gut, 9–10 = herausragend) mit Ankern je Kategorie, damit die Modelle einheitlicher bewerten.
- Jedes Modell schlägt zusätzlich **Bearbeitungswerte** vor (Lightroom-ähnlich):
  - Belichtung (EV), Kontrast, Lichter, Tiefen, Weiß, Schwarz, Wärme, Sättigung, Dynamik, Schärfe
  - optional ein Zuschnitt
  - Die App übernimmt den **Konsens**: Median je Regler. Einen Zuschnitt gibt es nur, wenn die Mehrheit der Modelle einen vorschlägt.
- Im **Bearbeiten-Screen** wird das Bild per Canvas Pixel für Pixel bearbeitet:
  - Vorher/Nachher-Schieber
  - Regler, die mit den KI-Werten vorbelegt sind und sich frei anpassen lassen
  - Zuschnitt ein- und ausschaltbar
  - „Bild speichern“ lädt eine JPG-Datei herunter (bis 2400 px Breite, aus dem Originalfoto).
- `POST /api/texte` erzeugt Instagram-Texte auf Deutsch und Englisch mit Hashtags passend zu Bild und Ziel.
- `GET /api/status` zeigt, ob ein Schlüssel hinterlegt ist, und listet die Modelle.

## Optionen (Umgebungsvariablen)
| Variable | Standard | Zweck |
|---|---|---|
| `PORT` | 8787 | Port |
| `MODEL_OPENAI` / `MODEL_GOOGLE` / `MODEL_ANTHROPIC` | siehe oben | Modelle austauschen (IDs: https://openrouter.ai/api/v1/models) |
| `MODEL_TEXT` | openai/gpt-6-luna | Modell für Social-Media-Texte |
| `TIMEOUT_MS` | 60000 | Timeout pro Modell |
| `MOCK=1` | – | **Testmodus ohne echte KI** (synthetische, klar markierte Antworten, keine Kosten) |
| `MOCK_FAIL=claude` | – | simuliert im Testmodus den Ausfall eines Modells |
| `KEEP_AWAKE` | an, sobald `RENDER_EXTERNAL_URL` gesetzt ist | `0` schaltet das Wachhalten auf Render aus (siehe unten) |

## Kosten (Schätzung)
Preise laut OpenRouter-Modellliste am 15.10.2026, pro 1 Mio. Tokens Eingabe/Ausgabe:
- gpt-6-luna: $0,10 / $0,50
- claude-haiku-5.5: $0,10 / $0,50
- gemini-3.8-flash: $0,75 / $3,75

Gemessen am 15.10.2026:
- Analyse mit 3 Modellen inkl. Bearbeitungswerten: **ca. $0,005 pro Foto**
- Texte mit gpt-6-luna: **ca. $0,0005**

Der Server schreibt die tatsächlichen Kosten (`usage.cost` von OpenRouter) in die Konsole.

## Sicherheit
- Den Schlüssel nie in `index.html`, in ein Git-Repository oder in Screenshots schreiben.
- Der Server ist für lokale Tests gedacht und hat kein Login und kein Rate-Limit. So **nicht öffentlich ins Internet stellen**.

## Testbild
`testdaten/hallstatt.jpg`: Thisisbossi, Wikimedia Commons, CC BY-SA 3.0 (siehe `testdaten/QUELLE.txt`).


---

# Online stellen (Testphase)

## Projektstruktur
```
server.js              Server: App ausliefern, Login, Limits, KI-Anfragen
public/                index.html (App), datenschutz.html, impressum.html, Manifest, Icons
package.json           Start mit "npm start"
render.yaml            Blueprint für Render.com (Free-Plan, Region Frankfurt)
Dockerfile             Alternative für Railway, Fly.io oder einen eigenen Server
.env.example           Liste aller Variablen (ohne echte Werte)
testdaten/             Testfotos (werden nicht ins Docker-Image kopiert)
```

## Schutz in der Testphase
- **Einladungscodes:** `ACCESS_CODES="LUMEN-ANNA-7K2,LUMEN-MAX-9QX"` (durch Komma getrennt).
  - Ohne diese Variable ist die App **offen**. Das ist nur für lokale Tests gedacht.
  - Codes lang und zufällig wählen.
  - Wird ein Code aus der Liste entfernt, verliert er nach einem Neustart sofort den Zugang.
- **Session-Cookie:** HttpOnly, SameSite=Lax, über HTTPS mit „Secure“, gültig 14 Tage (`SESSION_DAYS`).
  - Signiert mit `SESSION_SECRET`. Ohne diese Variable müssen sich alle nach jedem Neustart neu anmelden.
- **Login-Schutz:** höchstens 10 Fehlversuche pro IP in 15 Minuten.
- **Nutzungslimits pro Tag** (Zeitzone Wien):
  - `DAILY_LIMIT_PER_CODE` (Standard 20 Analysen pro Code)
  - `DAILY_LIMIT_PER_IP` (Standard 30)
  - Texte: das Doppelte (`TEXT_LIMIT_FACTOR`)
- **Globales Tagesbudget:** `DAILY_BUDGET_USD` (Standard 1,00).
  - Sobald die echten OpenRouter-Kosten des Tages diesen Wert erreichen, werden weitere Anfragen abgelehnt.
  - Eine laufende Anfrage kann das Budget um etwa $0,01 überschreiten.
- ⚠️ Zähler und Budget liegen im **Arbeitsspeicher**. Bei einem Neustart werden sie zurückgesetzt, auch wenn ein Free-Dienst einschläft und wieder aufwacht.
  - **Zusätzlich im OpenRouter-Konto ein Ausgabenlimit für den Schlüssel setzen.** Das ist die harte Grenze.

## Produktion
- `PORT` kommt aus der Umgebung (Render und Railway setzen ihn automatisch).
- Health-Check: `GET /healthz`.
- Sicherheits-Header: CSP, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, HSTS bei HTTPS.
- Größenlimit 8 MB pro Anfrage (`MAX_BODY_BYTES`), Bildformat wird geprüft.
- PWA-Manifest und Icons: Am Handy über „Zum Home-Bildschirm“ als App hinzufügbar.

## Variante A: Render.com (Free) – empfohlen für den Start
1. Projektordner in ein **privates** GitHub-Repository hochladen. Die `.gitignore` schließt `.env`, Logs und `screens/` aus.
2. Auf render.com ein Konto anlegen, dann **New → Blueprint** wählen und das Repository auswählen. Render liest `render.yaml`.
3. Beim Anlegen fragt Render die geheimen Werte ab:
   - `OPENROUTER_API_KEY`: eigener Schlüssel, am besten ein **eigener Schlüssel nur für Lumen** mit Ausgabenlimit
   - `ACCESS_CODES`: Einladungscodes
   - `SESSION_SECRET` wird automatisch erzeugt.
4. Nach dem Deploy ist die App unter `https://lumen-xxxx.onrender.com` erreichbar.
5. Vorher Impressum und Datenschutz ausfüllen: `public/impressum.html` und `public/datenschutz.html`, alle `[markierten]` Stellen.

Einschränkungen des Free-Plans (Render-Doku, Stand 10/2026):
- Der Dienst schläft nach **15 Minuten ohne Anfragen** ein. Der erste Aufruf danach dauert **etwa 1 Minute**.
  Ist `RENDER_EXTERNAL_URL` gesetzt (Render setzt das bei Web-Diensten selbst), ruft Lumen etwa alle 10 Minuten die eigene öffentliche Adresse auf (`GET /healthz`), damit eingehende Anfragen den Dienst wach halten. Der Aufruf liegt vor den Zählern und geht weder in die Tageslimits noch ins Budget. `KEEP_AWAKE=0` schaltet das ab. Schlägt der Aufruf fehl, schreibt der Server eine kurze Zeile und läuft weiter. Zum Testen setzt `KEEP_AWAKE_MS` den Abstand in Millisekunden (1000 bis 2147483647, sonst 10 Minuten).
- 750 Free-Stunden pro Monat und Workspace. Bleibt der Dienst wach, laufen die Stunden durchgehend — ein Dienst kommt damit etwa auf einen Monat.
- 0,1 CPU und 512 MB RAM. Für Lumen reicht das, weil die Bildverarbeitung im Browser läuft.

## Variante B: Docker (Railway, Fly.io, eigener Server)
```bash
docker build -t lumen .
docker run -p 8080:8080 -e OPENROUTER_API_KEY=… -e ACCESS_CODES=… -e SESSION_SECRET=$(openssl rand -hex 32) lumen
```
- **Railway:** Repository verbinden. Railway erkennt das Dockerfile, Variablen im Dashboard setzen. Hobby-Plan $5 pro Monat, inklusive $5 Nutzung.
- **Fly.io:** `fly launch` (erkennt das Dockerfile), dann `fly secrets set OPENROUTER_API_KEY=… ACCESS_CODES=… SESSION_SECRET=…`. Kein Gratis-Kontingent; die kleinste dauerhaft laufende Maschine kostet ca. $2,19 pro 30 Tage (Region US). Region Frankfurt ist möglich, der Preis kann abweichen.

## Lokal wie in Produktion testen
```bash
ACCESS_CODES="TEST-1" SESSION_SECRET=geheim DAILY_LIMIT_PER_CODE=2 MOCK=1 node server.js
```
`MOCK=1` heißt: keine echte KI und keine Kosten.
