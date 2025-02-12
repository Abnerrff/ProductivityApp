from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .database import get_db
from .services import StatisticsService, AchievementService, PomodoroService
from .schemas import (
    PomodoroSessionCreate, 
    PomodoroSessionResponse, 
    StatisticsBase, 
    AchievementResponse
)
from .auth import get_current_user

router = APIRouter()

@router.post("/pomodoro/session", response_model=PomodoroSessionResponse)
def create_pomodoro_session(
    session_data: PomodoroSessionCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Criar nova sessão de Pomodoro"""
    session = PomodoroService.start_session(
        db, 
        user_id=current_user.id, 
        project_id=session_data.project_id,
        work_duration=session_data.work_duration,
        break_duration=session_data.break_duration
    )
    return session

@router.patch("/pomodoro/session/{session_id}/complete")
def complete_pomodoro_session(
    session_id: int, 
    mode: str = 'work', 
    total_time: int = 25,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Completar sessão de Pomodoro"""
    session = PomodoroService.complete_session(
        db, 
        session_id=session_id, 
        mode=mode, 
        total_time=total_time
    )
    
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    return session

@router.patch("/pomodoro/session/{session_id}/pause")
def pause_pomodoro_session(
    session_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Pausar sessão de Pomodoro"""
    session = PomodoroService.pause_session(db, session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    return session

@router.patch("/pomodoro/session/{session_id}/stop")
def stop_pomodoro_session(
    session_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Interromper sessão de Pomodoro"""
    session = PomodoroService.stop_session(db, session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    return session

@router.get("/statistics", response_model=StatisticsBase)
def get_user_statistics(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Obter estatísticas de produtividade do usuário"""
    statistics = StatisticsService.calculate_productivity(db, current_user.id)
    return statistics

@router.post("/achievements/check-pomodoro", response_model=List[AchievementResponse])
def check_pomodoro_achievements(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Verificar e desbloquear conquistas de Pomodoro"""
    achievements = AchievementService.check_pomodoro_achievements(db, current_user.id)
    return achievements

@router.get("/achievements", response_model=List[AchievementResponse])
def get_user_achievements(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Obter todas as conquistas do usuário"""
    achievements = db.query(Achievement).filter(
        Achievement.user_id == current_user.id,
        Achievement.is_unlocked == True
    ).all()
    
    return [
        AchievementResponse(
            id=achievement.id,
            user_id=achievement.user_id,
            title=achievement.title,
            description=achievement.description,
            achievement_type=achievement.achievement_type,
            achieved_at=achievement.achieved_at,
            is_unlocked=True
        ) for achievement in achievements
    ]
