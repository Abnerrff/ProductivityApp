from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta

from . import models, schemas, crud
from .database import engine, Base, get_db

app = FastAPI(title="Productivity App Backend")

# Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas as origens em desenvolvimento
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    """Criar tabelas no banco de dados ao iniciar"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Rotas de Eventos
@app.post("/events/", response_model=schemas.Event)
async def create_event(
    event: schemas.EventCreate, 
    db: AsyncSession = Depends(get_db)
):
    """Criar novo evento"""
    # Lógica de criação de evento
    # Por enquanto, apenas um placeholder
    return await crud.crud_event.create(db=db, obj_in=event, model=models.Event)

@app.get("/events/", response_model=List[schemas.Event])
async def read_events(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db)
):
    """Listar eventos, opcionalmente filtrados por data"""
    # Lógica de listagem de eventos
    # Por enquanto, apenas um placeholder
    return await crud.crud_event.get_user_events(
        db=db, 
        user_id=1,  # Substituir pela autenticação real
        start_date=start_date, 
        end_date=end_date
    )

# Rotas de Tarefas (já existentes)
# Rotas de Usuários (autenticação)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
