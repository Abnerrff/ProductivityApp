# Productivity App

## Descrição
Aplicativo de produtividade com timer Pomodoro, gerenciamento de projetos e sistema de conquistas.

## Requisitos
- Python 3.9+
- Node.js 16+
- pip
- npm

## Configuração do Ambiente

### Backend
1. Criar ambiente virtual:
```bash
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
```

2. Instalar dependências:
```bash
pip install -r backend/requirements.txt
```

3. Configurar banco de dados:
```bash
cd backend
alembic upgrade head
```

### Frontend
```bash
npm install
```

## Executando o Projeto

### Método Automático
```bash
python start_project.py
```

### Método Manual

1. Iniciar Backend:
```bash
cd backend
python run_server.py
```

2. Iniciar Frontend:
```bash
npm run dev
```

## Recursos
- Timer Pomodoro
- Gerenciamento de Projetos
- Sistema de Conquistas
- Estatísticas de Produtividade

## Tecnologias
- Backend: FastAPI, SQLAlchemy
- Frontend: Vue.js
- Banco de Dados: SQLite

## Contribuição
1. Faça fork do projeto
2. Crie sua branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adicionar nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença
MIT License
