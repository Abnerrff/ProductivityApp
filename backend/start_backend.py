import os
import subprocess
import sys

def main():
    # Diretório do backend
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(backend_dir)

    # Configurar ambiente virtual
    venv_path = sys.executable  # Usar o Python do ambiente virtual atual

    # Configurar variáveis de ambiente
    env = os.environ.copy()
    env['DATABASE_URL'] = 'sqlite:///./productivity.db'

    try:
        # Executar migrações
        print("🔄 Aplicando migrações do banco de dados...")
        subprocess.run(
            [venv_path, '-m', 'alembic', 'upgrade', 'head'], 
            cwd=backend_dir,
            env=env,
            check=True
        )

        # Iniciar o servidor FastAPI
        print("🚀 Iniciando servidor backend...")
        subprocess.run(
            [venv_path, '-m', 'uvicorn', 'main:app', '--reload', '--host', '0.0.0.0', '--port', '8000'], 
            cwd=backend_dir,
            env=env
        )

    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao iniciar o backend: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
