# Script para criar repositório no GitHub

# Primeiro, instale o GitHub CLI (gh) se não tiver instalado
# Você pode instalar via winget: winget install --id GitHub.cli

# Fazer login no GitHub
gh auth login

# Criar repositório
gh repo create ProductivityApp --public --source=. --remote=origin --push
