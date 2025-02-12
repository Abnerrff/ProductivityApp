import os
import subprocess
import sys
import threading
import time

def start_backend():
    """Iniciar servidor backend"""
    print("🔧 Iniciando Backend...")
    backend_process = subprocess.Popen(
        [sys.executable, "run_server.py"], 
        cwd="./backend",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    return backend_process

def start_frontend():
    """Iniciar servidor frontend"""
    print("🚀 Iniciando Frontend...")
    frontend_process = subprocess.Popen(
        ["npm", "run", "dev"], 
        cwd=".",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    return frontend_process

def print_output(process, prefix):
    """Imprimir saída de um processo"""
    for line in process.stdout:
        print(f"{prefix}: {line.strip()}")

def main():
    # Verificar dependências
    try:
        subprocess.run(["python", "--version"], capture_output=True, text=True)
        subprocess.run(["npm", "--version"], capture_output=True, text=True)
    except FileNotFoundError:
        print("❌ Python ou NPM não instalados!")
        sys.exit(1)

    # Instalar dependências do backend
    print("📦 Instalando dependências do Backend...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"], check=True)

    # Instalar dependências do frontend
    print("📦 Instalando dependências do Frontend...")
    subprocess.run(["npm", "install"], check=True)

    # Iniciar servidores
    backend = start_backend()
    time.sleep(3)  # Aguardar backend iniciar
    frontend = start_frontend()

    # Threads para capturar saída
    backend_thread = threading.Thread(target=print_output, args=(backend, "🔧 Backend"))
    frontend_thread = threading.Thread(target=print_output, args=(frontend, "🚀 Frontend"))

    backend_thread.start()
    frontend_thread.start()

    try:
        # Manter processo principal rodando
        backend.wait()
        frontend.wait()
    except KeyboardInterrupt:
        print("\n🛑 Encerrando processos...")
        backend.terminate()
        frontend.terminate()

if __name__ == "__main__":
    main()
