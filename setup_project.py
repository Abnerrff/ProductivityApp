import os
import subprocess
import sys
import shutil

def run_command(command, cwd=None, shell=True):
    """Executar comando no shell"""
    try:
        subprocess.run(
            command, 
            cwd=cwd, 
            shell=shell, 
            check=True
        )
    except subprocess.CalledProcessError as e:
        print(f"Erro ao executar {command}")
        sys.exit(1)

def main():
    # Diretório do projeto
    project_dir = os.path.dirname(os.path.abspath(__file__))
    venv_path = os.path.join(project_dir, 'venv')

    print("🔧 Configurando ambiente do Productivity App")

    # Remover ambiente virtual existente
    if os.path.exists(venv_path):
        shutil.rmtree(venv_path)

    # Criar ambiente virtual
    print("🌐 Criando ambiente virtual...")
    run_command(f'python -m venv "{venv_path}"')

    # Ativar ambiente virtual
    activate_script = os.path.join(venv_path, 'Scripts', 'activate')
    
    # Instalar pip e dependências
    pip_path = os.path.join(venv_path, 'Scripts', 'pip')
    python_path = os.path.join(venv_path, 'Scripts', 'python')

    print("🆙 Atualizando pip...")
    run_command(f'{python_path} -m pip install --upgrade pip')

    # Instalar dependências do backend
    print("📦 Instalando dependências do backend...")
    run_command(f'{pip_path} install -r backend/requirements.txt', project_dir)

    # Instalar dependências do frontend
    print("🌟 Instalando dependências do frontend...")
    run_command('npm install', project_dir)

    print("✅ Ambiente configurado com sucesso!")

if __name__ == "__main__":
    main()
