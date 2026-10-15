const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('child_process');
const crypto = require('crypto');
const path = require('path');

process.env.SESSION_SECRET = 'unit-test-secret';
process.env.ACCESS_CODES = 'UNIT-CODE';
const app = require('../server.js');

const root = path.join(__dirname, '..');
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

test('Server startet ohne die neuen Variablen', async () => {
  const srv = await startServer({ NODE_ENV: 'production', PORT: '18787' });
  const base = 'http://127.0.0.1:' + srv.port;
  try {
    await until(() => /RESEND_API_KEY fehlt/.test(srv.out) && /Pro bald verfügbar/.test(srv.out));
    assert.doesNotMatch(srv.out, /sk_live_|whsec_[A-Za-z0-9]|re_[A-Za-z0-9]/);
    const health = await fetch(base + '/healthz').then((r) => r.json());
    assert.equal(health.ok, true);
    const me = await fetch(base + '/api/me').then((r) => r.json());
    assert.equal(me.authRequired, false);
    assert.equal(me.plan, 'open');
    assert.equal(me.stripe, false);
  } finally { await stop(srv.child); }
});

test('Magic-Link, Gratis-Limit, Checkout-Zustimmung und Webhook', async () => {
  const secret = 'whsec_smoketest';
  const srv = await startServer({
    PORT: '18788',
    ACCESS_CODES: 'TEST-CODE',
    NODE_ENV: 'development',
    STRIPE_WEBHOOK_SECRET: secret,
  });
  const base = 'http://127.0.0.1:' + srv.port;
  try {
    const home = await fetch(base + '/');
    const html = await home.text();
    assert.match(html, /id="shareBtn"/);
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

    const badMail = await fetch(base + '/api/magic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"email":"nope"}' });
    assert.equal(badMail.status, 400);

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
    assert.match(noStripeJson.error, /Pro bald verfügbar/);

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

    const body = JSON.stringify({ id: 'evt_smoke', type: 'checkout.session.completed', data: { object: { mode: 'subscription', status: 'complete', customer: 'cus_smoke', customer_email: 'ada@example.com' } } });
    const ts = Math.floor(Date.now() / 1000);
    const sig = crypto.createHmac('sha256', secret).update(ts + '.' + body).digest('hex');
    const bad = await fetch(base + '/stripe/webhook', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Stripe-Signature': `t=${ts},v1=00` }, body });
    assert.equal(bad.status, 400);
    const ok = await fetch(base + '/stripe/webhook', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Stripe-Signature': `t=${ts},v1=${sig}` }, body });
    assert.equal(ok.status, 200);
    const after = await fetch(base + '/api/me', { headers: { cookie } }).then((r) => r.json());
    assert.equal(after.plan, 'pro');
  } finally { await stop(srv.child); }
});
