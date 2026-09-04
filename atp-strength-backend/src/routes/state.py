from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from src.config.database import get_db
from src.repository.state_repo import StateRepository

router = APIRouter(prefix="/api/state", tags=["State & Telemetry"])


# ---------------- Pydantic Schemas ---------------- #

class TimerResponse(BaseModel):
    id: int
    is_running: bool
    timer_type: str
    duration_seconds: int
    remaining_seconds: int

    class Config:
        from_attributes = True


class UpdateTimerRequest(BaseModel):
    is_running: bool
    remaining_seconds: int
    timer_type: str | None = "atp_resynthesis"
    duration_seconds: int | None = 180


class SessionResponse(BaseModel):
    id: int
    day_key: str
    status: str
    current_exercise: str | None = None
    current_set: int
    total_sets: int

    class Config:
        from_attributes = True


class UpdateSessionRequest(BaseModel):
    day_key: str = Field(..., example="DAY_A")
    status: str = Field("active", example="active")
    current_exercise: str | None = None
    current_set: int = Field(1, ge=1)
    total_sets: int = Field(1, ge=1)


class LogSetRequest(BaseModel):
    exercise_name: str
    set_number: int
    prescribed_reps: int
    load_kg: float
    rest_seconds: int = 180
    completed_reps: int | None = None
    session_id: int | None = None
    notes: str | None = None


class ExecutionResponse(BaseModel):
    id: int
    exercise_name: str
    set_number: int
    load_kg: float
    completed_reps: int | None
    completed: bool

    class Config:
        from_attributes = True


# ---------------- Route Endpoints ---------------- #

@router.get("/timer", response_model=TimerResponse)
def get_timer(db: Session = Depends(get_db)):
    repo = StateRepository(db)
    return repo.get_or_create_timer_state()


@router.post("/timer", response_model=TimerResponse)
def update_timer(request: UpdateTimerRequest, db: Session = Depends(get_db)):
    repo = StateRepository(db)
    return repo.update_timer_state(
        is_running=request.is_running,
        remaining_seconds=request.remaining_seconds,
        timer_type=request.timer_type,
        duration_seconds=request.duration_seconds,
    )


@router.get("/session", response_model=SessionResponse | None)
def get_session(db: Session = Depends(get_db)):
    repo = StateRepository(db)
    session = repo.get_active_session()
    return session


@router.post("/session", response_model=SessionResponse)
def update_session(request: UpdateSessionRequest, db: Session = Depends(get_db)):
    repo = StateRepository(db)
    return repo.create_or_update_session(
        day_key=request.day_key,
        status=request.status,
        current_exercise=request.current_exercise,
        current_set=request.current_set,
        total_sets=request.total_sets,
    )


@router.post("/log-set", response_model=ExecutionResponse)
def log_set(request: LogSetRequest, db: Session = Depends(get_db)):
    repo = StateRepository(db)
    return repo.log_exercise_execution(
        exercise_name=request.exercise_name,
        set_number=request.set_number,
        prescribed_reps=request.prescribed_reps,
        load_kg=request.load_kg,
        rest_seconds=request.rest_seconds,
        completed_reps=request.completed_reps,
        session_id=request.session_id,
        notes=request.notes,
    )
