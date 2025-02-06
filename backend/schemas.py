from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List

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
