@echo off
setlocal enabledelayedexpansion

:: Verificar se Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python não encontrado. Por favor, instale Python 3.9+.
    pause
    exit /b 1
)

:: Configurar ambiente virtual
echo 🔧 Verificando ambiente virtual...
if not exist venv (
    echo 🔨 Criando ambiente virtual...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo ❌ Falha ao criar ambiente virtual.
        pause
        exit /b 1
    )
)

:: Ativar ambiente virtual
echo 🚀 Ativando ambiente virtual...
call venv\Scripts\activate
if %errorlevel% neq 0 (
    echo ❌ Falha ao ativar ambiente virtual.
    pause
    exit /b 1
)

:: Atualizar pip
echo 🔄 Atualizando pip...
python -m pip install --upgrade pip
if %errorlevel% neq 0 (
    echo ❌ Falha ao atualizar pip.
    pause
    exit /b 1
)

:: Verificar se npm está instalado
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm não encontrado. Por favor, instale Node.js.
    pause
    exit /b 1
)

:: Instalar dependências do backend
echo 📦 Instalando dependências do backend...
pip install -r backend\requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Falha ao instalar dependências do backend.
    pause
    exit /b 1
)

:: Instalar dependências do frontend
echo 📦 Instalando dependências do frontend...
npm install --prefix frontend
if %errorlevel% neq 0 (
    echo ❌ Falha ao instalar dependências do frontend.
    pause
    exit /b 1
)

:: Instalar o projeto em modo de desenvolvimento
echo 🔧 Instalando projeto em modo de desenvolvimento...
pip install -e .
if %errorlevel% neq 0 (
    echo ❌ Falha ao instalar projeto em modo de desenvolvimento.
    pause
    exit /b 1
)

:: Configurar variáveis de ambiente
set DATABASE_URL=sqlite:///./productivity.db

:: Aplicar migrações do banco de dados
echo 🔄 Aplicando migrações do banco de dados...
cd backend
alembic upgrade head
if %errorlevel% neq 0 (
    echo ❌ Falha ao aplicar migrações do banco de dados.
    cd ..
    pause
    exit /b 1
)
cd ..

:: Iniciar backend em segundo plano
echo 🚀 Iniciando backend...
start /B python backend\start_backend.py

:: Iniciar frontend em outro terminal
echo 🌐 Iniciando frontend...
start /B npm run serve --prefix frontend

echo ✅ Projeto inicializado com sucesso!
echo Acesse http://localhost:8080 para ver a aplicação

pause
