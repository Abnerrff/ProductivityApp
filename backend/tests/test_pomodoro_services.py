import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta

from models import Base, User, PomodoroSession, Project
from services import PomodoroService, StatisticsService, AchievementService

# Configuração de banco de dados de teste
TEST_DATABASE_URL = "sqlite:///./test_productivity.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()

@pytest.fixture(scope="module")
def test_user(db):
    user = User(username="testuser", email="test@example.com")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture(scope="module")
def test_project(db, test_user):
    project = Project(
        title="Test Project", 
        user_id=test_user.id,
        description="A project for testing"
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

def test_start_pomodoro_session(db, test_user, test_project):
    session = PomodoroService.start_session(
        db, 
        user_id=test_user.id, 
        project_id=test_project.id
    )
    
    assert session is not None
    assert session.user_id == test_user.id
    assert session.project_id == test_project.id
    assert session.status == 'running'

def test_complete_pomodoro_session(db, test_user, test_project):
    session = PomodoroService.start_session(
        db, 
        user_id=test_user.id, 
        project_id=test_project.id
    )
    
    completed_session = PomodoroService.complete_session(
        db, 
        session_id=session.id, 
        mode='work', 
        total_time=25
    )
    
    assert completed_session is not None
    assert completed_session.status == 'completed'
    assert completed_session.is_completed == True
    assert completed_session.total_work_time == 1500  # 25 minutos em segundos

def test_calculate_productivity(db, test_user):
    # Criar múltiplas sessões de Pomodoro
    for _ in range(5):
        session = PomodoroService.start_session(db, user_id=test_user.id)
        PomodoroService.complete_session(db, session_id=session.id, total_time=25)
    
    statistics = StatisticsService.calculate_productivity(db, test_user.id)
    
    assert statistics.total_pomodoro_sessions == 5
    assert statistics.total_work_time == 125  # 5 * 25 minutos

def test_check_pomodoro_achievements(db, test_user):
    # Criar múltiplas sessões para desbloquear conquistas
    for _ in range(10):
        session = PomodoroService.start_session(db, user_id=test_user.id)
        PomodoroService.complete_session(db, session_id=session.id, total_time=25)
    
    achievements = AchievementService.check_pomodoro_achievements(db, test_user.id)
    
    assert len(achievements) > 0
    assert any(achievement.title == 'Iniciante do Pomodoro' for achievement in achievements)

def test_pause_pomodoro_session(db, test_user, test_project):
    session = PomodoroService.start_session(
        db, 
        user_id=test_user.id, 
        project_id=test_project.id
    )
    
    paused_session = PomodoroService.pause_session(db, session_id=session.id)
    
    assert paused_session is not None
    assert paused_session.status == 'paused'

def test_stop_pomodoro_session(db, test_user, test_project):
    session = PomodoroService.start_session(
        db, 
        user_id=test_user.id, 
        project_id=test_project.id
    )
    
    stopped_session = PomodoroService.stop_session(db, session_id=session.id)
    
    assert stopped_session is not None
    assert stopped_session.status == 'interrupted'
    assert stopped_session.is_completed == False
