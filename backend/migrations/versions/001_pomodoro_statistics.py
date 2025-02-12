"""Adicionar tabelas de Pomodoro, Projetos e Conquistas

Revision ID: 001
Revises: 
Create Date: 2025-02-11

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import func

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Tabela de Projetos
    op.create_table(
        'projects',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False, index=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('total_pomodoro_sessions', sa.Integer(), default=0),
        sa.Column('total_work_time', sa.Integer(), default=0),
        sa.Column('start_date', sa.DateTime(), default=func.now()),
        sa.Column('end_date', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(), default='active'),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Tabela de Sessões de Pomodoro
    op.create_table(
        'pomodoro_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('project_id', sa.Integer(), sa.ForeignKey('projects.id'), nullable=True),
        sa.Column('start_time', sa.DateTime(), default=func.now()),
        sa.Column('end_time', sa.DateTime(), nullable=True),
        sa.Column('work_duration', sa.Integer(), nullable=False),
        sa.Column('break_duration', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(), default='completed'),
        sa.Column('mode', sa.String(), nullable=False),
        sa.Column('total_work_time', sa.Integer(), default=0),
        sa.Column('total_break_time', sa.Integer(), default=0),
        sa.Column('is_completed', sa.Boolean(), default=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Tabela de Conquistas
    op.create_table(
        'achievements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=False),
        sa.Column('total_pomodoro_sessions', sa.Integer(), default=0),
        sa.Column('total_work_time', sa.Integer(), default=0),
        sa.Column('achievement_type', sa.String(), nullable=False),
        sa.Column('achieved_at', sa.DateTime(), default=func.now()),
        sa.Column('is_unlocked', sa.Boolean(), default=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Índices para melhorar performance
    op.create_index('idx_pomodoro_sessions_user', 'pomodoro_sessions', ['user_id'])
    op.create_index('idx_pomodoro_sessions_project', 'pomodoro_sessions', ['project_id'])
    op.create_index('idx_achievements_user', 'achievements', ['user_id'])

def downgrade():
    # Remover índices
    op.drop_index('idx_achievements_user', table_name='achievements')
    op.drop_index('idx_pomodoro_sessions_project', table_name='pomodoro_sessions')
    op.drop_index('idx_pomodoro_sessions_user', table_name='pomodoro_sessions')

    # Remover tabelas
    op.drop_table('achievements')
    op.drop_table('pomodoro_sessions')
    op.drop_table('projects')
