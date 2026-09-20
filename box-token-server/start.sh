#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  cp ".env.example" ".env"
  echo "[box-token-server] Создан .env из .env.example - откройте его и впишите BOX_CLIENT_ID / BOX_CLIENT_SECRET, затем запустите этот скрипт снова."
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "[box-token-server] Устанавливаю зависимости..."
  npm install
fi

echo "[box-token-server] Запускаю сервер..."
npm start
