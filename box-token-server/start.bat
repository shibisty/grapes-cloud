@echo off
setlocal
cd /d "%~dp0"

if not exist ".env" (
  if exist ".env.example" (
    copy /Y ".env.example" ".env" >nul
    echo [box-token-server] Создан .env из .env.example - откройте его и впишите BOX_CLIENT_ID / BOX_CLIENT_SECRET, затем запустите этот файл снова.
    pause
    exit /b 1
  )
)

if not exist "node_modules" (
  echo [box-token-server] Устанавливаю зависимости...
  call npm install
  if errorlevel 1 (
    echo [box-token-server] npm install завершился с ошибкой - см. вывод выше.
    pause
    exit /b 1
  )
)

echo [box-token-server] Запускаю сервер...
call npm start
pause
