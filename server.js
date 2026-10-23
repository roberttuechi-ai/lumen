// Lumen – kleiner Server für den Prototyp. Start: OPENROUTER_API_KEY=... node server.js
// Der API-Schlüssel bleibt ausschließlich auf dem Server (Umgebungsvariable) und wird nie ausgegeben.
const http = require('http'), https = require('https'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const i18n = require('./public/i18n.js');
const VERSION = require('./package.json').version;
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
function goalKey(v) {
  const s = String(v || '').toLowerCase();
  if (['contest', 'wettbewerb', 'concorso', 'concours', 'concurso'].includes(s)) return 'contest';
  if (['learn', 'lernen', 'imparare', 'apprendre', 'aprender'].includes(s)) return 'learn';
  return 'instagram';
}
function langLine(lang) {
  const code = i18n.baseLang(lang) || 'en';
  return `OUTPUT_LANG=${code}\nSPRACHE: Alle Freitextfelder (titel, begruendung, tipps, kommentar, bearbeitung.begruendung) schreibst du auf ${i18n.outputName(code)} (${i18n.outputNameEn(code)}). Die JSON-Schlüssel bleiben exakt wie im Schema.\n`;
}
function analysePrompt(goal, lang) {
  const code = i18n.baseLang(lang) || 'en';
  return langLine(code) + ANALYSE_PROMPT(i18n.t(code, 'goal.' + goalKey(goal)));
}
function analysePromptV1(goal, lang) {
  const code = i18n.baseLang(lang) || 'en';
  return langLine(code) + ANALYSE_PROMPT_V1(i18n.t(code, 'goal.' + goalKey(goal)));
}
function textPrompt(goal, lang) {
  const code = i18n.baseLang(lang) || 'en';
  const g = i18n.t(code, 'goal.' + goalKey(goal));
  return `LUMEN_CAPTION ${code}
Schreibe eine Bildunterschrift für dieses Foto. Ziel/Plattform: ${g}.
Schreibe den Text auf ${i18n.outputName(code)} (${i18n.outputNameEn(code)}).
Antworte AUSSCHLIESSLICH mit gültigem JSON (kein Markdown):
{"text":"<1-3 Sätze, natürlich, kein Kitsch>","hashtags":["ohneRautenzeichen","5-8 Stück"]}`;
}

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
  const wait = +process.env.MOCK_DELAY_MS;
  const ms = Number.isFinite(wait) && wait >= 0 && wait <= 5000 ? wait : (1500 + Math.random() * 2500);
  await new Promise(r => setTimeout(r, ms));
  if (process.env.MOCK_FAIL && model.includes(process.env.MOCK_FAIL)) throw new Error('Testmodus: simulierter Ausfall');
  if (prompt.startsWith('LUMEN_CAPTION')) {
    const code = (prompt.match(/^LUMEN_CAPTION\s+([a-z]{2})/) || [])[1] || 'en';
    return { content: JSON.stringify(i18n.mockCaption(code)), usage: { cost: 0 } };
  }
  const outLang = (prompt.match(/OUTPUT_LANG=([a-z]{2})/) || [])[1] || 'en';
  const r = () => Math.round((5 + Math.random() * 4) * 2) / 2, k = {};
  for (const c of CATS) k[c] = { punkte: r(), begruendung: `[TEST ${outLang} ${model}] Synthetische Begründung für ${c} – keine echte KI-Analyse.` };
  return { content: '```json\n' + JSON.stringify({ gesamt: { punkte: null, titel: i18n.t(outLang, 'demo.short') }, kategorien: k, tipps: ['[Test] 1', '[Test] 2', '[Test] 3'], kommentar: `[TEST ${outLang}] Synthetische Antwort von ${model}.`, bearbeitung: { belichtung: 0.2, kontrast: 10, lichter: -30, tiefen: 20, weiss: 5, schwarz: -5, waerme: 8, saettigung: 0, dynamik: 15, schaerfe: 20, zuschnitt: { x: 0.05, y: 0.05, b: 0.9, h: 0.9 }, begruendung: `[TEST ${outLang}] synthetische Werte` } }) + '\n```', usage: { cost: 0 } };
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
const ACCOUNT_DAYS = 30;
const MAGIC_MINUTES = 15;
const LIMIT_PER_CODE = +env('DAILY_LIMIT_PER_CODE', 20);   // Analysen pro Code und Tag
const LIMIT_PER_IP = +env('DAILY_LIMIT_PER_IP', 30);       // Analysen pro IP und Tag
const TEXT_FACTOR = +env('TEXT_LIMIT_FACTOR', 2);          // Text-Anfragen = Faktor × Analyse-Limit
const DAILY_BUDGET = +env('DAILY_BUDGET_USD', 1);          // globale Ausgabengrenze pro Tag (USD)
const FREE_WEEKLY = 3;                                     // Gratis: Analysen pro Konto, rollierend 7 Tage
const PRO_DAILY = 15;                                      // Pro: Analysen pro Konto und Tag
const FREE_LESSONS = 2;                                    // erste Lektionen ohne Pro
const MAX_BODY = +env('MAX_BODY_BYTES', 8e6);
const TRUST_PROXY = env('TRUST_PROXY', '1') === '1';       // hinter Render/Railway/Fly-Proxy
const PROD = env('NODE_ENV', '') === 'production';
const PUBLIC = path.join(__dirname, 'public');
const RESEND_API_KEY = env('RESEND_API_KEY', '');
const MAIL_FROM = env('MAIL_FROM', '');
const STRIPE_SECRET_KEY = env('STRIPE_SECRET_KEY', '');
const STRIPE_WEBHOOK_SECRET = env('STRIPE_WEBHOOK_SECRET', '');
const STRIPE_PRICE_MONTHLY = env('STRIPE_PRICE_MONTHLY', '');
const STRIPE_PRICE_YEARLY = env('STRIPE_PRICE_YEARLY', '');
function splitPriceIds(raw) {
  return String(raw || '').split(',').map(s => s.trim()).filter(Boolean);
}
const LUMEN_PRICE_IDS = new Set(splitPriceIds([STRIPE_PRICE_MONTHLY, STRIPE_PRICE_YEARLY, env('STRIPE_LUMEN_EXTRA_PRICE_IDS', '')].filter(Boolean).join(',')));
const PRO_CACHE_MS = 5 * 60 * 1000;
const MAGIC_WINDOW_MS = 15 * 60 * 1000;
const MAGIC_LIMIT_IP = 8;
const MAGIC_LIMIT_EMAIL = 3;
const stripeReady = () => !!(STRIPE_SECRET_KEY && (STRIPE_PRICE_MONTHLY || STRIPE_PRICE_YEARLY));

const today = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Vienna' });
let day = today(), spent = 0;
const counters = new Map();
const loginFails = new Map();
const weekHits = new Map();
const rateMap = new Map();
const usedMagic = new Set();
const proCache = new Map();
const emailByCustomer = new Map();
function rollDay() { const d = today(); if (d !== day) { day = d; spent = 0; counters.clear(); } }
const count = (k) => counters.get(k) || 0;
const bump = (k) => counters.set(k, count(k) + 1);
const hash = (s) => crypto.createHash('sha256').update(String(s)).digest('hex').slice(0, 12);
const ipOf = (req) => (TRUST_PROXY && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket.remoteAddress || '?';
const isHttps = (req) => req.headers['x-forwarded-proto'] === 'https' || !!req.socket.encrypted;

function sign(payload) { const b = Buffer.from(JSON.stringify(payload)).toString('base64url'); return b + '.' + crypto.createHmac('sha256', SESSION_SECRET).update(b).digest('base64url'); }
function verifySigned(tok) {
  if (!tok || !tok.includes('.')) return null;
  const i = tok.indexOf('.');
  const b = tok.slice(0, i), sig = tok.slice(i + 1);
  const exp = crypto.createHmac('sha256', SESSION_SECRET).update(b).digest('base64url');
  if (sig.length !== exp.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(exp))) return null;
  try { const p = JSON.parse(Buffer.from(b, 'base64url').toString()); if (!p || typeof p.exp !== 'number' || p.exp < Date.now()) return null; return p; }
  catch { return null; }
}
function normEmail(s) {
  const e = String(s || '').trim().toLowerCase();
  if (e.length < 3 || e.length > 254) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return null;
  return e;
}
function readSession(tok) {
  const p = verifySigned(tok);
  if (!p || p.typ === 'login') return null;
  if (p.typ === 'acct') { const e = normEmail(p.e); return e ? { kind: 'account', email: e } : null; }
  if (p.c && ACCESS_CODES.some(c => hash(c) === p.c)) return { kind: 'code', c: p.c };
  return null;
}
function readMagic(tok) {
  const p = verifySigned(tok);
  if (!p || p.typ !== 'login' || !p.n || !normEmail(p.e)) return null;
  return p;
}
const cookies = (req) => Object.fromEntries(String(req.headers.cookie || '').split(';').map(c => c.trim().split('=')).filter(x => x[0]).map(([k, ...v]) => [k, decodeURIComponent(v.join('='))]));
function session(req) {
  const s = readSession(cookies(req).lumen_s);
  if (s) return s;
  if (!AUTH_REQUIRED) return { kind: 'open', c: 'offen' };
  return null;
}
function setCookie(req, res, val, maxAge) { res.setHeader('Set-Cookie', `lumen_s=${val}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${isHttps(req) ? '; Secure' : ''}`); }
function reqLang(req) { return i18n.pickLang({ cookie: cookies(req).lumen_lang, accept: req.headers['accept-language'] }); }
function tr(req, key, vars) { return i18n.t(reqLang(req), key, vars); }
function deny(res, req, decision, extra) {
  return send(res, decision.status, Object.assign({ error: i18n.t(reqLang(req), decision.errorKey, decision.vars), limit: decision.limit, upgrade: !!decision.upgrade }, extra || {}));
}
function publicModelErr(lang, e) {
  const m = String((e && e.message) || '');
  if (/Zeitüberschreitung|AbortError/i.test(m)) return i18n.t(lang, 'err.timeout');
  if (/Leere Antwort/.test(m)) return i18n.t(lang, 'err.empty');
  if (/gültiges JSON/.test(m)) return i18n.t(lang, 'err.json');
  if (/Unvollständige/.test(m)) return i18n.t(lang, 'err.incomplete');
  if (/abgeschnitten/.test(m)) return i18n.t(lang, 'err.cut');
  if (/HTTP 401/.test(m)) return i18n.t(lang, 'err.http401');
  if (/HTTP 402/.test(m)) return i18n.t(lang, 'err.http402');
  if (/HTTP 429/.test(m)) return i18n.t(lang, 'err.http429');
  return safeErr(e);
}
function safeEq(a, b) { const x = Buffer.from(hash(a)), y = Buffer.from(hash(b)); return crypto.timingSafeEqual(x, y) && a === b; }
function safeErr(e) {
  return String((e && e.message) || e || '')
    .replace(/\b(sk|rk)_(live|test)_[A-Za-z0-9]+/g, '$1_…')
    .replace(/\bwhsec_[A-Za-z0-9]+/g, 'whsec_…')
    .replace(/\bre_[A-Za-z0-9_]+/g, 're_…')
    .slice(0, 180);
}
function allowRate(map, key, max, windowMs, now) {
  now = now || Date.now();
  let b = map.get(key);
  if (!b || now - b.t >= windowMs) b = { n: 0, t: now };
  if (b.n >= max) { map.set(key, b); return false; }
  b.n += 1; map.set(key, b); return true;
}
function weekCount(email, now) {
  const cut = (now || Date.now()) - 7 * 864e5;
  const arr = (weekHits.get(email) || []).filter(t => t >= cut);
  weekHits.set(email, arr);
  return arr.length;
}
function weekBump(email, now) {
  const t = now || Date.now();
  weekCount(email, t);
  weekHits.get(email).push(t);
}
function takeNonce(n) {
  if (!n || usedMagic.has(n)) return false;
  usedMagic.add(n);
  if (usedMagic.size > 4000) { const it = usedMagic.values(); for (let i = 0; i < 1000; i++) usedMagic.delete(it.next().value); }
  return true;
}
function usageKey(sess) { return sess.kind === 'account' ? ('m:' + hash(sess.email)) : sess.c; }
function freeModel() { return MODELS.find(m => m.label === 'Gemini') || { label: 'Gemini', id: 'google/gemini-3.8-flash' }; }
function activeModels(sess) { return (sess.kind === 'account' && sess.tier === 'free') ? [freeModel()] : MODELS; }
function planOf(sess) {
  if (!sess) return null;
  if (sess.kind === 'code') return 'tester';
  if (sess.kind === 'open') return 'open';
  return sess.tier === 'pro' ? 'pro' : 'free';
}
function featuresOf(sess) {
  const pro = !sess || sess.kind !== 'account' || sess.tier === 'pro';
  return { captions: pro, courseAll: pro, models: pro ? MODELS.length : 1 };
}
function usage(sess, ip) {
  const free = sess.kind === 'account' && sess.tier === 'free';
  const used = free ? weekCount(sess.email) : count('a:' + usageKey(sess));
  const limit = free ? FREE_WEEKLY : (sess.kind === 'account' ? PRO_DAILY : LIMIT_PER_CODE);
  return { used, limit, remaining: Math.max(0, limit - used), window: free ? 'week' : 'day', ipUsed: count('i:' + ip), ipLimit: LIMIT_PER_IP };
}
// Reine Entscheidung, damit Gratis/Pro/Code ohne Netzwerk testbar sind.
function decideAccess(o) {
  const proFeatures = o.kind !== 'account' || o.tier === 'pro';
  if (o.isText && !proFeatures) return { allow: false, status: 403, errorKey: 'err.captions', upgrade: true, limit: 'feature' };
  const factor = o.isText ? o.textFactor : 1;
  if (!o.isText && o.kind === 'account' && o.tier === 'free') {
    if (o.weekUsed >= o.freeWeekly) return { allow: false, status: 429, errorKey: 'err.week', vars: { free: o.freeWeekly, pro: o.proDaily }, upgrade: true, limit: 'week' };
  } else {
    const base = o.kind === 'account' ? o.proDaily : o.codeLimit;
    const limit = base * factor;
    if (o.periodUsed >= limit) return { allow: false, status: 429, errorKey: o.isText ? 'err.dayText' : 'err.dayAnalyse', vars: { limit }, limit: 'code', upgrade: false };
  }
  if (o.ipUsed >= o.ipLimit * factor) return { allow: false, status: 429, errorKey: 'err.ip', limit: 'ip' };
  if (o.budgetSpent >= o.budgetMax) return { allow: false, status: 429, errorKey: 'err.budget', limit: 'budget' };
  return { allow: true };
}
function accessCtx(sess, ip, isText) {
  const key = usageKey(sess);
  return {
    kind: sess.kind, tier: sess.tier, isText,
    weekUsed: sess.kind === 'account' ? weekCount(sess.email) : 0,
    periodUsed: count((isText ? 't:' : 'a:') + key),
    ipUsed: count((isText ? 'ti:' : 'i:') + ip),
    ipLimit: LIMIT_PER_IP, codeLimit: LIMIT_PER_CODE, proDaily: PRO_DAILY, freeWeekly: FREE_WEEKLY,
    textFactor: TEXT_FACTOR, budgetSpent: spent, budgetMax: DAILY_BUDGET,
  };
}

function verifyStripeSignature(raw, header, secret, toleranceSec = 300) {
  if (raw == null || !header || !secret) return false;
  const buf = Buffer.isBuffer(raw) ? raw : Buffer.from(String(raw));
  let timestamp = null; const sigs = [];
  for (const part of String(header).split(',')) {
    const i = part.indexOf('='); if (i < 0) continue;
    const k = part.slice(0, i).trim(), v = part.slice(i + 1).trim();
    if (k === 't') timestamp = v; else if (k === 'v1') sigs.push(v.toLowerCase());
  }
  if (!timestamp || !/^\d+$/.test(timestamp) || !sigs.length) return false;
  const ts = Number(timestamp);
  if (toleranceSec > 0 && ts < Math.floor(Date.now() / 1000) - toleranceSec) return false;
  const mac = crypto.createHmac('sha256', secret);
  mac.update(timestamp + '.'); mac.update(buf);
  const expected = mac.digest('hex');
  const exp = Buffer.from(expected);
  return sigs.some(s => s.length === expected.length && crypto.timingSafeEqual(Buffer.from(s), exp));
}
function formEncode(obj) {
  const parts = [];
  const walk = (key, val) => {
    if (val === undefined || val === null) return;
    if (Array.isArray(val)) val.forEach((v, i) => walk(`${key}[${i}]`, v));
    else if (typeof val === 'object') Object.entries(val).forEach(([k, v]) => walk(`${key}[${k}]`, v));
    else parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(val)));
  };
  Object.entries(obj).forEach(([k, v]) => walk(k, v));
  return parts.join('&');
}
async function stripeSend(method, pathQuery, form) {
  const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch('https://api.stripe.com' + pathQuery, {
      method, signal: ctrl.signal,
      headers: Object.assign({ Authorization: 'Bearer ' + STRIPE_SECRET_KEY }, form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      body: form || undefined,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { const err = new Error((data.error && data.error.message) || ('Stripe HTTP ' + r.status)); err.status = 502; throw err; }
    return data;
  } catch (e) { if (e.name === 'AbortError') throw new Error('Stripe Zeitüberschreitung'); throw e; }
  finally { clearTimeout(t); }
}
const stripeGet = (p) => stripeSend('GET', p, null);
const stripePost = (p, params) => stripeSend('POST', p, formEncode(params));
function setProCache(email, pro, customerId) {
  const prev = proCache.get(email);
  proCache.set(email, { pro: !!pro, customerId: customerId || (prev && prev.customerId) || null, exp: Date.now() + PRO_CACHE_MS });
}
function pushPriceId(ids, price) {
  if (!price) return;
  const id = typeof price === 'string' ? price : price.id;
  const clean = String(id || '').trim();
  if (clean) ids.push(clean);
}
function collectPriceIds(obj) {
  const ids = [];
  if (!obj || typeof obj !== 'object') return ids;
  if (obj.metadata) pushPriceId(ids, obj.metadata.lumen_price);
  const items = obj.items && obj.items.data;
  if (Array.isArray(items)) for (const item of items) { pushPriceId(ids, item.price); pushPriceId(ids, item.plan); }
  const lines = obj.line_items && obj.line_items.data;
  if (Array.isArray(lines)) for (const line of lines) pushPriceId(ids, line.price);
  return ids;
}
function isLumenPrice(id) { return LUMEN_PRICE_IDS.has(id); }
function grantsLumenPro(sub) {
  return !!sub && (sub.status === 'active' || sub.status === 'trialing') && collectPriceIds(sub).some(isLumenPrice);
}
async function checkoutPriceIds(session) {
  let ids = collectPriceIds(session);
  if (session && session.subscription && typeof session.subscription === 'object') ids = ids.concat(collectPriceIds(session.subscription));
  if (ids.some(isLumenPrice) || ids.length || !session || !STRIPE_SECRET_KEY) return ids;
  const subId = typeof session.subscription === 'string' ? session.subscription : '';
  if (!subId) return ids;
  try {
    const remote = await stripeGet('/v1/subscriptions/' + encodeURIComponent(subId));
    return collectPriceIds(remote);
  } catch (e) {
    console.log('[stripe] Abo zum Checkout nicht gelesen: ' + safeErr(e));
    return ids;
  }
}
async function fetchPro(email) {
  const list = await stripeGet('/v1/customers?email=' + encodeURIComponent(email) + '&limit=5');
  let customerId = null, pro = false;
  for (const c of (list.data || []).slice(0, 5)) {
    if (!customerId) customerId = c.id;
    const subs = await stripeGet('/v1/subscriptions?customer=' + encodeURIComponent(c.id) + '&status=all&limit=20');
    if ((subs.data || []).some(grantsLumenPro)) { pro = true; customerId = c.id; break; }
  }
  return { pro, customerId };
}
async function lookupPro(email) {
  const key = normEmail(email);
  if (!key) return { pro: false, customerId: null };
  const hit = proCache.get(key);
  if (hit && hit.exp > Date.now()) return hit;
  if (!STRIPE_SECRET_KEY) return { pro: false, customerId: null };
  try {
    const rec = await fetchPro(key);
    rec.exp = Date.now() + PRO_CACHE_MS;
    proCache.set(key, rec);
    if (rec.customerId) emailByCustomer.set(rec.customerId, key);
    return rec;
  } catch (e) {
    console.log('[stripe] Abo-Status nicht geprüft: ' + safeErr(e));
    if (hit) return hit;
    return { pro: false, customerId: null };
  }
}
async function enrich(sess) {
  if (!sess) return null;
  if (sess.kind === 'account') {
    const rec = await lookupPro(sess.email);
    sess.tier = rec.pro ? 'pro' : 'free';
    sess.customerId = rec.customerId || null;
  } else sess.tier = 'pro';
  return sess;
}
function customerIdOf(obj) { const c = obj && obj.customer; if (!c) return null; return typeof c === 'string' ? c : (c.id || null); }
async function handleStripeEvent(event) {
  const type = event && event.type;
  const obj = (event && event.data && event.data.object) || {};
  if (type === 'checkout.session.completed') {
    const email = normEmail(obj.customer_email || (obj.customer_details && obj.customer_details.email));
    const customer = customerIdOf(obj);
    if (customer && email) emailByCustomer.set(customer, email);
    const ids = await checkoutPriceIds(obj);
    if (!ids.some(isLumenPrice)) {
      console.log('[stripe] checkout.session.completed ignoriert (kein Lumen-Preis)' + (email ? ' ' + hash(email) : ''));
      return;
    }
    if (email && obj.mode === 'subscription' && obj.status === 'complete') setProCache(email, true, customer);
    else if (email) proCache.delete(email);
    console.log('[stripe] checkout.session.completed ' + (email ? hash(email) : 'ohne-mail'));
    return;
  }
  if (type === 'customer.subscription.updated' || type === 'customer.subscription.deleted') {
    if (!collectPriceIds(obj).some(isLumenPrice)) {
      console.log('[stripe] ' + type + ' ignoriert (kein Lumen-Preis)');
      return;
    }
    const customer = customerIdOf(obj);
    let email = (customer && emailByCustomer.get(customer)) || null;
    if (!email && customer && STRIPE_SECRET_KEY) {
      const c = await stripeGet('/v1/customers/' + encodeURIComponent(customer));
      email = normEmail(c.email);
      if (email) emailByCustomer.set(customer, email);
    }
    if (!email) { proCache.clear(); console.log('[stripe] ' + type + ' Cache geleert'); return; }
    if (type === 'customer.subscription.updated' && (obj.status === 'active' || obj.status === 'trialing')) setProCache(email, true, customer);
    else proCache.delete(email);
    console.log('[stripe] ' + type + ' ' + String(obj.status || '') + ' ' + hash(email));
    return;
  }
  console.log('[stripe] ignoriert: ' + String(type || '').slice(0, 80));
}
function publicBase(req) {
  const ext = env('RENDER_EXTERNAL_URL', '').replace(/\/+$/, '');
  if (ext) { try { const u = new URL(ext); if (u.protocol === 'https:' || u.protocol === 'http:') return u.origin; } catch {} }
  const host = String(req.headers.host || ('localhost:' + PORT));
  const safeHost = /^[A-Za-z0-9.:\-\[\]]+$/.test(host) ? host : ('localhost:' + PORT);
  return (isHttps(req) ? 'https' : 'http') + '://' + safeHost;
}
function escHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
async function sendMagicMail(email, link, lang) {
  if (!RESEND_API_KEY || !MAIL_FROM) {
    console.log('[mail] WARNUNG: ' + (!RESEND_API_KEY ? 'RESEND_API_KEY' : 'MAIL_FROM') + ' fehlt – keine E-Mail versendet');
    if (!PROD) console.log('[mail] Login-Link (nur Entwicklung): ' + link);
    return { delivered: false, dev: !PROD };
  }
  const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', signal: ctrl.signal,
      headers: { Authorization: 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: MAIL_FROM, to: [email], subject: i18n.mailCopy(lang || 'en', link).subject,
        text: i18n.mailCopy(lang || 'en', link).text,
        html: i18n.mailCopy(lang || 'en', link).html,
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.message || data.error || ('HTTP ' + r.status));
    return { delivered: true, dev: false };
  } catch (e) { console.log('[mail] Versand fehlgeschlagen: ' + safeErr(e)); throw e; }
  finally { clearTimeout(t); }
}
function resetEphemeral() {
  weekHits.clear(); counters.clear(); rateMap.clear(); usedMagic.clear(); proCache.clear(); emailByCustomer.clear(); loginFails.clear(); spent = 0;
}

const SEC_HEADERS = {
  'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=(), web-share=(self), clipboard-write=(self)', 'Cross-Origin-Opener-Policy': 'same-origin',
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; manifest-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
};
function headers(req, res) { for (const [k, v] of Object.entries(SEC_HEADERS)) res.setHeader(k, v); if (isHttps(req)) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains'); }
function readRaw(req, limit) {
  return new Promise((res, rej) => {
    const len = +req.headers['content-length'] || 0;
    if (len > limit) { const e = new Error('Anfrage zu groß'); e.status = 413; return rej(e); }
    const chunks = []; let n = 0, settled = false;
    const fail = (e) => { if (settled) return; settled = true; rej(e); };
    req.on('data', c => {
      if (settled) return;
      n += c.length;
      if (n > limit) { const e = new Error('Anfrage zu groß'); e.status = 413; fail(e); req.destroy(); }
      else chunks.push(c);
    });
    req.on('end', () => { if (!settled) { settled = true; res(Buffer.concat(chunks)); } });
    req.on('error', fail);
  });
}
function readBody(req, limit = MAX_BODY) {
  return readRaw(req, limit).then(buf => { try { return JSON.parse(buf.length ? buf.toString('utf8') : '{}'); } catch { const e = new Error('Ungültige Anfrage'); e.status = 400; throw e; } });
}
const send = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); };
function sendHtml(res, code, html) { res.writeHead(code, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(html); }
const validImg = (s) => typeof s === 'string' && s.length < MAX_BODY && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(s);
const STATIC = { '/': ['index.html', 'text/html; charset=utf-8'], '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/datenschutz': ['datenschutz.html', 'text/html; charset=utf-8'], '/impressum': ['impressum.html', 'text/html; charset=utf-8'],
  '/agb': ['agb.html', 'text/html; charset=utf-8'], '/widerruf': ['widerruf.html', 'text/html; charset=utf-8'],
  '/en/datenschutz': ['en/datenschutz.html', 'text/html; charset=utf-8'], '/en/impressum': ['en/impressum.html', 'text/html; charset=utf-8'],
  '/en/agb': ['en/agb.html', 'text/html; charset=utf-8'], '/en/widerruf': ['en/widerruf.html', 'text/html; charset=utf-8'],
  '/i18n.js': ['i18n.js', 'text/javascript; charset=utf-8'], '/course.js': ['course.js', 'text/javascript; charset=utf-8'],
  '/manifest.webmanifest': ['manifest.webmanifest', 'application/manifest+json'],
  '/sw.js': ['sw.js', 'text/javascript; charset=utf-8'], '/icon-maskable-192.png': ['icon-maskable-192.png', 'image/png'], '/icon-maskable-512.png': ['icon-maskable-512.png', 'image/png'], '/icon.svg': ['icon.svg', 'image/svg+xml'],
  '/favicon.ico': ['icon-192.png', 'image/png'], '/icon-192.png': ['icon-192.png', 'image/png'], '/icon-512.png': ['icon-512.png', 'image/png'],
  '/apple-touch-icon.png': ['icon-192.png', 'image/png'] };
function mePayload(sess, ip) {
  return {
    authRequired: AUTH_REQUIRED, auth: !!sess, kind: sess ? sess.kind : null, plan: planOf(sess),
    email: sess && sess.kind === 'account' ? sess.email : null,
    stripe: stripeReady(), prices: { month: !!STRIPE_PRICE_MONTHLY, year: !!STRIPE_PRICE_YEARLY },
    usage: sess ? usage(sess, ip) : null, features: sess ? featuresOf(sess) : null, freeLessons: FREE_LESSONS,
  };
}
function linkPage(lang, title, text) {
  const code = i18n.baseLang(lang) || 'en';
  return `<!DOCTYPE html><html lang="${code}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escHtml(title)} – Lumen</title><style>body{font-family:Inter,-apple-system,sans-serif;background:#0d0d0e;color:#f1efe9;margin:0;padding:32px 20px}main{max-width:420px;margin:0 auto}a{color:#c9a97c}p{line-height:1.5;color:#d6d3cb}</style></head><body><main><p style="letter-spacing:.18em;font-size:12px;color:#c9a97c">LUMEN</p><h1>${escHtml(title)}</h1><p>${escHtml(text)}</p><p><a href="/">${escHtml(i18n.t(code, 'err.backLogin'))}</a></p></main></body></html>`;
}

// Android-App (Trusted Web Activity, Google Play): Digital Asset Links.
// ANDROID_PACKAGE / ANDROID_CERT_SHA256 (kommagetrennt) überschreiben die Vorgaben. Nach dem ersten
// Upload zu Google Play den SHA-256 des Play-App-Signaturschlüssels (Play Console → App-Integrität)
// zusätzlich in ANDROID_CERT_SHA256 eintragen, sonst zeigt die App aus dem Play Store eine Adresszeile.
const ANDROID_PACKAGE = process.env.ANDROID_PACKAGE || 'at.picwishfotodesign.lumen';
const ANDROID_CERT_SHA256 = (process.env.ANDROID_CERT_SHA256 || '9D:E0:96:2A:D0:D3:5B:3B:A9:8E:00:1A:A1:79:42:56:19:B5:30:5B:3F:1C:B7:D2:4F:E0:59:E8:06:A7:9D:B8').split(',').map(x => x.trim().toUpperCase()).filter(x => /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(x));
const ASSETLINKS = JSON.stringify([{ relation: ['delegate_permission/common.handle_all_urls'], target: { namespace: 'android_app', package_name: ANDROID_PACKAGE, sha256_cert_fingerprints: ANDROID_CERT_SHA256 } }]);

const server = http.createServer(async (req, res) => {
  headers(req, res); rollDay();
  const url = new URL(req.url, 'http://x'), p = url.pathname, ip = ipOf(req);
  try {
    if ((req.method === 'GET' || req.method === 'HEAD') && STATIC[p]) {
      const [f, type] = STATIC[p];
      const cache = (type.startsWith('text/html') || type.includes('javascript')) ? 'no-cache' : 'public, max-age=86400';
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': cache });
      if (req.method === 'HEAD') return res.end();
      return fs.createReadStream(path.join(PUBLIC, f)).pipe(res);
    }
    if ((req.method === 'GET' || req.method === 'HEAD') && p === '/.well-known/assetlinks.json') { res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=3600', 'Access-Control-Allow-Origin': '*' }); return res.end(req.method === 'HEAD' ? undefined : ASSETLINKS); }
    if (p === '/healthz') return send(res, 200, { ok: true, version: VERSION, uptime: Math.round(process.uptime()), key: !!KEY || MOCK });
    if (req.method === 'POST' && p === '/stripe/webhook') {
      const raw = await readRaw(req, 1e6);
      if (!STRIPE_WEBHOOK_SECRET) { console.log('[stripe] WARNUNG: STRIPE_WEBHOOK_SECRET fehlt – Webhook abgelehnt'); return send(res, 503, { error: 'Webhook nicht konfiguriert' }); }
      if (!verifyStripeSignature(raw, req.headers['stripe-signature'], STRIPE_WEBHOOK_SECRET)) return send(res, 400, { error: 'Signatur ungültig' });
      let event; try { event = JSON.parse(raw.toString('utf8') || '{}'); } catch { return send(res, 400, { error: 'Ungültiger Webhook' }); }
      await handleStripeEvent(event);
      return send(res, 200, { received: true });
    }
    if (req.method === 'POST' && p === '/api/login') {
      const f = loginFails.get(ip) || { n: 0, t: Date.now() }; if (Date.now() - f.t > 15 * 60e3) { f.n = 0; f.t = Date.now(); }
      if (f.n >= 10) return send(res, 429, { error: tr(req, 'err.tooMany') });
      const b = await readBody(req, 4096); const code = String(b.code || '').trim();
      const hit = ACCESS_CODES.find(c => code && safeEq(c, code));
      if (!hit) { f.n++; loginFails.set(ip, f); console.log(`[login] Fehlversuch (${ip})`); return send(res, 401, { error: tr(req, 'err.code') }); }
      setCookie(req, res, sign({ c: hash(hit), exp: Date.now() + SESSION_DAYS * 864e5 }), SESSION_DAYS * 86400);
      console.log(`[login] ok Code ${hash(hit)}`); return send(res, 200, { ok: true });
    }
    if (req.method === 'POST' && p === '/api/magic') {
      if (!allowRate(rateMap, 'ip:' + ip, MAGIC_LIMIT_IP, MAGIC_WINDOW_MS)) return send(res, 429, { error: tr(req, 'err.magicIp') });
      const b = await readBody(req, 4096);
      const email = normEmail(b.email);
      if (!email) return send(res, 400, { error: tr(req, 'err.email') });
      if (!allowRate(rateMap, 'em:' + email, MAGIC_LIMIT_EMAIL, MAGIC_WINDOW_MS)) return send(res, 429, { error: tr(req, 'err.magicEmail') });
      const token = sign({ typ: 'login', e: email, n: crypto.randomBytes(16).toString('hex'), exp: Date.now() + MAGIC_MINUTES * 60e3 });
      const link = publicBase(req) + '/auth/verify?t=' + encodeURIComponent(token);
      const lang = reqLang(req);
      console.log('[magic] Link angefordert ' + hash(email) + ' ' + lang);
      try {
        const sent = await sendMagicMail(email, link, lang);
        if (!sent.delivered && PROD) return send(res, 503, { error: tr(req, 'err.magicDown') });
        return send(res, 200, { ok: true, delivered: sent.delivered, dev: !!sent.dev });
      } catch { return send(res, 502, { error: tr(req, 'err.magicSend') }); }
    }
    if (req.method === 'GET' && p === '/auth/verify') {
      const lang = reqLang(req);
      const magic = readMagic(url.searchParams.get('t') || '');
      if (!magic) return sendHtml(res, 400, linkPage(lang, i18n.t(lang, 'err.linkTitle'), i18n.t(lang, 'err.linkBody')));
      if (!takeNonce(magic.n)) return sendHtml(res, 400, linkPage(lang, i18n.t(lang, 'err.linkUsedTitle'), i18n.t(lang, 'err.linkUsedBody')));
      const email = normEmail(magic.e);
      setCookie(req, res, sign({ typ: 'acct', e: email, exp: Date.now() + ACCOUNT_DAYS * 864e5 }), ACCOUNT_DAYS * 86400);
      console.log('[magic] angemeldet ' + hash(email));
      res.writeHead(302, { Location: '/?angemeldet=1', 'Cache-Control': 'no-store' });
      return res.end();
    }
    if (req.method === 'POST' && p === '/api/logout') { setCookie(req, res, '', 0); return send(res, 200, { ok: true }); }
    const sess = await enrich(session(req));
    if (req.method === 'GET' && p === '/api/me') return send(res, 200, mePayload(sess, ip));
    if (req.method === 'GET' && p === '/api/status') {
      if (!sess) return send(res, 401, { error: tr(req, 'err.login'), login: true });
      const models = activeModels(sess);
      return send(res, 200, { ok: !!KEY || MOCK, version: VERSION, mock: MOCK, models: models.map(m => ({ label: m.label, id: m.id })), catalog: MODELS.map(m => ({ label: m.label, id: m.id })), usage: usage(sess, ip), plan: planOf(sess), features: featuresOf(sess), stripe: stripeReady(), freeLessons: FREE_LESSONS });
    }
    if (req.method === 'POST' && p === '/api/checkout') {
      if (!sess || sess.kind !== 'account') return send(res, 401, { error: tr(req, 'err.loginEmail'), login: true });
      const b = await readBody(req, 4096);
      if (b.consent !== true) return send(res, 400, { error: tr(req, 'err.consent') });
      if (!stripeReady()) return send(res, 503, { error: tr(req, 'err.proSoon'), unavailable: true });
      if (sess.tier === 'pro') return send(res, 409, { error: tr(req, 'err.alreadyPro'), portal: true });
      const price = b.plan === 'year' ? STRIPE_PRICE_YEARLY : b.plan === 'month' ? STRIPE_PRICE_MONTHLY : '';
      if (!price) return send(res, 400, { error: tr(req, 'err.price') });
      const base = publicBase(req);
      const consentAt = new Date().toISOString();
      const params = {
        mode: 'subscription',
        'line_items[0][price]': price,
        'line_items[0][quantity]': '1',
        allow_promotion_codes: 'true',
        locale: reqLang(req),
        success_url: base + '/?abo=ok',
        cancel_url: base + '/?abo=abbruch',
        client_reference_id: hash(sess.email),
        // payment_method_types absichtlich weglassen: Stripe zeigt die automatischen Zahlungsmethoden aus dem Dashboard.
        'metadata[consent_fagg18]': '1',
        'metadata[consent_at]': consentAt,
        'metadata[lumen_price]': price,
        'subscription_data[metadata][consent_fagg18]': '1',
        'subscription_data[metadata][consent_at]': consentAt,
        'subscription_data[metadata][lumen_price]': price,
      };
      if (sess.customerId) params.customer = sess.customerId;
      else params.customer_email = sess.email;
      try {
        const session = await stripePost('/v1/checkout/sessions', params);
        if (!session.url) throw new Error('Checkout ohne URL');
        console.log('[stripe] Checkout ' + hash(sess.email) + ' ' + (b.plan === 'year' ? 'jahr' : 'monat'));
        return send(res, 200, { url: session.url });
      } catch (e) { console.log('[stripe] Checkout fehlgeschlagen: ' + safeErr(e)); return send(res, 502, { error: tr(req, 'err.checkout') }); }
    }
    if (req.method === 'POST' && p === '/api/portal') {
      if (!sess || sess.kind !== 'account') return send(res, 401, { error: tr(req, 'err.loginEmail'), login: true });
      if (!STRIPE_SECRET_KEY) return send(res, 503, { error: tr(req, 'err.proSoon'), unavailable: true });
      await readBody(req, 4096);
      if (!sess.customerId) return send(res, 404, { error: tr(req, 'err.noSub') });
      try {
        const portal = await stripePost('/v1/billing_portal/sessions', { customer: sess.customerId, return_url: publicBase(req) + '/?abo=portal', locale: reqLang(req) });
        if (!portal.url) throw new Error('Portal ohne URL');
        return send(res, 200, { url: portal.url });
      } catch (e) { console.log('[stripe] Portal fehlgeschlagen: ' + safeErr(e)); return send(res, 502, { error: tr(req, 'err.portalOpen') }); }
    }
    if (req.method === 'POST' && (p === '/api/analyse' || p === '/api/texte')) {
      if (!sess) return send(res, 401, { error: tr(req, 'err.login'), login: true });
      if (!KEY && !MOCK) return send(res, 500, { error: tr(req, 'err.noKey') });
      const isA = p === '/api/analyse';
      const decision = decideAccess(accessCtx(sess, ip, !isA));
      if (!decision.allow) {
        if (decision.limit === 'budget') console.log(`[budget] Tagesbudget $${DAILY_BUDGET} erreicht – Anfrage abgelehnt`);
        return deny(res, req, decision, { usage: usage(sess, ip) });
      }
      const b = await readBody(req); const goal = goalKey(b.goal); const lang = reqLang(req);
      if (!validImg(b.image)) return send(res, 400, { error: tr(req, 'err.image') });
      const key = usageKey(sess);
      if (isA && sess.kind === 'account' && sess.tier === 'free') weekBump(sess.email); else bump((isA ? 'a:' : 't:') + key);
      bump((isA ? 'i:' : 'ti:') + ip);
      const who = sess.kind === 'account' ? hash(sess.email) : sess.c;
      const usedNow = () => (sess.kind === 'account' && sess.tier === 'free') ? weekCount(sess.email) : count('a:' + key);
      if (isA) {
        const models = activeModels(sess);
        const t0 = Date.now(); const P = (process.env.ALLOW_PROMPT_V1 === '1' && b.promptVersion === 1) ? analysePromptV1 : analysePrompt;
        const results = await Promise.all(models.map(async m => {
          try { const r = await withRetry(m.id, P(goal, lang), b.image, 4000, normAnalyse);
            return { label: m.label, model: m.id, ok: true, data: r.data, usage: r.usage };
          } catch (e) { console.log(`[analyse] ${m.id} FEHLER: ${safeErr(e)}`); return { label: m.label, model: m.id, ok: false, error: publicModelErr(lang, e), cost: e.cost || 0 }; }
        }));
        const cost = results.reduce((a, r) => a + (r.usage?.cost || r.cost || 0), 0); spent += cost;
        results.filter(r => !r.ok).forEach(r => console.log(`[analyse] ${r.model} nicht ok`));
        const cap = sess.kind === 'account' && sess.tier === 'free' ? FREE_WEEKLY : (sess.kind === 'account' ? PRO_DAILY : LIMIT_PER_CODE);
        console.log(`[analyse] ${Date.now() - t0} ms, ok=${results.filter(r => r.ok).length}/${results.length}, Kosten ≈ $${cost.toFixed(5)}, heute $${spent.toFixed(4)}/${DAILY_BUDGET}, ${who} ${usedNow()}/${cap}`);
        return send(res, results.some(r => r.ok) ? 200 : 502, { results, cost, edit: consensus(results.filter(r => r.ok)), usage: usage(sess, ip) });
      } else {
        const r = await withRetry(TEXT_MODEL, textPrompt(goal, lang), b.image, 2500); spent += r.usage?.cost || 0;
        const j = r.data || {};
        const raw = j.text ? j : (j[lang] || j.en || j.de || {});
        const fix = (x) => ({ text: String(x?.text || ''), hashtags: (Array.isArray(x?.hashtags) ? x.hashtags : []).map(h => '#' + String(h).replace(/^#+/, '').replace(/\s+/g, '')).slice(0, 10) });
        console.log(`[texte] ${lang} Kosten ≈ $${(r.usage?.cost || 0).toFixed(5)}, heute $${spent.toFixed(4)}/${DAILY_BUDGET}, ${who}`);
        return send(res, 200, { lang, caption: fix(raw), model: TEXT_MODEL, cost: r.usage?.cost || 0 });
      }
    }
    send(res, 404, { error: tr(req, 'err.notFound') });
  } catch (e) {
    console.log(`[fehler] ${p}: ${safeErr(e)}`);
    if (!res.headersSent) {
      const lang = reqLang(req);
      const msg = e.status === 413 ? i18n.t(lang, 'err.tooLarge') : e.status === 400 ? i18n.t(lang, 'err.badRequest') : (e.status ? publicModelErr(lang, e) : i18n.t(lang, 'err.internal'));
      send(res, e.status || 500, { error: msg });
    }
  }
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
        } catch (e) { console.log(`[keep-awake] ${safeErr(e)}`); }
      });
      req.on('socket', (socket) => { try { socket.unref(); } catch {} }); // Request hält den Prozess beim Beenden nicht offen
      req.on('timeout', () => { try { req.destroy(); } catch {} });
      req.on('error', (e) => console.log(`[keep-awake] ${safeErr(e)}`));
      req.end();
    } catch (e) {
      console.log(`[keep-awake] ${safeErr(e)}`);
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
function boot() {
  server.listen(PORT, () => {
    console.log(`Lumen läuft auf Port ${PORT} · Schlüssel ${KEY ? 'gesetzt' : 'FEHLT'}${MOCK ? ' · TESTMODUS' : ''} · Zugang ${AUTH_REQUIRED ? ACCESS_CODES.length + ' Code(s)' : 'OFFEN (keine ACCESS_CODES)'} · Limit ${LIMIT_PER_CODE}/Code/Tag · Budget $${DAILY_BUDGET}/Tag · Mail ${RESEND_API_KEY && MAIL_FROM ? 'Resend' : 'FEHLT'} · Stripe ${stripeReady() ? 'bereit' : 'aus'}${process.env.SESSION_SECRET ? '' : ' · WARNUNG: SESSION_SECRET fehlt'}`);
    if (!RESEND_API_KEY) console.log('[mail] WARNUNG: RESEND_API_KEY fehlt – Anmeldelinks werden nicht per E-Mail versendet' + (PROD ? '' : ' (in der Entwicklung steht der Link in dieser Konsole)'));
    else if (!MAIL_FROM) console.log('[mail] WARNUNG: MAIL_FROM fehlt – Anmeldelinks werden nicht per E-Mail versendet');
    if (!stripeReady()) console.log('[stripe] Hinweis: STRIPE_SECRET_KEY oder Preis-IDs fehlen – im Kauf-Dialog steht „Pro bald verfügbar“');
    else if (!STRIPE_WEBHOOK_SECRET) console.log('[stripe] WARNUNG: STRIPE_WEBHOOK_SECRET fehlt – Webhooks werden abgelehnt, der Abo-Status kommt aus der Stripe-API');
    keepAwakeTimer = startKeepAwake();
  });
  const stop = () => { console.log('Beende …'); if (keepAwakeTimer) clearInterval(keepAwakeTimer); server.close(() => process.exit(0)); setTimeout(() => process.exit(0), 10000).unref(); };
  process.on('SIGTERM', stop); process.on('SIGINT', stop);
}
if (require.main === module) boot();

module.exports = {
  sign, verifySigned, verifyStripeSignature, normEmail, readSession, readMagic, decideAccess,
  weekBump, weekCount, allowRate, takeNonce, hash, resetEphemeral, formEncode,
  FREE_WEEKLY, PRO_DAILY, FREE_LESSONS,
  pickLang: i18n.pickLang, t: i18n.t, mailCopy: i18n.mailCopy, course: i18n.course,
  dictionaryKeys: i18n.dictionaryKeys, LANGS: i18n.LANGS, analysePrompt, textPrompt, goalKey,
  grantsLumenPro, handleStripeEvent, lookupPro, LUMEN_PRICE_IDS,
};
