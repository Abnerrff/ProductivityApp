from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base  

class User(Base):
    """Modelo de usuário"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    
    tasks = relationship("Task", back_populates="owner")
    events = relationship("Event", back_populates="owner")
    pomodoro_sessions = relationship("PomodoroSession", back_populates="user")
    projects = relationship("Project", back_populates="user")
    achievements = relationship("Achievement", back_populates="user")

class Task(Base):
    """Modelo de tarefa"""
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    status = Column(String, default="pending")
    priority = Column(Integer, default=2)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    
    owner = relationship("User", back_populates="tasks")
    project = relationship("Project", back_populates="tasks")

class Event(Base):
    """Modelo de evento para agenda"""
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    location = Column(String, nullable=True)
    is_all_day = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="events")

class PomodoroSession(Base):
    """Modelo para sessões de Pomodoro"""
    __tablename__ = "pomodoro_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    
    work_duration = Column(Integer)  
    break_duration = Column(Integer)  
    
    status = Column(String, default="completed")  
    mode = Column(String)  
    
    total_work_time = Column(Integer, default=0)  
    total_break_time = Column(Integer, default=0)  
    
    is_completed = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="pomodoro_sessions")
    project = relationship("Project", back_populates="pomodoro_sessions")

class Project(Base):
    """Modelo de Projeto com métricas de produtividade"""
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    
    total_pomodoro_sessions = Column(Integer, default=0)
    total_work_time = Column(Integer, default=0)  
    
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    status = Column(String, default="active")  
    
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="projects")
    
    pomodoro_sessions = relationship("PomodoroSession", back_populates="project")
    tasks = relationship("Task", back_populates="project")

class Achievement(Base):
    """Modelo de Conquistas baseadas em Pomodoro"""
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    description = Column(String)
    
    total_pomodoro_sessions = Column(Integer, default=0)
    total_work_time = Column(Integer, default=0)  
    
    achievement_type = Column(String)  
    
    achieved_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="achievements")
