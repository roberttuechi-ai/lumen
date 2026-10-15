// Lumen – kleiner Server für den Prototyp. Start: OPENROUTER_API_KEY=... node server.js
// Der API-Schlüssel bleibt ausschließlich auf dem Server (Umgebungsvariable) und wird nie ausgegeben.
const http = require('http'), https = require('https'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const PORT = process.env.PORT || 8787;
const KEY = process.env.OPENROUTER_API_KEY;
const MODELS = [
  { label: 'GPT',    id: process.env.MODEL_OPENAI    || 'openai/gpt-6-luna' },
  { label: 'Gemini', id: process.env.MODEL_GOOGLE    || 'google/gemini-3.8-flash' },
  { label: 'Claude', id: process.env.MODEL_ANTHROPIC || 'anthropic/claude-haiku-5.5' },
];
const TEXT_MODEL = process.env.MODEL_TEXT || 'openai/gpt-6-luna';
const TIMEOUT_MS = +process.env.TIMEOUT_MS || 60000;
const MOCK = process.env.MOCK === '1'; // Testmodus ohne echte KI (synthetische Antworten, klar markiert)
const CATS = ['aufbau', 'licht', 'fokus', 'belichtung', 'farbe', 'wirkung'];

const ANALYSE_PROMPT_V1 = (goal) => `Du bist ein erfahrener Fotograf und Fotolehrer. Bewerte das angehängte Foto ehrlich und konkret auf Deutsch.
Ziel des Nutzers: ${goal}.
Antworte AUSSCHLIESSLICH mit einem gültigen JSON-Objekt (kein Markdown, kein Text davor oder danach) in genau diesem Schema:
{"gesamt":{"punkte":<0-10, eine Nachkommastelle>,"titel":"<Gesamteindruck in max. 5 Wörtern>"},
"kategorien":{
"aufbau":{"punkte":<0-10>,"begruendung":"<1-2 Sätze mit konkretem Bezug zu Elementen im Bild>"},
"licht":{"punkte":<0-10>,"begruendung":"..."},
"fokus":{"punkte":<0-10>,"begruendung":"..."},
"belichtung":{"punkte":<0-10>,"begruendung":"..."},
"farbe":{"punkte":<0-10>,"begruendung":"..."},
"wirkung":{"punkte":<0-10>,"begruendung":"..."}},
"tipps":["<konkreter Tipp 1>","<Tipp 2>","<Tipp 3>"],
"kommentar":"<2 Sätze Gesamtkommentar>"}
Kategorien: aufbau=Bildaufbau/Komposition, licht=Lichtqualität, fokus=Fokus & Schärfe, belichtung=Belichtung/Dynamikumfang, farbe=Farbe/Weißabgleich, wirkung=Bildwirkung/Geschichte.`;

const EDIT_KEYS = { belichtung: [-2, 2], kontrast: [-100, 100], lichter: [-100, 100], tiefen: [-100, 100], weiss: [-100, 100], schwarz: [-100, 100], waerme: [-100, 100], saettigung: [-100, 100], dynamik: [-100, 100], schaerfe: [0, 100] };
const ANALYSE_PROMPT = (goal) => `Du bist ein erfahrener Fotograf, Bildbearbeiter und Fotolehrer. Bewerte das angehängte Foto ehrlich und konkret auf Deutsch.
Ziel des Nutzers: ${goal}.

GEMEINSAMER BEWERTUNGSMASSSTAB (für alle Kategorien verbindlich, halbe Punkte erlaubt):
1–2 = misslungen (grobe technische Fehler, Motiv kaum erkennbar)
3 = schwach (deutliche Fehler, die das Bild stark beeinträchtigen)
4 = unterdurchschnittlich (mehrere sichtbare Schwächen)
5 = solide (technisch in Ordnung, typischer Schnappschuss eines Hobbyfotografen)
6 = ordentlich (solide mit einzelnen gelungenen Aspekten)
7 = gut (bewusst gestaltet, nur kleine Schwächen)
8 = sehr gut (überzeugend, kaum Verbesserungspotenzial)
9–10 = herausragend (Wettbewerbs-/Profiniveau)
Anker je Kategorie:
- aufbau: 5 = Motiv erkennbar, aber zufällig platziert · 7 = bewusste Platzierung (Drittel, Linien, Vordergrund) · 9 = Komposition führt den Blick perfekt
- licht: 5 = neutrales, unspektakuläres Licht · 7 = Licht unterstützt die Stimmung · 9 = außergewöhnliches, gezielt genutztes Licht
- fokus: 5 = Hauptmotiv ausreichend scharf · 7 = Schärfe und Schärfentiefe passen genau zum Motiv · 9 = makellos, bewusst gesetzt
- belichtung: 5 = brauchbar, aber leicht über-/unterbelichtete Bereiche · 7 = ausgewogen, kaum Clipping · 9 = voller Tonwertumfang, perfekt
- farbe: 5 = natürliche, unauffällige Farben oder leichter Farbstich · 7 = stimmige, harmonische Farben · 9 = Farbe als starkes Gestaltungsmittel
- wirkung: 5 = dokumentarisch, wenig Emotion · 7 = klare Stimmung oder Geschichte · 9 = berührt, bleibt im Gedächtnis
Bewerte jede Kategorie unabhängig; die meisten Alltagsfotos liegen zwischen 4 und 7.

BEARBEITUNG: Schlage dezente, konkrete Bearbeitungswerte vor (Skala wie in Lightroom; 0 = unverändert; typischerweise kleine Werte):
belichtung in EV (-2 bis +2, eine Nachkommastelle), kontrast, lichter, tiefen, weiss, schwarz, waerme, saettigung, dynamik jeweils -100 bis +100 (ganzzahlig), schaerfe 0 bis 100.
zuschnitt: nur wenn ein Beschnitt die Komposition klar verbessert (z. B. nach Drittelregel, störende Ränder), sonst null. Angabe als Anteile des Originalbilds: {"x":0-1,"y":0-1,"b":Breite 0.3-1,"h":Höhe 0.3-1}.

Antworte AUSSCHLIESSLICH mit einem gültigen JSON-Objekt (kein Markdown, kein Text davor oder danach) in genau diesem Schema:
{"gesamt":{"punkte":<0-10>,"titel":"<Gesamteindruck in max. 5 Wörtern>"},
"kategorien":{
"aufbau":{"punkte":<0-10>,"begruendung":"<1-2 Sätze mit konkretem Bezug zu Elementen im Bild>"},
"licht":{"punkte":<0-10>,"begruendung":"..."},
"fokus":{"punkte":<0-10>,"begruendung":"..."},
"belichtung":{"punkte":<0-10>,"begruendung":"..."},
"farbe":{"punkte":<0-10>,"begruendung":"..."},
"wirkung":{"punkte":<0-10>,"begruendung":"..."}},
"tipps":["<konkreter Tipp 1>","<Tipp 2>","<Tipp 3>"],
"kommentar":"<2 Sätze Gesamtkommentar>",
"bearbeitung":{"belichtung":0,"kontrast":0,"lichter":0,"tiefen":0,"weiss":0,"schwarz":0,"waerme":0,"saettigung":0,"dynamik":0,"schaerfe":0,"zuschnitt":null,"begruendung":"<1-2 Sätze: warum diese Werte>"}}`;

const TEXT_PROMPT = (goal) => `Schreibe passend zu diesem Foto Social-Media-Texte (Ziel/Plattform: ${goal}).
Antworte AUSSCHLIESSLICH mit gültigem JSON (kein Markdown):
{"de":{"text":"<Instagram-Bildunterschrift auf Deutsch, 1-3 Sätze, natürlich, kein Kitsch>","hashtags":["#...", "... 5-8 Stück"]},
"en":{"text":"<dieselbe Idee auf Englisch>","hashtags":["#...", "... 5-8 Stück"]}}`;

function parseJSON(txt) {
  if (!txt) throw new Error('Leere Antwort');
  let s = String(txt).trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  try { return JSON.parse(s); } catch {}
  const a = s.indexOf('{'), b = s.lastIndexOf('}');
  if (a >= 0 && b > a) { const sub = s.slice(a, b + 1); try { return JSON.parse(sub); } catch {}
    try { return JSON.parse(sub.replace(/,\s*([}\]])/g, '$1')); } catch {} }
  throw new Error('Antwort war kein gültiges JSON');
}
const num = (v) => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? Math.max(0, Math.min(10, Math.round(n * 10) / 10)) : null; };
function normAnalyse(j) {
  const k = j.kategorien || {}, out = { gesamt: { punkte: num(j.gesamt?.punkte), titel: String(j.gesamt?.titel || '').slice(0, 80) }, kategorien: {},
    tipps: (Array.isArray(j.tipps) ? j.tipps : []).map(String).slice(0, 3), kommentar: String(j.kommentar || '').slice(0, 600) };
  for (const c of CATS) out.kategorien[c] = { punkte: num(k[c]?.punkte), begruendung: String(k[c]?.begruendung || '').slice(0, 500) };
  const be = j.bearbeitung || {}; out.bearbeitung = { begruendung: String(be.begruendung || '').slice(0, 400), zuschnitt: normCrop(be.zuschnitt) };
  for (const [key, [lo, hi]] of Object.entries(EDIT_KEYS)) { const n = parseFloat(String(be[key] ?? 0).replace(',', '.')); out.bearbeitung[key] = isFinite(n) ? Math.max(lo, Math.min(hi, n)) : 0; }
  const vals = CATS.map(c => out.kategorien[c].punkte).filter(v => v !== null);
  if (vals.length < 3) throw new Error('Unvollständige Bewertung');
  if (out.gesamt.punkte === null) out.gesamt.punkte = Math.round(vals.reduce((a, b) => a + b) / vals.length * 10) / 10;
  return out;
}

function normCrop(c) {
  if (!c || typeof c !== 'object') return null;
  const f = (v) => parseFloat(v); let x = f(c.x), y = f(c.y), b = f(c.b ?? c.w), h = f(c.h);
  if (![x, y, b, h].every(isFinite)) return null;
  b = Math.max(0.3, Math.min(1, b)); h = Math.max(0.3, Math.min(1, h));
  x = Math.max(0, Math.min(1 - b, x)); y = Math.max(0, Math.min(1 - h, y));
  if (b > 0.97 && h > 0.97) return null;
  return { x: +x.toFixed(3), y: +y.toFixed(3), b: +b.toFixed(3), h: +h.toFixed(3) };
}
const median = (a) => { const s = [...a].sort((p, q) => p - q), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
// Konsens: Median je Regler über alle erfolgreichen Modelle; Zuschnitt nur, wenn die Mehrheit einen vorschlägt.
function consensus(ok) {
  if (!ok.length) return null; const e = ok.map(r => r.data.bearbeitung), out = {};
  for (const k of Object.keys(EDIT_KEYS)) out[k] = Math.round(median(e.map(x => x[k])) * (k === 'belichtung' ? 10 : 1)) / (k === 'belichtung' ? 10 : 1);
  const crops = e.map(x => x.zuschnitt).filter(Boolean);
  out.zuschnitt = crops.length * 2 > e.length ? normCrop({ x: median(crops.map(c => c.x)), y: median(crops.map(c => c.y)), b: median(crops.map(c => c.b)), h: median(crops.map(c => c.h)) }) : null;
  out.begruendungen = ok.map(r => [r.label, r.data.bearbeitung.begruendung]).filter(x => x[1]);
  return out;
}
async function mockModel(model, prompt) {
  await new Promise(r => setTimeout(r, 1500 + Math.random() * 2500));
  if (process.env.MOCK_FAIL && model.includes(process.env.MOCK_FAIL)) throw new Error('Testmodus: simulierter Ausfall');
  if (prompt.startsWith('Schreibe')) return { content: JSON.stringify({ de: { text: '[TESTMODUS] Beispieltext ohne echte KI.', hashtags: ['testmodus', 'lumen'] }, en: { text: '[TEST MODE] Sample text, no real AI.', hashtags: ['testmode'] } }), usage: { cost: 0 } };
  const r = () => Math.round((5 + Math.random() * 4) * 2) / 2, k = {};
  for (const c of CATS) k[c] = { punkte: r(), begruendung: `[TESTMODUS ${model}] Synthetische Begründung für ${c} – keine echte KI-Analyse.` };
  return { content: '```json\n' + JSON.stringify({ gesamt: { punkte: null, titel: '[Testmodus] Synthetisch' }, kategorien: k, tipps: ['[Test] Tipp 1', '[Test] Tipp 2', '[Test] Tipp 3'], kommentar: `[TESTMODUS] Synthetische Antwort von ${model}.`, bearbeitung: { belichtung: 0.2, kontrast: 10, lichter: -30, tiefen: 20, weiss: 5, schwarz: -5, waerme: 8, saettigung: 0, dynamik: 15, schaerfe: 20, zuschnitt: { x: 0.05, y: 0.05, b: 0.9, h: 0.9 }, begruendung: '[TESTMODUS] synthetische Werte' } }) + '\n```', usage: { cost: 0 } };
}
async function callModel(model, prompt, image, maxTokens = 4000) {
  if (MOCK) return mockModel(model, prompt);
  const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST', signal: ctrl.signal,
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', 'X-Title': 'Lumen Prototyp' },
      body: JSON.stringify({ model, max_tokens: maxTokens, temperature: 0.4, usage: { include: true }, reasoning: { effort: 'low' },
        messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: image } }] }] })
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok || body.error) throw new Error(`HTTP ${r.status}: ${body.error?.message || 'Fehler'}`.slice(0, 200));
    const ch = body.choices?.[0];
    return { content: ch?.message?.content, usage: body.usage || null, cut: ch?.finish_reason === 'length' };
  } catch (e) { throw new Error(e.name === 'AbortError' ? 'Zeitüberschreitung' : e.message); }
  finally { clearTimeout(t); }
}

// Ein Versuch + 1 Wiederholung bei ungültigem/abgeschnittenem JSON; Kosten beider Versuche werden addiert.
async function withRetry(model, prompt, image, maxTokens, norm = (x) => x) {
  let cost = 0, last;
  for (let i = 0; i < 2; i++) {
    const r = await callModel(model, prompt, image, maxTokens); cost += r.usage?.cost || 0;
    try { return { data: norm(parseJSON(r.content)), usage: { ...(r.usage || {}), cost } }; }
    catch (e) { last = r.cut ? new Error('Antwort abgeschnitten (Token-Limit)') : e; console.log(`[retry] ${model}: ${last.message}`); }
  }
  last.cost = cost; throw last;
}
// ---------------- Konfiguration Testphase / Produktion ----------------
const env = (k, d) => (process.env[k] ?? '').trim() || d;
const ACCESS_CODES = env('ACCESS_CODES', '').split(',').map(c => c.trim()).filter(Boolean);
const AUTH_REQUIRED = ACCESS_CODES.length > 0;
const SESSION_SECRET = env('SESSION_SECRET', '') || crypto.randomBytes(32).toString('hex'); // ohne Variable: Sessions gelten nur bis zum Neustart
const SESSION_DAYS = +env('SESSION_DAYS', 14);
const LIMIT_PER_CODE = +env('DAILY_LIMIT_PER_CODE', 20);   // Analysen pro Code und Tag
const LIMIT_PER_IP = +env('DAILY_LIMIT_PER_IP', 30);       // Analysen pro IP und Tag
const TEXT_FACTOR = +env('TEXT_LIMIT_FACTOR', 2);          // Text-Anfragen = Faktor × Analyse-Limit
const DAILY_BUDGET = +env('DAILY_BUDGET_USD', 1);          // globale Ausgabengrenze pro Tag (USD)
const MAX_BODY = +env('MAX_BODY_BYTES', 8e6);
const TRUST_PROXY = env('TRUST_PROXY', '1') === '1';       // hinter Render/Railway/Fly-Proxy
const PUBLIC = path.join(__dirname, 'public');

const today = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Vienna' });
let day = today(), spent = 0; const counters = new Map(); const loginFails = new Map();
function rollDay() { const d = today(); if (d !== day) { day = d; spent = 0; counters.clear(); } }
const count = (k) => counters.get(k) || 0; const bump = (k) => counters.set(k, count(k) + 1);
const hash = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 12);
const ipOf = (req) => (TRUST_PROXY && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket.remoteAddress || '?';
const isHttps = (req) => req.headers['x-forwarded-proto'] === 'https' || !!req.socket.encrypted;

function sign(payload) { const b = Buffer.from(JSON.stringify(payload)).toString('base64url'); return b + '.' + crypto.createHmac('sha256', SESSION_SECRET).update(b).digest('base64url'); }
function verify(tok) {
  if (!tok || !tok.includes('.')) return null; const [b, sig] = tok.split('.');
  const exp = crypto.createHmac('sha256', SESSION_SECRET).update(b).digest('base64url');
  if (sig.length !== exp.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(exp))) return null;
  try { const p = JSON.parse(Buffer.from(b, 'base64url').toString()); if (p.exp < Date.now()) return null;
    if (!ACCESS_CODES.some(c => hash(c) === p.c)) return null; return p; } catch { return null; } // entfernte Codes verlieren sofort den Zugang
}
const cookies = (req) => Object.fromEntries(String(req.headers.cookie || '').split(';').map(c => c.trim().split('=')).filter(x => x[0]).map(([k, ...v]) => [k, decodeURIComponent(v.join('='))]));
function session(req) { if (!AUTH_REQUIRED) return { c: 'offen' }; return verify(cookies(req).lumen_s); }
function setCookie(req, res, val, maxAge) { res.setHeader('Set-Cookie', `lumen_s=${val}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${isHttps(req) ? '; Secure' : ''}`); }
function safeEq(a, b) { const x = Buffer.from(hash(a)), y = Buffer.from(hash(b)); return crypto.timingSafeEqual(x, y) && a === b; }

const SEC_HEADERS = {
  'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()', 'Cross-Origin-Opener-Policy': 'same-origin',
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; manifest-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
};
function headers(req, res) { for (const [k, v] of Object.entries(SEC_HEADERS)) res.setHeader(k, v); if (isHttps(req)) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains'); }
function readBody(req, limit = MAX_BODY) {
  return new Promise((res, rej) => { const len = +req.headers['content-length'] || 0; if (len > limit) { const e = new Error('Anfrage zu groß'); e.status = 413; return rej(e); }
    let d = '', n = 0;
    req.on('data', c => { n += c.length; if (n > limit) { const e = new Error('Anfrage zu groß'); e.status = 413; rej(e); req.destroy(); } else d += c; });
    req.on('end', () => { try { res(JSON.parse(d || '{}')); } catch { const e = new Error('Ungültige Anfrage'); e.status = 400; rej(e); } }); req.on('error', rej); });
}
const send = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); };
const validImg = (s) => typeof s === 'string' && s.length < MAX_BODY && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(s);
const STATIC = { '/': ['index.html', 'text/html; charset=utf-8'], '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/datenschutz': ['datenschutz.html', 'text/html; charset=utf-8'], '/impressum': ['impressum.html', 'text/html; charset=utf-8'],
  '/manifest.webmanifest': ['manifest.webmanifest', 'application/manifest+json'], '/icon.svg': ['icon.svg', 'image/svg+xml'],
  '/favicon.ico': ['icon-192.png', 'image/png'], '/icon-192.png': ['icon-192.png', 'image/png'], '/icon-512.png': ['icon-512.png', 'image/png'],
  '/apple-touch-icon.png': ['icon-192.png', 'image/png'] };
const usage = (sess, ip) => ({ used: count('a:' + sess.c), limit: LIMIT_PER_CODE, ipUsed: count('i:' + ip), ipLimit: LIMIT_PER_IP });

const server = http.createServer(async (req, res) => {
  headers(req, res); rollDay();
  const url = new URL(req.url, 'http://x'), p = url.pathname, ip = ipOf(req);
  try {
    if ((req.method === 'GET' || req.method === 'HEAD') && STATIC[p]) {
      const [f, type] = STATIC[p];
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': type.startsWith('text/html') ? 'no-cache' : 'public, max-age=86400' });
      if (req.method === 'HEAD') return res.end();
      return fs.createReadStream(path.join(PUBLIC, f)).pipe(res);
    }
    if (p === '/healthz') return send(res, 200, { ok: true, uptime: Math.round(process.uptime()), key: !!KEY || MOCK });
    if (req.method === 'POST' && p === '/api/login') {
      const f = loginFails.get(ip) || { n: 0, t: Date.now() }; if (Date.now() - f.t > 15 * 60e3) { f.n = 0; f.t = Date.now(); }
      if (f.n >= 10) return send(res, 429, { error: 'Zu viele Fehlversuche – bitte in 15 Minuten erneut versuchen' });
      const b = await readBody(req, 4096); const code = String(b.code || '').trim();
      const hit = ACCESS_CODES.find(c => code && safeEq(c, code));
      if (!hit) { f.n++; loginFails.set(ip, f); console.log(`[login] Fehlversuch (${ip})`); return send(res, 401, { error: 'Code ungültig' }); }
      setCookie(req, res, sign({ c: hash(hit), exp: Date.now() + SESSION_DAYS * 864e5 }), SESSION_DAYS * 86400);
      console.log(`[login] ok Code ${hash(hit)}`); return send(res, 200, { ok: true });
    }
    if (req.method === 'POST' && p === '/api/logout') { setCookie(req, res, '', 0); return send(res, 200, { ok: true }); }
    const sess = session(req);
    if (req.method === 'GET' && p === '/api/me') return send(res, 200, { authRequired: AUTH_REQUIRED, auth: !!sess, usage: sess ? usage(sess, ip) : null });
    if (req.method === 'GET' && p === '/api/status') {
      if (!sess) return send(res, 401, { error: 'Bitte anmelden', login: true });
      return send(res, 200, { ok: !!KEY || MOCK, mock: MOCK, models: MODELS.map(m => ({ label: m.label, id: m.id })), usage: usage(sess, ip) });
    }
    if (req.method === 'POST' && (p === '/api/analyse' || p === '/api/texte')) {
      if (!sess) return send(res, 401, { error: 'Bitte anmelden', login: true });
      if (!KEY && !MOCK) return send(res, 500, { error: 'OPENROUTER_API_KEY ist auf dem Server nicht gesetzt' });
      const isA = p === '/api/analyse', f = isA ? 1 : TEXT_FACTOR, kc = (isA ? 'a:' : 't:') + sess.c, ki = (isA ? 'i:' : 'ti:') + ip;
      if (count(kc) >= LIMIT_PER_CODE * f) return send(res, 429, { error: `Tageslimit erreicht (${LIMIT_PER_CODE * f} ${isA ? 'Analysen' : 'Texte'} pro Tag). Morgen geht's weiter.`, limit: 'code' });
      if (count(ki) >= LIMIT_PER_IP * f) return send(res, 429, { error: 'Tageslimit für diese Verbindung erreicht.', limit: 'ip' });
      if (spent >= DAILY_BUDGET) { console.log(`[budget] Tagesbudget $${DAILY_BUDGET} erreicht – Anfrage abgelehnt`); return send(res, 429, { error: 'Das Tagesbudget der Testphase ist aufgebraucht. Bitte morgen erneut versuchen.', limit: 'budget' }); }
      const b = await readBody(req); const goal = ['Instagram', 'Wettbewerb', 'Lernen'].includes(b.goal) ? b.goal : 'Instagram';
      if (!validImg(b.image)) return send(res, 400, { error: 'Bild fehlt oder hat ein ungültiges Format' });
      bump(kc); bump(ki);
      if (isA) {
        const t0 = Date.now(); const P = (process.env.ALLOW_PROMPT_V1 === '1' && b.promptVersion === 1) ? ANALYSE_PROMPT_V1 : ANALYSE_PROMPT;
        const results = await Promise.all(MODELS.map(async m => {
          try { const r = await withRetry(m.id, P(goal), b.image, 4000, normAnalyse);
            return { label: m.label, model: m.id, ok: true, data: r.data, usage: r.usage };
          } catch (e) { return { label: m.label, model: m.id, ok: false, error: e.message, cost: e.cost || 0 }; }
        }));
        const cost = results.reduce((a, r) => a + (r.usage?.cost || r.cost || 0), 0); spent += cost;
        results.filter(r => !r.ok).forEach(r => console.log(`[analyse] ${r.model} FEHLER: ${r.error}`));
        console.log(`[analyse] ${Date.now() - t0} ms, ok=${results.filter(r => r.ok).length}/3, Kosten ≈ $${cost.toFixed(5)}, heute $${spent.toFixed(4)}/${DAILY_BUDGET}, Code ${sess.c} ${count(kc)}/${LIMIT_PER_CODE}`);
        return send(res, results.some(r => r.ok) ? 200 : 502, { results, cost, edit: consensus(results.filter(r => r.ok)), usage: usage(sess, ip) });
      } else {
        const r = await withRetry(TEXT_MODEL, TEXT_PROMPT(goal), b.image, 2500); spent += r.usage?.cost || 0;
        const j = r.data; const fix = (x) => ({ text: String(x?.text || ''), hashtags: (Array.isArray(x?.hashtags) ? x.hashtags : []).map(h => '#' + String(h).replace(/^#+/, '').replace(/\s+/g, '')).slice(0, 10) });
        console.log(`[texte] Kosten ≈ $${(r.usage?.cost || 0).toFixed(5)}, heute $${spent.toFixed(4)}/${DAILY_BUDGET}`);
        return send(res, 200, { de: fix(j.de), en: fix(j.en), model: TEXT_MODEL, cost: r.usage?.cost || 0 });
      }
    }
    send(res, 404, { error: 'Nicht gefunden' });
  } catch (e) { console.log(`[fehler] ${p}: ${e.message}`); if (!res.headersSent) send(res, e.status || 500, { error: e.status ? e.message : 'Interner Fehler' }); }
});
server.requestTimeout = 180000; server.headersTimeout = 30000;
// Render Free schläft nach ~15 Min. ohne eingehende Anfragen ein. RENDER_EXTERNAL_URL setzt Render selbst.
// Dann etwa alle 10 Min. GET /healthz auf der eigenen öffentlichen Adresse (zählt nicht als Nutzung, nicht gegen das Budget).
// KEEP_AWAKE=0 schaltet ab. KEEP_AWAKE_MS (Millisekunden, 1000 … 2^31-1) nur zum Testen. Timer ist unref, hält den Prozess nicht offen.
function startKeepAwake() {
  const base = env('RENDER_EXTERNAL_URL', '').replace(/\/+$/, '');
  if (!base) return null;
  if (env('KEEP_AWAKE', '1') === '0') { console.log('[keep-awake] aus'); return null; }
  let target;
  try {
    target = new URL(base);
    if (target.protocol !== 'http:' && target.protocol !== 'https:') throw new Error('Protokoll');
    target.pathname = '/healthz'; target.search = ''; target.hash = '';
  } catch { console.log('[keep-awake] RENDER_EXTERNAL_URL ungültig'); return null; }
  const raw = +process.env.KEEP_AWAKE_MS, max = 2 ** 31 - 1;
  const ms = Number.isFinite(raw) && raw >= 1000 && raw <= max ? raw : 10 * 60 * 1000;
  const lib = target.protocol === 'https:' ? https : http;
  const ping = () => {
    let req;
    try {
      req = lib.request(target, { method: 'GET', timeout: 20000, headers: { Connection: 'close' } }, (r) => {
        try {
          r.resume();
          if (r.statusCode !== 200) console.log(`[keep-awake] HTTP ${r.statusCode}`);
        } catch (e) { console.log(`[keep-awake] ${String(e && e.message || e).slice(0, 160)}`); }
      });
      req.on('socket', (socket) => { try { socket.unref(); } catch {} }); // Request hält den Prozess beim Beenden nicht offen
      req.on('timeout', () => { try { req.destroy(); } catch {} });
      req.on('error', (e) => console.log(`[keep-awake] ${String(e && e.message || e).slice(0, 160)}`));
      req.end();
    } catch (e) {
      console.log(`[keep-awake] ${String(e && e.message || e).slice(0, 160)}`);
      if (req) { req.on('error', () => {}); try { req.destroy(); } catch {} }
    }
  };
  const timer = setInterval(ping, ms);
  timer.unref();
  const every = ms % 60000 === 0 ? `${ms / 60000} min` : `${ms} ms`;
  console.log(`[keep-awake] aktiv, alle ${every} → ${target.host}/healthz`);
  return timer;
}
let keepAwakeTimer = null;
server.listen(PORT, () => {
  console.log(`Lumen läuft auf Port ${PORT} · Schlüssel ${KEY ? 'gesetzt' : 'FEHLT'}${MOCK ? ' · TESTMODUS' : ''} · Zugang ${AUTH_REQUIRED ? ACCESS_CODES.length + ' Code(s)' : 'OFFEN (keine ACCESS_CODES)'} · Limit ${LIMIT_PER_CODE}/Code/Tag · Budget $${DAILY_BUDGET}/Tag${process.env.SESSION_SECRET ? '' : ' · WARNUNG: SESSION_SECRET fehlt'}`);
  keepAwakeTimer = startKeepAwake();
});
const stop = () => { console.log('Beende …'); if (keepAwakeTimer) clearInterval(keepAwakeTimer); server.close(() => process.exit(0)); setTimeout(() => process.exit(0), 10000).unref(); };
process.on('SIGTERM', stop); process.on('SIGINT', stop);
