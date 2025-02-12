@echo off
echo Iniciando Productivity App

REM Ativar ambiente virtual
call venv\Scripts\activate

REM Iniciar backend
start cmd /k "cd backend && python run_server.py"

REM Iniciar frontend
start cmd /k "npm run dev"

echo Aplicativo iniciado. Verifique os servidores backend e frontend.
pause
