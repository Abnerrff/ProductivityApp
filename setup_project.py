import os
import subprocess
import sys
import venv

def run_command(command, cwd=None):
    """Executar comando no shell"""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            cwd=cwd, 
            capture_output=True, 
            text=True, 
            check=True
        )
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Erro ao executar {command}:")
        print(e.stderr)
        sys.exit(1)

def main():
    # Diretório do projeto
    project_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(project_dir, 'backend')

    print("🔧 Configurando ambiente do Productivity App")

    # Verificar Python
    print("🐍 Verificando Python...")
    run_command("python --version")

    # Criar ambiente virtual
    print("🌐 Criando ambiente virtual...")
    venv_path = os.path.join(project_dir, 'venv')
    venv.create(venv_path, with_pip=True)

    # Ativar ambiente virtual
    activate_this = os.path.join(venv_path, 'Scripts', 'activate_this.py')
    exec(open(activate_this).read(), {'__file__': activate_this})

    # Atualizar pip
    print("🆙 Atualizando pip...")
    run_command("python -m pip install --upgrade pip")

    # Instalar dependências do backend
    print("📦 Instalando dependências do backend...")
    run_command("pip install -r backend/requirements.txt", project_dir)

    # Instalar dependências do frontend
    print("🌟 Instalando dependências do frontend...")
    run_command("npm install", project_dir)

    print("✅ Ambiente configurado com sucesso!")

if __name__ == "__main__":
    main()
