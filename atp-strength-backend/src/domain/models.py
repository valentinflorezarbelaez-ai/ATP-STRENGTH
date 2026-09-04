import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text

from src.config.database import Base


class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id = Column(Integer, primary_key=True, index=True)
    day_key = Column(String(10), nullable=False)  # e.g., 'DAY_A', 'DAY_B'
    status = Column(String(50), default="idle", nullable=False)  # idle, active, completed
    current_exercise = Column(String(100), nullable=True)
    current_set = Column(Integer, default=1, nullable=False)
    total_sets = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
        nullable=False
    )


class TimerState(Base):
    __tablename__ = "timer_states"

    id = Column(Integer, primary_key=True, index=True)
    is_running = Column(Boolean, default=False, nullable=False)
    timer_type = Column(String(50), default="atp_resynthesis", nullable=False)  # atp_resynthesis, mobility, prep
    duration_seconds = Column(Integer, default=180, nullable=False)
    remaining_seconds = Column(Integer, default=180, nullable=False)
    started_at = Column(DateTime, nullable=True)
    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
        nullable=False
    )


class ExerciseExecution(Base):
    __tablename__ = "exercise_executions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, nullable=True, index=True)
    exercise_name = Column(String(150), nullable=False)
    set_number = Column(Integer, nullable=False)
    prescribed_reps = Column(Integer, nullable=False)
    completed_reps = Column(Integer, nullable=True)
    load_kg = Column(Float, nullable=False, default=0.0)
    rest_seconds = Column(Integer, default=180, nullable=False)
    notes = Column(Text, nullable=True)
    completed = Column(Boolean, default=False, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)


class ExerciseMax(Base):
    __tablename__ = "exercise_maxes"

    id = Column(Integer, primary_key=True, index=True)
    exercise_name = Column(String(150), unique=True, index=True, nullable=False)
    one_rep_max = Column(Float, nullable=False, default=0.0)
    training_max = Column(Float, nullable=False, default=0.0)  # 90% of 1RM
    formula = Column(String(50), default="epley", nullable=False)  # epley, brzycki, direct
    lifted_weight = Column(Float, default=0.0, nullable=False)
    reps_performed = Column(Integer, default=1, nullable=False)
    notes = Column(Text, nullable=True)
    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
        nullable=False
    )

