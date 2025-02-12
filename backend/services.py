from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from .models import PomodoroSession, Project, Achievement, User
from .schemas import StatisticsBase, AchievementResponse

class StatisticsService:
    @staticmethod
    def calculate_productivity(db: Session, user_id: int):
        """Calcular estatísticas de produtividade"""
        # Total de tempo trabalhado
        total_work_time = db.query(func.sum(PomodoroSession.total_work_time)).filter(
            PomodoroSession.user_id == user_id
        ).scalar() or 0

        # Total de sessões de Pomodoro
        total_sessions = db.query(func.count(PomodoroSession.id)).filter(
            PomodoroSession.user_id == user_id
        ).scalar() or 0

        # Projeto mais produtivo
        most_productive_project = db.query(
            Project.id, 
            Project.title, 
            func.sum(PomodoroSession.total_work_time).label('total_time')
        ).join(PomodoroSession, Project.id == PomodoroSession.project_id)\
         .filter(PomodoroSession.user_id == user_id)\
         .group_by(Project.id, Project.title)\
         .order_by(func.sum(PomodoroSession.total_work_time).desc())\
         .first()

        # Produtividade diária
        daily_productivity = db.query(
            func.date(PomodoroSession.start_time).label('date'),
            func.sum(PomodoroSession.total_work_time).label('total_time'),
            func.count(PomodoroSession.id).label('total_sessions')
        ).filter(PomodoroSession.user_id == user_id)\
         .group_by(func.date(PomodoroSession.start_time))\
         .order_by('date')\
         .limit(30)\
         .all()

        # Produtividade semanal
        weekly_productivity = db.query(
            extract('year', PomodoroSession.start_time).label('year'),
            extract('week', PomodoroSession.start_time).label('week'),
            func.sum(PomodoroSession.total_work_time).label('total_time'),
            func.count(PomodoroSession.id).label('total_sessions')
        ).filter(PomodoroSession.user_id == user_id)\
         .group_by('year', 'week')\
         .order_by('year', 'week')\
         .limit(12)\
         .all()

        # Produtividade mensal
        monthly_productivity = db.query(
            extract('year', PomodoroSession.start_time).label('year'),
            extract('month', PomodoroSession.start_time).label('month'),
            func.sum(PomodoroSession.total_work_time).label('total_time'),
            func.count(PomodoroSession.id).label('total_sessions')
        ).filter(PomodoroSession.user_id == user_id)\
         .group_by('year', 'month')\
         .order_by('year', 'month')\
         .limit(12)\
         .all()

        return StatisticsBase(
            total_work_time=total_work_time,
            total_pomodoro_sessions=total_sessions,
            most_productive_project={
                'id': most_productive_project[0],
                'title': most_productive_project[1],
                'total_time': most_productive_project[2]
            } if most_productive_project else None,
            daily_productivity=[
                {'date': str(row.date), 'total_time': row.total_time, 'total_sessions': row.total_sessions}
                for row in daily_productivity
            ],
            weekly_productivity=[
                {'year': row.year, 'week': row.week, 'total_time': row.total_time, 'total_sessions': row.total_sessions}
                for row in weekly_productivity
            ],
            monthly_productivity=[
                {'year': row.year, 'month': row.month, 'total_time': row.total_time, 'total_sessions': row.total_sessions}
                for row in monthly_productivity
            ]
        )

class AchievementService:
    @staticmethod
    def check_pomodoro_achievements(db: Session, user_id: int):
        """Verificar e desbloquear conquistas de Pomodoro"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return []

        # Definir conquistas predefinidas
        achievement_rules = [
            {
                'title': 'Iniciante do Pomodoro',
                'description': 'Complete 5 sessões de Pomodoro',
                'achievement_type': 'productivity',
                'total_sessions_required': 5
            },
            {
                'title': 'Produtividade em Progresso',
                'description': 'Complete 25 sessões de Pomodoro',
                'achievement_type': 'productivity',
                'total_sessions_required': 25
            },
            {
                'title': 'Mestre da Produtividade',
                'description': 'Complete 100 sessões de Pomodoro',
                'achievement_type': 'productivity',
                'total_sessions_required': 100
            },
            {
                'title': 'Tempo de Foco',
                'description': 'Acumule 500 minutos de trabalho',
                'achievement_type': 'focus',
                'total_work_time_required': 500
            }
        ]

        unlocked_achievements = []

        # Calcular total de sessões e tempo
        total_sessions = db.query(func.count(PomodoroSession.id)).filter(
            PomodoroSession.user_id == user_id
        ).scalar() or 0

        total_work_time = db.query(func.sum(PomodoroSession.total_work_time)).filter(
            PomodoroSession.user_id == user_id
        ).scalar() or 0

        for rule in achievement_rules:
            achievement = Achievement(
                user_id=user_id,
                title=rule['title'],
                description=rule['description'],
                achievement_type=rule['achievement_type']
            )

            # Verificar condições de desbloqueio
            if (
                (rule.get('total_sessions_required') and total_sessions >= rule['total_sessions_required']) or
                (rule.get('total_work_time_required') and total_work_time >= rule['total_work_time_required'])
            ):
                achievement.is_unlocked = True
                achievement.achieved_at = datetime.utcnow()
                
                # Adicionar à lista de conquistas desbloqueadas
                unlocked_achievements.append(
                    AchievementResponse(
                        id=achievement.id,
                        user_id=achievement.user_id,
                        title=achievement.title,
                        description=achievement.description,
                        achievement_type=achievement.achievement_type,
                        achieved_at=achievement.achieved_at,
                        is_unlocked=True
                    )
                )

                # Salvar conquista no banco de dados
                db.add(achievement)

        db.commit()
        return unlocked_achievements

class PomodoroService:
    @staticmethod
    def start_session(db: Session, user_id: int, project_id: int = None, work_duration: int = 25, break_duration: int = 5):
        """Iniciar nova sessão de Pomodoro"""
        session = PomodoroSession(
            user_id=user_id,
            project_id=project_id,
            work_duration=work_duration,
            break_duration=break_duration,
            start_time=datetime.utcnow(),
            status='running',
            mode='work'
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    @staticmethod
    def complete_session(db: Session, session_id: int, mode: str = 'work', total_time: int = 25):
        """Completar sessão de Pomodoro"""
        session = db.query(PomodoroSession).filter(PomodoroSession.id == session_id).first()
        
        if session:
            session.end_time = datetime.utcnow()
            session.status = 'completed'
            session.mode = mode
            session.total_work_time = total_time * 60  # Converter para segundos
            session.is_completed = True

            # Atualizar projeto, se existir
            if session.project_id:
                project = db.query(Project).filter(Project.id == session.project_id).first()
                if project:
                    project.total_pomodoro_sessions += 1
                    project.total_work_time += total_time

            db.commit()
            db.refresh(session)
            return session
        
        return None

    @staticmethod
    def pause_session(db: Session, session_id: int):
        """Pausar sessão de Pomodoro"""
        session = db.query(PomodoroSession).filter(PomodoroSession.id == session_id).first()
        
        if session:
            session.status = 'paused'
            db.commit()
            db.refresh(session)
            return session
        
        return None

    @staticmethod
    def stop_session(db: Session, session_id: int):
        """Interromper sessão de Pomodoro"""
        session = db.query(PomodoroSession).filter(PomodoroSession.id == session_id).first()
        
        if session:
            session.end_time = datetime.utcnow()
            session.status = 'interrupted'
            session.is_completed = False
            
            db.commit()
            db.refresh(session)
            return session
        
        return None
