# Definir diretório do projeto
Set-Location -Path "C:\Users\abner\CascadeProjects\ProductivityApp"

# Adicionar todas as mudanças
git add .

# Criar commit com timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Versão com TaskManager, ProjectTracker e Pomodoro - $timestamp"

# Fazer push
git push origin main

# Abrir repositório no GitHub
Start-Process "https://github.com/Abnerrff/ProductivityApp"

# Mostrar status final
git status
