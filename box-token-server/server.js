'use strict';

/**
 * Готовый к запуску token-exchange сервер для BoxProvider
 * (grapesjs-cloud-assets). Box требует client_secret на КАЖДЫЙ обмен
 * (и первый code→token, и каждый последующий refresh_token→token) без
 * PKCE-альтернативы для браузерных клиентов — см. README.md плагина,
 * раздел "Box", и комментарий у `BoxProviderOptions.tokenEndpoint` в
 * `src/providers/box/BoxProvider.ts`. Секрет хранится ТОЛЬКО здесь, на
 * сервере — не в браузере.
 *
 * Это НЕОБЯЗАТЕЛЬНЫЙ компонент: он нужен, только если вы хотите
 * включить провайдер Box. Если Box вам не нужен — просто не
 * передавайте BoxProvider в опции плагина и не запускайте этот
 * сервер вообще. Если у вас уже есть свой бэкенд — реализуйте тот же
 * контракт (см. "Контракт эндпоинта" ниже) на своей инфраструктуре и
 * этот файл вам не понадобится, он тут просто как рабочий пример.
 *
 * Запуск: см. README.md в этой же папке (или start.sh/start.bat).
 */

require('dotenv').config();
const express = require('express');

const {
  BOX_CLIENT_ID,
  BOX_CLIENT_SECRET,
  PORT: PORT_ENV,
  ALLOWED_ORIGIN: ALLOWED_ORIGIN_ENV,
} = process.env;

const PORT = PORT_ENV || '8787';
const ALLOWED_ORIGIN = ALLOWED_ORIGIN_ENV || '*';

if (!BOX_CLIENT_ID || !BOX_CLIENT_SECRET) {
  console.error(
    [
      '[box-token-server] Не заданы BOX_CLIENT_ID и/или BOX_CLIENT_SECRET.',
      '  1) Скопируйте .env.example в .env',
      '  2) Впишите значения из своего приложения Box',
      '     (Box Developer Console → ваше приложение → Configuration → OAuth 2.0 Credentials)',
      '  3) Перезапустите этот сервер.',
    ].join('\n'),
  );
  process.exit(1);
}

const BOX_TOKEN_URL = 'https://api.box.com/oauth2/token';
const TOKEN_PATH = '/api/box-token';

const allowedOrigins = ALLOWED_ORIGIN.split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function isOriginAllowed(origin) {
  if (allowedOrigins.includes('*')) return true;
  if (!origin) return false;
  return allowedOrigins.includes(origin);
}

const app = express();
app.use(express.json());

// CORS: BoxProvider дёргает этот эндпоинт напрямую из браузера сайта
// (см. `exchangeToken()` в BoxProvider.ts) — почти всегда с другого
// origin, чем сам этот сервер, значит без CORS-заголовков браузер
// заблокирует ответ. ALLOWED_ORIGIN=* удобен для локальной разработки
// (и стоит по умолчанию, чтобы всё сразу заработало из коробки) — в
// проде замените на настоящий origin(ы) вашего сайта через .env,
// см. .env.example.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins.includes('*') ? '*' : origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'grapesjs-cloud-assets: box-token-server запущен и работает.',
    tokenPath: TOKEN_PATH,
  });
});

/**
 * Контракт эндпоинта (см. `exchangeToken()` в BoxProvider.ts —
 * плагин шлёт запросы РОВНО в этом формате):
 *   POST TOKEN_PATH, Content-Type: application/json
 *   Тело: { grant_type: 'authorization_code', code, redirect_uri }
 *      или { grant_type: 'refresh_token', refresh_token }
 *   Ответ: статус и JSON-тело от Box передаются как есть — и при
 *   успехе (200, { access_token, refresh_token, expires_in, ... }),
 *   и при ошибке (Box сам вернёт 400/401 с описанием) — BoxProvider
 *   сам разбирает оба случая по `res.ok`.
 */
app.post(TOKEN_PATH, async (req, res) => {
  const body = req.body || {};
  const grantType = body.grant_type;

  const params = new URLSearchParams({
    client_id: BOX_CLIENT_ID,
    client_secret: BOX_CLIENT_SECRET,
  });

  if (grantType === 'authorization_code') {
    const { code, redirect_uri: redirectUri } = body;
    if (!code || !redirectUri) {
      res.status(400).json({
        error: 'invalid_request',
        error_description: '"code" и "redirect_uri" обязательны для grant_type=authorization_code.',
      });
      return;
    }
    params.set('grant_type', 'authorization_code');
    params.set('code', code);
    params.set('redirect_uri', redirectUri);
  } else if (grantType === 'refresh_token') {
    const refreshToken = body.refresh_token;
    if (!refreshToken) {
      res.status(400).json({
        error: 'invalid_request',
        error_description: '"refresh_token" обязателен для grant_type=refresh_token.',
      });
      return;
    }
    params.set('grant_type', 'refresh_token');
    params.set('refresh_token', refreshToken);
  } else {
    res.status(400).json({
      error: 'invalid_request',
      error_description: 'grant_type должен быть "authorization_code" или "refresh_token".',
    });
    return;
  }

  let boxRes;
  try {
    // Требует Node.js 18+ (глобальный fetch) — см. package.json engines.
    boxRes = await fetch(BOX_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
  } catch (err) {
    console.error('[box-token-server] Не удалось достучаться до api.box.com:', err);
    res.status(502).json({
      error: 'upstream_unreachable',
      error_description: 'Не удалось достучаться до api.box.com.',
    });
    return;
  }

  // Пробрасываем ответ Box как есть (и успех, и ошибку) — BoxProvider
  // сам решает, что с ним делать, по коду статуса.
  const text = await boxRes.text();
  res.status(boxRes.status);
  res.setHeader('Content-Type', boxRes.headers.get('content-type') || 'application/json');
  res.send(text);
});

app.listen(Number(PORT), () => {
  console.log(`[box-token-server] Слушает http://localhost:${PORT}${TOKEN_PATH}`);
  console.log('[box-token-server] Укажите этот URL в опции `tokenEndpoint` у BoxProvider (или адрес того сервера, куда вы это задеплоите).');
});
