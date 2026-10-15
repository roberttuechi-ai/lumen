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
  - „Teilen / In Fotos sichern“ öffnet das Teilen-Menü des Handys (Web Share API). Die JPG wird vorher erzeugt, in voller Auflösung (bis zur Canvas-Grenze von 16 MP) und mit Qualität 0,92, Dateiname `lumen-JJJJMMTT-HHMM.jpg`. Auf dem iPhone speichert „Bild sichern“ das Foto in der Fotos-App; WhatsApp, Instagram, Nachrichten und Mail stehen im selben Menü. Gibt es schon einen KI-Text, wird er mitgegeben und in die Zwischenablage kopiert (Instagram übernimmt keinen Share-Text).
  - „Bild speichern“ bleibt der Download (bis 2400 px Breite). Auf dem Desktop, wo Datei-Teilen fehlt, ist das der einzige Button.
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
| `MOCK_DELAY_MS` | Zufall 1,5–4 s | Wartezeit im Testmodus, nur 0–5000 |
| `RESEND_API_KEY` / `MAIL_FROM` | – | Magic-Link per Resend |
| `STRIPE_SECRET_KEY` | – | Stripe-API |
| `STRIPE_WEBHOOK_SECRET` | – | Signatur von `/stripe/webhook` |
| `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_YEARLY` | – | Price-IDs für 4,99 €/Monat und 39 €/Jahr |

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
- Geheimnisse (OpenRouter, Resend, Stripe, Webhook-Secret, Session-Secret) werden nicht geloggt. Ein Anmeldelink erscheint nur in der Konsole, wenn `RESEND_API_KEY` fehlt **und** `NODE_ENV` nicht `production` ist.
- Öffentlich nur mit Zugang: Einladungscodes und/oder E-Mail-Konto, dazu Tagesbudget.

## Testbild
`testdaten/hallstatt.jpg`: Thisisbossi, Wikimedia Commons, CC BY-SA 3.0 (siehe `testdaten/QUELLE.txt`).


---

# Online stellen (Testphase)

## Projektstruktur
```
server.js              Server: App ausliefern, Login, Limits, KI-Anfragen, Sprache
public/index.html      App
public/i18n.js         Wörterbuch (de, en, it, fr, es), ohne npm-Paket
public/course.js       Fotokurs in denselben fünf Sprachen
public/                datenschutz.html, impressum.html, agb.html, widerruf.html (deutsch, verbindlich)
public/en/             dieselben vier Seiten auf Englisch (Übersetzungshilfe)
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

## Konten, Gratis und Pro

Neben den Einladungscodes gibt es ein Konto per E-Mail (kein Passwort).

- Der Nutzer trägt die Adresse ein. Der Server schickt einen signierten Link (15 Minuten, einmal nutzbar, soweit der Prozess nicht neu startet).
- Der Link setzt das Cookie `lumen_s` mit der E-Mail, 30 Tage, HttpOnly.
- Versand über die Resend-HTTP-API (`RESEND_API_KEY`, `MAIL_FROM`). Fehlt der Schlüssel, schreibt der Server eine Warnung und läuft weiter. Nur außerhalb von `NODE_ENV=production` steht der Link dann in der Konsole.
- Anfragen für Links sind begrenzt: 8 pro IP und 3 pro E-Mail-Adresse in 15 Minuten.

| Tarif | Analysen | Modelle | Texte | Fotokurs |
|---|---|---|---|---|
| Gratis | 3 pro rollierende Woche | nur Gemini (`google/gemini-3.8-flash`) | nein | die ersten zwei Lektionen, der Rest mit Pro-Hinweis |
| Pro | 15 pro Tag | GPT, Gemini, Claude | ja | alle sechs |
| Einladungscode | wie bisher 20/Code und 30/IP pro Tag | alle drei | ja | alle sechs |

Pro ist ein Stripe-Abo mit Status `active` oder `trialing` für die E-Mail des Kontos. Stripe ist die Quelle, der Server hält das Ergebnis wenige Minuten im Cache. Der Webhook `/stripe/webhook` leert bzw. setzt diesen Cache bei `checkout.session.completed`, `customer.subscription.updated` und `customer.subscription.deleted`. Die Signatur (`Stripe-Signature`) wird mit HMAC-SHA256 über den unveränderten Body geprüft.

Fehlen `STRIPE_SECRET_KEY` oder beide Preis-IDs, startet der Server trotzdem. Statt der Kauf-Buttons steht **Pro bald verfügbar**.

Vor dem Checkout muss die Checkbox gesetzt sein: AGB plus ausdrückliche Zustimmung, dass der Dienst sofort beginnt und das Widerrufsrecht erlischt (FAGG § 18). „Abo verwalten“ öffnet das Stripe-Kundenportal.

Das globale Tagesbudget (`DAILY_BUDGET_USD`) gilt für alle Tarife.

## Was Robert in Stripe, Resend und Render einträgt

1. **Resend** (https://resend.com): Domain verifizieren, API-Schlüssel erzeugen. `MAIL_FROM` muss eine Adresse dieser Domain sein, z. B. `Lumen <login@deine-domain.at>`.
2. **Stripe-Produkt** „Lumen Pro“ mit zwei Preisen, Währung EUR, wiederkehrend:
   - Monat: **4,99 €** → Price-ID nach `STRIPE_PRICE_MONTHLY`
   - Jahr: **39 €** → Price-ID nach `STRIPE_PRICE_YEARLY`
3. **Zahlungsmethoden** im Stripe-Dashboard aktivieren (Karten und was sonst automatisch angeboten werden soll). Der Checkout setzt keine feste Liste, damit Stripe die automatischen Methoden aus dem Dashboard nimmt. Aktionscodes sind erlaubt. Die Checkout-Sprache folgt der gewählten App-Sprache (`de`, `en`, `it`, `fr` oder `es`).
4. **Webhook** im Stripe-Dashboard anlegen:
   - URL: `https://lumen-67oi.onrender.com/stripe/webhook`
   - Ereignisse: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Signing-Secret nach `STRIPE_WEBHOOK_SECRET`
5. **Kundenportal** im Stripe-Dashboard aktivieren (Kündigen, Zahlungsmittel, Rechnungen) und die Rückkehr-URL auf `https://lumen-67oi.onrender.com` setzen.
6. In **Render** die neuen Variablen aus `render.yaml` eintragen (`sync: false`, Render fragt sie ab). Bestehende Variablen (`OPENROUTER_API_KEY`, `ACCESS_CODES`, `SESSION_SECRET`, Limits, Budget) bleiben.
7. **AGB und Widerruf** (`public/agb.html`, `public/widerruf.html`) vor dem Verkauf juristisch prüfen. Offene Stellen sind im HTML als Kommentar `TODO RECHTLICHE PRÜFUNG` markiert und auf der Seite nicht sichtbar. Das betrifft auch Umsatzsteuer (Kleinunternehmer oder Bruttopreis). Die englischen Seiten unter `public/en/` sind nur eine Übersetzungshilfe. Verbindlich bleibt der deutsche Text. Dafür braucht es keine neue Render-Variable.

## Sprachen

Die Oberfläche, die Magic-Link-Mail, Fehlermeldungen, der Fotokurs, die KI-Bewertung und die Instagram-Texte folgen der Sprache des Nutzers.

- Unterstützt: Deutsch (`de`), Englisch (`en`), Italienisch (`it`), Französisch (`fr`), Spanisch (`es`).
- Ohne eigene Wahl nimmt der Server den ersten passenden Eintrag aus `Accept-Language`. `de-AT`, `de-DE` und `de-CH` werden Deutsch. `it-IT` wird Italienisch. Passt keine Sprache (zum Beispiel `pt-BR`), ist die Seite Englisch.
- Im Browser gilt dieselbe Reihenfolge: Cookie `lumen_lang`, sonst `localStorage` (`lumenLang`), sonst `navigator.languages`, sonst Englisch. Der Schalter in der Kopfzeile schreibt Cookie und localStorage. Das Cookie ist nicht HttpOnly, ein Jahr gültig, SameSite=Lax, damit der Server die Mail, Stripe (`locale`) und die Prompts in dieser Sprache ausliefert.
- `<html lang>` setzt der Browser auf den gewählten Code.
- Impressum, Datenschutz, AGB und Widerruf bleiben auf Deutsch verbindlich (`/impressum` und so weiter). Englische Fassungen liegen unter `/en/…` und sagen auf der Seite, dass die deutsche Fassung vorgeht. Italienisch, Französisch und Spanisch verlinken auf die englischen Seiten.
- Es kommt kein neues npm-Paket dazu. Die Texte stehen in `public/i18n.js` und `public/course.js`.

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
5. Impressum, Datenschutz, AGB und Widerruf prüfen: `public/impressum.html`, `public/datenschutz.html`, `public/agb.html`, `public/widerruf.html`. Offene Rechtsfragen stehen als HTML-Kommentar `TODO RECHTLICHE PRÜFUNG`.

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
