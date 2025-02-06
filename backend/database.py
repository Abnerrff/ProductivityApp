from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool

# Configuração do banco de dados SQLite
DATABASE_URL = "sqlite+aiosqlite:///./productivity_app.db"

# Criação do engine assíncrono
engine = create_async_engine(
    DATABASE_URL, 
    echo=True,  # Mostra as queries SQL
    poolclass=NullPool  # Evita problemas de concorrência
)

# Criação do SessionLocal para gerenciar sessões
SessionLocal = async_sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

# Base para os modelos
Base = declarative_base()

async def get_db():
    """Dependency para obter sessão de banco de dados"""
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
