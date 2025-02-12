from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool

# Configuração do banco de dados SQLite
DATABASE_URL = "sqlite:///./productivity.db"

# Criação do engine síncrono
engine = create_engine(
    DATABASE_URL, 
    echo=True,  # Mostra as queries SQL
    poolclass=NullPool  # Evita problemas de concorrência
)

# Criação do SessionLocal para gerenciar sessões
SessionLocal = sessionmaker(
    bind=engine, 
    autocommit=False, 
    autoflush=False
)

# Base para os modelos
Base = declarative_base()

def get_db():
    """Dependency para obter sessão de banco de dados"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
