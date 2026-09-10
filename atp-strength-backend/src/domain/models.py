"""
Pure Domain Entities for NEURO//STRENGTH ATP Engine.
Clean Architecture Domain Layer - Zero ORM or Framework dependencies.
"""
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


class WorkoutSessionDomain(BaseModel):
    id: int | None = None
    day_key: str = Field(..., description="e.g. DAY_A, DAY_B")
    status: Literal["idle", "active", "completed"] = "idle"
    current_exercise: str | None = None
    current_set: int = 1
    total_sets: int = 1
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class TimerStateDomain(BaseModel):
    id: int | None = None
    is_running: bool = False
    timer_type: str = "atp_resynthesis"
    duration_seconds: int = 180
    remaining_seconds: int = 180
    started_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class ExerciseExecutionDomain(BaseModel):
    id: int | None = None
    session_id: int | None = None
    exercise_name: str
    set_number: int
    prescribed_reps: int
    completed_reps: int | None = None
    load_kg: float = 0.0
    rest_seconds: int = 180
    notes: str | None = None
    rpe: float | None = None
    rir: float | None = None
    e1rm: float | None = None
    completed: bool = False
    timestamp: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class ExerciseMaxDomain(BaseModel):
    id: int | None = None
    exercise_name: str
    one_rep_max: float
    training_max: float
    formula: str = "epley"
    lifted_weight: float = 0.0
    reps_performed: int = 1
    notes: str | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
