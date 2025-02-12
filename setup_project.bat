@echo off
echo Configurando ambiente do Productivity App

REM Verificar Python
python --version
if %errorlevel% neq 0 (
    echo Python não encontrado. Por favor, instale Python 3.9+.
    exit /b 1
)

REM Criar ambiente virtual
python -m venv venv
call venv\Scripts\activate

REM Atualizar pip
python -m pip install --upgrade pip

REM Instalar dependências do backend
pip install -r backend\requirements.txt

REM Instalar dependências do frontend
npm install

echo Ambiente configurado com sucesso!
pause
