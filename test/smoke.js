const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('child_process');
const crypto = require('crypto');
const path = require('path');

process.env.SESSION_SECRET = 'unit-test-secret';
process.env.ACCESS_CODES = 'UNIT-CODE';
process.env.STRIPE_PRICE_MONTHLY = 'price_lumen_month';
process.env.STRIPE_PRICE_YEARLY = 'price_lumen_year';
process.env.STRIPE_LUMEN_EXTRA_PRICE_IDS = 'price_extra, price_spaced';
const app = require('../server.js');

const root = path.join(__dirname, '..');

test('Node.js-Anforderung in Paket, README und CI ist konsistent', () => {
  const pkg = require('../package.json');
  const readme = require('fs').readFileSync(path.join(root, 'README.md'), 'utf8');
  const workflow = require('fs').readFileSync(path.join(root, '.github', 'workflows', 'lumen-checks.yml'), 'utf8');
  assert.equal(pkg.engines.node, '>=20');
  assert.match(readme, /Node\.js 20 oder neuer/);
  assert.match(workflow, /node-version:\s*20/);
});
const TINY = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

function limits(over) {
  return Object.assign({
    kind: 'account', tier: 'free', isText: false, weekUsed: 0, periodUsed: 0, ipUsed: 0,
    ipLimit: 30, codeLimit: 20, proDaily: 15, freeWeekly: 3, textFactor: 2, budgetSpent: 0, budgetMax: 1,
  }, over);
}

test('Signatur, Magic-Link und Einladungscode', () => {
  const email = app.normEmail('  Ada@Example.com ');
  assert.equal(email, 'ada@example.com');
  assert.equal(app.normEmail('kein-at'), null);
  const magic = app.sign({ typ: 'login', e: email, n: 'nonce-1', exp: Date.now() + 60e3 });
  assert.equal(app.readMagic(magic).e, email);
  assert.equal(app.readSession(magic), null);
  assert.equal(app.readMagic(app.sign({ typ: 'login', e: email, n: 'nonce-1', exp: Date.now() - 1000 })), null);
  assert.equal(app.takeNonce('nonce-1'), true);
  assert.equal(app.takeNonce('nonce-1'), false);
  const acct = app.sign({ typ: 'acct', e: email, exp: Date.now() + 60e3 });
  assert.equal(app.readSession(acct).kind, 'account');
  const code = app.sign({ c: app.hash('UNIT-CODE'), exp: Date.now() + 60e3 });
  assert.equal(app.readSession(code).kind, 'code');
  assert.equal(app.readSession(code + 'x'), null);
});

test('Stripe-Signatur akzeptiert den Rohbody und lehnt Änderungen ab', () => {
  const secret = 'whsec_testsecret';
  const payload = Buffer.from('{"id":"evt_1","type":"customer.subscription.deleted"}');
  const t = Math.floor(Date.now() / 1000);
  const sig = crypto.createHmac('sha256', secret).update(t + '.').update(payload).digest('hex');
  const header = `t=${t},v1=${sig},v0=deadbeef`;
  assert.equal(app.verifyStripeSignature(payload, header, secret), true);
  const tampered = Buffer.from(payload.toString().replace('deleted', 'updated'));
  assert.equal(app.verifyStripeSignature(tampered, header, secret), false);
  const old = t - 600;
  const oldSig = crypto.createHmac('sha256', secret).update(old + '.').update(payload).digest('hex');
  assert.equal(app.verifyStripeSignature(payload, `t=${old},v1=${oldSig}`, secret), false);
  assert.equal(app.verifyStripeSignature(payload, header, 'whsec_other'), false);
});

test('Nur Lumen-Preise zählen als Pro', async () => {
  app.resetEphemeral();
  const sub = (price, status = 'active') => ({ status, items: { data: [{ price: { id: price } }] } });
  assert.equal(app.grantsLumenPro(sub('price_lumen_month')), true);
  assert.equal(app.grantsLumenPro(sub('price_lumen_year', 'trialing')), true);
  assert.equal(app.grantsLumenPro(sub('price_extra')), true);
  assert.equal(app.grantsLumenPro(sub('price_spaced')), true);
  assert.equal(app.grantsLumenPro(sub('price_calculator')), false);
  assert.equal(app.grantsLumenPro(sub('price_lumen_month', 'canceled')), false);
  assert.equal(app.grantsLumenPro({ status: 'active', items: { data: [{ price: 'price_lumen_month' }] } }), true);
  assert.equal(app.grantsLumenPro({ status: 'active', items: { data: [{ plan: { id: 'price_lumen_year' } }] } }), true);
  assert.equal(app.grantsLumenPro({ status: 'active', items: { data: [{ price: { id: 'price_calculator' } }, { price: { id: 'price_lumen_year' } }] } }), true);
  assert.equal(app.LUMEN_PRICE_IDS.has('price_lumen_month'), true);
  assert.equal(app.LUMEN_PRICE_IDS.has('price_calculator'), false);

  const otherCheckout = { type: 'checkout.session.completed', data: { object: { mode: 'subscription', status: 'complete', customer: 'cus_x', customer_email: 'ada@example.com', line_items: { data: [{ price: { id: 'price_calculator' } }] } } } };
  await app.handleStripeEvent(otherCheckout);
  assert.equal((await app.lookupPro('ada@example.com')).pro, false);

  await app.handleStripeEvent({ type: 'checkout.session.completed', data: { object: { mode: 'subscription', status: 'complete', customer: 'cus_x', customer_email: 'ada@example.com', metadata: { lumen_price: 'price_lumen_month' } } } });
  assert.equal((await app.lookupPro('ada@example.com')).pro, true);

  await app.handleStripeEvent({ type: 'customer.subscription.updated', data: { object: { status: 'canceled', customer: 'cus_x', items: { data: [{ price: { id: 'price_calculator_sub' } }] } } } });
  assert.equal((await app.lookupPro('ada@example.com')).pro, true);

  await app.handleStripeEvent({ type: 'customer.subscription.deleted', data: { object: { status: 'canceled', customer: 'cus_x', items: { data: [{ price: { id: 'price_lumen_month' } }] } } } });
  assert.equal((await app.lookupPro('ada@example.com')).pro, false);

  await app.handleStripeEvent({ type: 'customer.subscription.updated', data: { object: { status: 'active', customer: 'cus_x', items: { data: [{ price: { id: 'price_extra' } }] } } } });
  assert.equal((await app.lookupPro('ada@example.com')).pro, true);
  app.resetEphemeral();
});

test('Gratis, Pro und Einladungscode haben die vorgesehenen Limits', () => {
  app.resetEphemeral();
  assert.equal(app.decideAccess(limits()).allow, true);
  assert.equal(app.decideAccess(limits({ weekUsed: 3 })).allow, false);
  assert.equal(app.decideAccess(limits({ weekUsed: 3 })).limit, 'week');
  assert.equal(app.decideAccess(limits({ weekUsed: 3 })).upgrade, true);
  assert.equal(app.decideAccess(limits({ isText: true })).upgrade, true);
  assert.equal(app.decideAccess(limits({ tier: 'pro', periodUsed: 14 })).allow, true);
  assert.equal(app.decideAccess(limits({ tier: 'pro', periodUsed: 15 })).allow, false);
  assert.equal(app.decideAccess(limits({ kind: 'code', tier: 'pro', periodUsed: 19 })).allow, true);
  assert.equal(app.decideAccess(limits({ kind: 'code', tier: 'pro', periodUsed: 20 })).limit, 'code');
  assert.equal(app.decideAccess(limits({ kind: 'code', tier: 'pro', isText: true, periodUsed: 39 })).allow, true);
  assert.equal(app.decideAccess(limits({ kind: 'code', tier: 'pro', isText: true, periodUsed: 40 })).allow, false);
  assert.equal(app.decideAccess(limits({ budgetSpent: 1 })).limit, 'budget');
  const past = Date.now() - 8 * 864e5;
  app.weekBump('alt@example.com', past);
  assert.equal(app.weekCount('alt@example.com'), 0);
  app.weekBump('neu@example.com', Date.now());
  app.weekBump('neu@example.com', Date.now());
  assert.equal(app.weekCount('neu@example.com'), 2);
  const map = new Map();
  assert.equal(app.allowRate(map, 'k', 2, 1000, 1000), true);
  assert.equal(app.allowRate(map, 'k', 2, 1000, 1000), true);
  assert.equal(app.allowRate(map, 'k', 2, 1000, 1000), false);
  assert.equal(app.allowRate(map, 'k', 2, 1000, 3000), true);
});

function startServer(env) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['server.js'], {
      cwd: root,
      env: Object.assign({
        PATH: process.env.PATH,
        HOME: process.env.HOME || '/tmp',
        NODE_ENV: 'development',
        MOCK: '1',
        MOCK_DELAY_MS: '0',
        SESSION_SECRET: 'smoke-secret',
      }, env),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    let settled = false;
    const timer = setTimeout(() => { if (!settled) { settled = true; child.kill(); reject(new Error('Server startet nicht: ' + out.slice(-500))); } }, 8000);
    const take = (buf) => {
      out += buf.toString();
      const m = out.match(/Lumen läuft auf Port (\d+)/);
      if (m && !settled) { settled = true; clearTimeout(timer); resolve({ child, port: m[1], get out() { return out; } }); }
    };
    child.stdout.on('data', take);
    child.stderr.on('data', take);
    child.on('exit', (code) => { if (!settled) { settled = true; clearTimeout(timer); reject(new Error('exit ' + code + ' ' + out.slice(-500))); } });
  });
}
async function until(fn, ms = 2000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { if (fn()) return; await new Promise((r) => setTimeout(r, 30)); }
  throw new Error('Zeit überschritten');
}

async function stop(child) {
  if (!child || child.killed) return;
  child.kill('SIGTERM');
  await new Promise((resolve) => {
    const t = setTimeout(() => { child.kill('SIGKILL'); resolve(); }, 2000);
    child.on('exit', () => { clearTimeout(t); resolve(); });
  });
}

test('Sprache aus Browser, Wörterbuch, Mail und Prompts', () => {
  assert.equal(app.pickLang({ accept: 'de-AT,de;q=0.9,en;q=0.8' }), 'de');
  assert.equal(app.pickLang({ accept: 'de-DE' }), 'de');
  assert.equal(app.pickLang({ accept: 'de-CH,fr;q=0.5' }), 'de');
  assert.equal(app.pickLang({ cookie: 'fr', accept: 'de-AT' }), 'fr');
  assert.equal(app.pickLang({ accept: 'pt-BR,pt;q=0.9,en;q=0.8' }), 'en');
  assert.equal(app.pickLang({}), 'en');
  assert.equal(app.pickLang({ languages: ['it-IT', 'en'] }), 'it');
  assert.equal(app.pickLang({ accept: 'es-MX,es;q=0.9' }), 'es');
  const keys = app.dictionaryKeys();
  assert.ok(keys.includes('mail.subject'));
  assert.ok(keys.includes('price.consent'));
  for (const lang of app.LANGS) {
    for (const key of keys) {
      assert.equal(typeof app.t(lang, key), 'string');
      assert.notEqual(app.t(lang, key), key);
    }
    const lessons = app.course(lang);
    assert.equal(lessons.length, 6);
    assert.deepEqual(lessons.map((c) => c.id), app.course('de').map((c) => c.id));
  }
  const i18n = require('../public/i18n.js');
  for (const key of keys) {
    for (const lang of i18n.LANGS) assert.equal(typeof i18n.STR[lang][key], 'string');
  }
  assert.notEqual(app.mailCopy('de', 'https://example.test/a').subject, app.mailCopy('en', 'https://example.test/a').subject);
  assert.match(app.mailCopy('fr', 'https://example.test/a').text, /example\.test/);
  assert.match(app.analysePrompt('instagram', 'fr'), /OUTPUT_LANG=fr/);
  assert.match(app.analysePrompt('instagram', 'fr'), /Französisch|French/);
  assert.match(app.textPrompt('learn', 'es'), /LUMEN_CAPTION es/);
  assert.equal(app.goalKey('concours'), 'contest');
  assert.equal(app.goalKey('aprender'), 'learn');
});

test('Server startet ohne die neuen Variablen', async () => {
  const srv = await startServer({ NODE_ENV: 'production', PORT: '18787' });
  const base = 'http://127.0.0.1:' + srv.port;
  try {
    await until(() => /RESEND_API_KEY fehlt/.test(srv.out) && /Pro bald verfügbar/.test(srv.out));
    assert.doesNotMatch(srv.out, /sk_live_|whsec_[A-Za-z0-9]|re_[A-Za-z0-9]/);
    const health = await fetch(base + '/healthz').then((r) => r.json());
    assert.equal(health.ok, true);
    assert.equal(health.version, require('../package.json').version);
    const me = await fetch(base + '/api/me').then((r) => r.json());
    assert.equal(me.authRequired, false);
    assert.equal(me.plan, 'open');
    assert.equal(me.stripe, false);
    for (const p of ['/sw.js', '/icon-maskable-192.png', '/icon-maskable-512.png']) assert.equal((await fetch(base + p)).status, 200, p);
    const mf = await fetch(base + '/manifest.webmanifest').then((r) => r.json());
    assert.ok(mf.icons.some((i) => i.sizes === '512x512' && i.purpose === 'maskable'));
    const [al] = await fetch(base + '/.well-known/assetlinks.json').then((r) => r.json());
    assert.equal(al.target.package_name, 'at.picwishfotodesign.lumen');
    assert.ok(al.target.sha256_cert_fingerprints.length >= 1);
  } finally { await stop(srv.child); }
});

test('Magic-Link, Gratis-Limit, Checkout-Zustimmung und Webhook', async () => {
  const secret = 'whsec_smoketest';
  const srv = await startServer({
    PORT: '18788',
    ACCESS_CODES: 'TEST-CODE',
    NODE_ENV: 'development',
    STRIPE_WEBHOOK_SECRET: secret,
    STRIPE_PRICE_MONTHLY: 'price_lumen_month',
    STRIPE_PRICE_YEARLY: 'price_lumen_year',
    STRIPE_LUMEN_EXTRA_PRICE_IDS: 'price_extra',
  });
  const base = 'http://127.0.0.1:' + srv.port;
  try {
    const home = await fetch(base + '/');
    const html = await home.text();
    assert.match(html, /id="shareBtn"/);
    assert.match(html, /v0\.4\.1/);
    assert.match(html, /shareEdit/);
    assert.match(html, /faggOk/);
    assert.match(html, /spare 35%/);
    for (const path of ['/agb', '/widerruf', '/datenschutz', '/impressum']) {
      const page = await fetch(base + path).then((r) => r.text());
      const visible = page.replace(/<!--[\s\S]*?-->/g, '');
      assert.equal(visible.includes('TODO'), false, path + ' zeigt TODO');
      assert.match(page, /Robert Tüchi/);
      assert.match(page, /href="\/agb"/);
      assert.match(page, /href="\/widerruf"/);
    }
    const agb = await fetch(base + '/agb').then((r) => r.text());
    assert.match(agb, /TODO RECHTLICHE PRÜFUNG/);
    const privacy = await fetch(base + '/datenschutz').then((r) => r.text());
    assert.match(privacy, /Stripe/);
    assert.match(privacy, /Resend/);
    assert.match(privacy, /lumen_s/);
    assert.match(privacy, /lumen_lang/);
    for (const path of ['/en/agb', '/en/widerruf', '/en/datenschutz', '/en/impressum']) {
      const page = await fetch(base + path).then((r) => r.text());
      const visible = page.replace(/<!--[\s\S]*?-->/g, '');
      assert.equal(visible.includes('TODO'), false, path + ' zeigt TODO');
      assert.match(page, /Robert Tüchi/);
      assert.match(page, /lang="en"/);
      assert.match(visible, /German version prevails/);
    }

    const badMail = await fetch(base + '/api/magic', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept-Language': 'it-IT,it;q=0.9' }, body: '{"email":"nope"}' });
    assert.equal(badMail.status, 400);
    const badMailJson = await badMail.json();
    assert.match(badMailJson.error, /valido/);

    const magic = await fetch(base + '/api/magic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'ada@example.com' }) });
    const magicJson = await magic.json();
    assert.equal(magic.status, 200);
    assert.equal(magicJson.dev, true);
    assert.equal(magicJson.delivered, false);
    assert.equal(magicJson.link, undefined);
    await until(() => /\/auth\/verify\?t=/.test(srv.out));
    const link = srv.out.match(/https?:\/\/\S+\/auth\/verify\?t=\S+/)[0];
    const jump = await fetch(link, { redirect: 'manual' });
    assert.equal(jump.status, 302);
    const setCookie = jump.headers.getSetCookie().find((c) => c.startsWith('lumen_s='));
    assert.ok(setCookie);
    const cookie = setCookie.split(';')[0];
    const again = await fetch(link, { redirect: 'manual' });
    assert.equal(again.status, 400);

    const me = await fetch(base + '/api/me', { headers: { cookie } }).then((r) => r.json());
    assert.equal(me.plan, 'free');
    assert.equal(me.email, 'ada@example.com');
    assert.equal(me.usage.limit, 3);
    assert.equal(me.usage.window, 'week');
    assert.equal(me.features.captions, false);
    const status = await fetch(base + '/api/status', { headers: { cookie } }).then((r) => r.json());
    assert.equal(status.version, require('../package.json').version);
    assert.equal(status.models.length, 1);
    assert.match(status.models[0].id, /gemini/);

    const analyse = await fetch(base + '/api/analyse', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie }, body: JSON.stringify({ image: TINY, goal: 'Lernen' }) });
    const analysed = await analyse.json();
    assert.equal(analyse.status, 200);
    assert.equal(analysed.results.length, 1);
    assert.equal(analysed.results[0].label, 'Gemini');
    const texts = await fetch(base + '/api/texte', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie }, body: JSON.stringify({ image: TINY, goal: 'Instagram' }) });
    const textJson = await texts.json();
    assert.equal(texts.status, 403);
    assert.equal(textJson.upgrade, true);

    const noConsent = await fetch(base + '/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie }, body: JSON.stringify({ plan: 'month', consent: false }) });
    assert.equal(noConsent.status, 400);
    const noStripe = await fetch(base + '/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie }, body: JSON.stringify({ plan: 'month', consent: true }) });
    const noStripeJson = await noStripe.json();
    assert.equal(noStripe.status, 503);
    assert.match(noStripeJson.error, /Pro coming soon/);
    const deSoon = await fetch(base + '/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie: cookie + '; lumen_lang=de' }, body: JSON.stringify({ plan: 'month', consent: true }) });
    const deSoonJson = await deSoon.json();
    assert.equal(deSoon.status, 503);
    assert.match(deSoonJson.error, /Pro bald verfügbar/);

    const codeLogin = await fetch(base + '/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: 'TEST-CODE' }) });
    assert.equal(codeLogin.status, 200);
    const codeCookie = codeLogin.headers.getSetCookie().find((c) => c.startsWith('lumen_s=')).split(';')[0];
    const tester = await fetch(base + '/api/me', { headers: { cookie: codeCookie } }).then((r) => r.json());
    assert.equal(tester.plan, 'tester');
    assert.equal(tester.features.captions, true);
    assert.equal(tester.usage.limit, 20);
    const wide = await fetch(base + '/api/analyse', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie: codeCookie }, body: JSON.stringify({ image: TINY, goal: 'Lernen' }) });
    const wideJson = await wide.json();
    assert.equal(wide.status, 200);
    assert.equal(wideJson.results.length, 3);

    const signBody = (raw) => {
      const ts = Math.floor(Date.now() / 1000);
      const sig = crypto.createHmac('sha256', secret).update(ts + '.' + raw).digest('hex');
      return { raw, headers: { 'Content-Type': 'application/json', 'Stripe-Signature': `t=${ts},v1=${sig}` } };
    };
    const postEvent = async (event) => {
      const signed = signBody(JSON.stringify(event));
      const res = await fetch(base + '/stripe/webhook', { method: 'POST', headers: signed.headers, body: signed.raw });
      assert.equal(res.status, 200);
    };
    const other = { id: 'evt_other', type: 'checkout.session.completed', data: { object: { mode: 'payment', status: 'complete', customer: 'cus_smoke', customer_email: 'ada@example.com', line_items: { data: [{ price: { id: 'price_calculator' } }] } } } };
    await postEvent(other);
    const stillFree = await fetch(base + '/api/me', { headers: { cookie } }).then((r) => r.json());
    assert.equal(stillFree.plan, 'free');
    const body = JSON.stringify({ id: 'evt_smoke', type: 'checkout.session.completed', data: { object: { mode: 'subscription', status: 'complete', customer: 'cus_smoke', customer_email: 'ada@example.com', line_items: { data: [{ price: { id: 'price_lumen_month' } }] } } } });
    const ts = Math.floor(Date.now() / 1000);
    const sig = crypto.createHmac('sha256', secret).update(ts + '.' + body).digest('hex');
    const bad = await fetch(base + '/stripe/webhook', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Stripe-Signature': `t=${ts},v1=00` }, body });
    assert.equal(bad.status, 400);
    const ok = await fetch(base + '/stripe/webhook', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Stripe-Signature': `t=${ts},v1=${sig}` }, body });
    assert.equal(ok.status, 200);
    const after = await fetch(base + '/api/me', { headers: { cookie } }).then((r) => r.json());
    assert.equal(after.plan, 'pro');
    await postEvent({ id: 'evt_keep', type: 'customer.subscription.deleted', data: { object: { status: 'canceled', customer: 'cus_smoke', items: { data: [{ price: { id: 'price_calculator' } }] } } } });
    const kept = await fetch(base + '/api/me', { headers: { cookie } }).then((r) => r.json());
    assert.equal(kept.plan, 'pro');
  } finally { await stop(srv.child); }
});
