from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
from .routes import router
from .models import User, Project, PomodoroSession, Achievement
from .auth import create_access_token, get_current_user

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Productivity App Backend",
    description="Backend para aplicativo de produtividade com Pomodoro",
    version="0.2.0"
)

# Configurações de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas as origens em desenvolvimento
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rotas
app.include_router(router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "app_name": "Productivity App",
        "version": "0.2.0",
        "status": "running",
        "features": [
            "Pomodoro Timer",
            "Project Tracking",
            "Achievement System",
            "Productivity Statistics"
        ]
    }

# Endpoints de inicialização e setup
@app.post("/setup")
def setup_initial_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Configuração inicial de dados para o usuário
    - Cria projetos padrão
    - Configura conquistas iniciais
    """
    # Verificar se usuário já tem projetos
    existing_projects = db.query(Project).filter(Project.user_id == current_user.id).count()
    
    if existing_projects == 0:
        # Criar projetos padrão
        default_projects = [
            Project(
                title="Desenvolvimento Pessoal", 
                description="Projeto para aprendizado e crescimento",
                user_id=current_user.id
            ),
            Project(
                title="Trabalho", 
                description="Projeto profissional",
                user_id=current_user.id
            )
        ]
        
        db.add_all(default_projects)
        db.commit()
    
    # Configurar conquistas iniciais
    achievements = [
        Achievement(
            user_id=current_user.id,
            title="Bem-vindo ao Pomodoro",
            description="Complete sua primeira sessão de Pomodoro",
            achievement_type="onboarding",
            total_sessions_required=1
        )
    ]
    
    db.add_all(achievements)
    db.commit()
    
    return {"message": "Dados iniciais configurados com sucesso"}

# Endpoint de estatísticas gerais
@app.get("/dashboard")
def get_dashboard_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Recupera dados gerais para o dashboard
    - Total de projetos
    - Total de sessões Pomodoro
    - Tempo total trabalhado
    - Conquistas desbloqueadas
    """
    total_projects = db.query(Project).filter(Project.user_id == current_user.id).count()
    total_sessions = db.query(PomodoroSession).filter(PomodoroSession.user_id == current_user.id).count()
    total_work_time = db.query(PomodoroSession.total_work_time).filter(PomodoroSession.user_id == current_user.id).sum() or 0
    total_achievements = db.query(Achievement).filter(
        Achievement.user_id == current_user.id, 
        Achievement.is_unlocked == True
    ).count()
    
    return {
        "total_projects": total_projects,
        "total_pomodoro_sessions": total_sessions,
        "total_work_time_minutes": total_work_time // 60,  # Converter segundos para minutos
        "total_achievements": total_achievements
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
