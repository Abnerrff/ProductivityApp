import os
import subprocess
import sys
import threading
import time

def run_migrations():
    """Executar migrações do banco de dados"""
    print("🔄 Aplicando migrações do banco de dados...")
    migration_process = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"], 
        cwd="./backend", 
        capture_output=True, 
        text=True
    )
    
    if migration_process.returncode == 0:
        print("✅ Migrações aplicadas com sucesso!")
    else:
        print("❌ Erro ao aplicar migrações:")
        print(migration_process.stderr)

def start_backend_server():
    """Iniciar servidor FastAPI"""
    print("🚀 Iniciando servidor backend...")
    server_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
        cwd="./backend",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Capturar e imprimir saída do servidor
    def print_output(pipe):
        for line in pipe:
            print(line.strip())
    
    threading.Thread(target=print_output, args=(server_process.stdout,), daemon=True).start()
    threading.Thread(target=print_output, args=(server_process.stderr,), daemon=True).start()
    
    return server_process

def main():
    # Configurar variáveis de ambiente
    os.environ['DATABASE_URL'] = 'sqlite:///./productivity.db'
    
    # Executar migrações
    run_migrations()
    
    # Iniciar servidor
    server = start_backend_server()
    
    try:
        # Manter o processo principal rodando
        server.wait()
    except KeyboardInterrupt:
        print("\n🛑 Encerrando servidor...")
        server.terminate()

if __name__ == "__main__":
    main()
