from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List, Dict

class UserBase(BaseModel):
    """Schema base para usuário"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr

class UserCreate(UserBase):
    """Schema para criação de usuário"""
    password: str = Field(..., min_length=8)

class User(UserBase):
    """Schema para retorno de usuário"""
    id: int
    is_active: bool

    class Config:
        orm_mode = True

class TaskBase(BaseModel):
    """Schema base para tarefa"""
    title: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = None
    status: str = "pending"
    priority: int = 2

class TaskCreate(TaskBase):
    """Schema para criação de tarefa"""
    pass

class Task(TaskBase):
    """Schema para retorno de tarefa"""
    id: int
    created_at: datetime
    completed_at: Optional[datetime]
    owner_id: int

    class Config:
        orm_mode = True

class EventBase(BaseModel):
    """Schema base para evento"""
    title: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    is_all_day: bool = False

class EventCreate(EventBase):
    """Schema para criação de evento"""
    pass

class Event(EventBase):
    """Schema para retorno de evento"""
    id: int
    owner_id: int

    class Config:
        orm_mode = True

class PomodoroSessionBase(BaseModel):
    project_id: Optional[int] = None
    work_duration: int = Field(..., description="Duração do trabalho em minutos")
    break_duration: int = Field(..., description="Duração do intervalo em minutos")
    status: str = Field(default="completed", description="Status da sessão")
    mode: str = Field(description="Modo atual: work ou break")

class PomodoroSessionCreate(PomodoroSessionBase):
    start_time: Optional[datetime] = None

class PomodoroSessionResponse(PomodoroSessionBase):
    id: int
    user_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    total_work_time: int = 0
    is_completed: bool = False

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "active"

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    total_pomodoro_sessions: int = 0
    total_work_time: int = 0
    start_date: datetime
    end_date: Optional[datetime] = None

class StatisticsBase(BaseModel):
    total_work_time: int = 0
    total_pomodoro_sessions: int = 0
    most_productive_project: Optional[Dict] = None
    daily_productivity: List[Dict] = []
    weekly_productivity: List[Dict] = []
    monthly_productivity: List[Dict] = []

class AchievementBase(BaseModel):
    title: str
    description: str
    achievement_type: str
    total_work_time_required: int = 0
    total_sessions_required: int = 0

class AchievementResponse(AchievementBase):
    id: int
    user_id: int
    achieved_at: datetime
    is_unlocked: bool = False
