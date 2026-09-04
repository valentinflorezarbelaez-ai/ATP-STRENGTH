
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from src.config.database import get_db
from src.repository.strength_repo import StrengthRepository

router = APIRouter(prefix="/api/strength", tags=["Strength & Progression"])


# ---------------- Pydantic Schemas ---------------- #

class PhasePrescriptionSchema(BaseModel):
    phase_1_activation: float
    phase_2_light: float
    phase_3_medium: float
    phase_4_pap: float
    phase_5_work: float


class ExerciseMaxResponse(BaseModel):
    id: int
    exercise_name: str
    one_rep_max: float
    training_max: float
    formula: str
    lifted_weight: float
    reps_performed: int
    notes: str | None
    prescriptions: PhasePrescriptionSchema

    class Config:
        from_attributes = True


class UpsertMaxRequest(BaseModel):
    exercise_name: str = Field(..., example="Sentadilla Trasera")
    lifted_weight: float = Field(..., gt=0, example=120.0)
    reps_performed: int = Field(..., ge=1, le=30, example=5)
    formula: str = Field("epley", example="epley")  # epley, brzycki, direct
    notes: str | None = Field(None, example="Sensación sólida con cinto")


class ExecutionHistoryItem(BaseModel):
    id: int
    exercise_name: str
    set_number: int
    prescribed_reps: int
    completed_reps: int | None
    load_kg: float
    rest_seconds: int
    notes: str | None
    completed: bool

    class Config:
        from_attributes = True


# ---------------- Endpoints ---------------- #

@router.get("/maxes", response_model=list[ExerciseMaxResponse])
def get_all_maxes(db: Session = Depends(get_db)):
    repo = StrengthRepository(db)
    records = repo.get_all_maxes()
    results = []
    for r in records:
        presc = repo.calculate_phase_prescriptions(r.training_max)
        results.append(
            ExerciseMaxResponse(
                id=r.id,
                exercise_name=r.exercise_name,
                one_rep_max=r.one_rep_max,
                training_max=r.training_max,
                formula=r.formula,
                lifted_weight=r.lifted_weight,
                reps_performed=r.reps_performed,
                notes=r.notes,
                prescriptions=PhasePrescriptionSchema(**presc),
            )
        )
    return results


@router.post("/maxes", response_model=ExerciseMaxResponse)
def upsert_max(request: UpsertMaxRequest, db: Session = Depends(get_db)):
    repo = StrengthRepository(db)
    record = repo.upsert_max(
        exercise_name=request.exercise_name,
        lifted_weight=request.lifted_weight,
        reps_performed=request.reps_performed,
        formula=request.formula,
        notes=request.notes,
    )
    presc = repo.calculate_phase_prescriptions(record.training_max)
    return ExerciseMaxResponse(
        id=record.id,
        exercise_name=record.exercise_name,
        one_rep_max=record.one_rep_max,
        training_max=record.training_max,
        formula=record.formula,
        lifted_weight=record.lifted_weight,
        reps_performed=record.reps_performed,
        notes=record.notes,
        prescriptions=PhasePrescriptionSchema(**presc),
    )


@router.get("/history", response_model=list[ExecutionHistoryItem])
def get_history(exercise_name: str | None = None, limit: int = 50, db: Session = Depends(get_db)):
    repo = StrengthRepository(db)
    return repo.get_history(exercise_name=exercise_name, limit=limit)
