from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete
from .models import User, Task, Event
from .schemas import UserCreate, TaskCreate, EventCreate
from datetime import datetime

class CRUDBase:
    """Operações CRUD base"""
    @staticmethod
    async def create(db: AsyncSession, obj_in, model):
        """Criar novo registro"""
        db_obj = model(**obj_in.dict())
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    @staticmethod
    async def get_by_id(db: AsyncSession, model, obj_id):
        """Obter registro por ID"""
        result = await db.execute(select(model).filter(model.id == obj_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def update(db: AsyncSession, model, obj_id, obj_in):
        """Atualizar registro"""
        stmt = (
            update(model)
            .where(model.id == obj_id)
            .values(**obj_in.dict(exclude_unset=True))
        )
        result = await db.execute(stmt)
        await db.commit()
        return result

    @staticmethod
    async def delete(db: AsyncSession, model, obj_id):
        """Deletar registro"""
        stmt = delete(model).where(model.id == obj_id)
        result = await db.execute(stmt)
        await db.commit()
        return result

class CRUDUser(CRUDBase):
    """Operações CRUD para usuários"""
    @staticmethod
    async def get_by_email(db: AsyncSession, email: str):
        """Obter usuário por email"""
        result = await db.execute(select(User).filter(User.email == email))
        return result.scalar_one_or_none()

class CRUDTask(CRUDBase):
    """Operações CRUD para tarefas"""
    @staticmethod
    async def get_user_tasks(db: AsyncSession, user_id: int):
        """Obter tarefas de um usuário"""
        result = await db.execute(select(Task).filter(Task.owner_id == user_id))
        return result.scalars().all()

    @staticmethod
    async def complete_task(db: AsyncSession, task_id: int):
        """Marcar tarefa como concluída"""
        stmt = (
            update(Task)
            .where(Task.id == task_id)
            .values(status="completed", completed_at=datetime.utcnow())
        )
        result = await db.execute(stmt)
        await db.commit()
        return result

class CRUDEvent(CRUDBase):
    """Operações CRUD para eventos"""
    @staticmethod
    async def get_user_events(db: AsyncSession, user_id: int, start_date: datetime = None, end_date: datetime = None):
        """Obter eventos de um usuário, opcionalmente filtrados por data"""
        query = select(Event).filter(Event.owner_id == user_id)
        
        if start_date:
            query = query.filter(Event.start_time >= start_date)
        
        if end_date:
            query = query.filter(Event.end_time <= end_date)
        
        result = await db.execute(query)
        return result.scalars().all()

# Instâncias para uso
crud_user = CRUDUser()
crud_task = CRUDTask()
crud_event = CRUDEvent()
