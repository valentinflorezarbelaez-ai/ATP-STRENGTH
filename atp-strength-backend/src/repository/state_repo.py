import datetime

from sqlalchemy.orm import Session

from src.domain.models import ExerciseExecution, TimerState, WorkoutSession


class StateRepository:
    """Repository responsible exclusively for persistence operations regarding state and telemetry."""

    def __init__(self, db: Session):
        self.db = db

    def get_or_create_timer_state(self) -> TimerState:
        timer = self.db.query(TimerState).first()
        if not timer:
            timer = TimerState(
                is_running=False,
                timer_type="atp_resynthesis",
                duration_seconds=180,
                remaining_seconds=180,
                started_at=None,
            )
            self.db.add(timer)
            self.db.commit()
            self.db.refresh(timer)
        return timer

    def update_timer_state(
        self,
        is_running: bool,
        remaining_seconds: int,
        timer_type: str | None = None,
        duration_seconds: int | None = None,
    ) -> TimerState:
        timer = self.get_or_create_timer_state()
        timer.is_running = is_running
        timer.remaining_seconds = remaining_seconds
        if timer_type is not None:
            timer.timer_type = timer_type
        if duration_seconds is not None:
            timer.duration_seconds = duration_seconds
        if is_running and timer.started_at is None:
            timer.started_at = datetime.datetime.utcnow()
        elif not is_running:
            timer.started_at = None
        self.db.commit()
        self.db.refresh(timer)
        return timer

    def get_active_session(self) -> WorkoutSession | None:
        return (
            self.db.query(WorkoutSession)
            .filter(WorkoutSession.status == "active")
            .order_by(WorkoutSession.updated_at.desc())
            .first()
        )

    def create_or_update_session(
        self,
        day_key: str,
        status: str = "active",
        current_exercise: str | None = None,
        current_set: int = 1,
        total_sets: int = 1,
    ) -> WorkoutSession:
        session = self.get_active_session()
        if not session:
            session = WorkoutSession(
                day_key=day_key,
                status=status,
                current_exercise=current_exercise,
                current_set=current_set,
                total_sets=total_sets,
            )
            self.db.add(session)
        else:
            session.day_key = day_key
            session.status = status
            session.current_exercise = current_exercise
            session.current_set = current_set
            session.total_sets = total_sets

        self.db.commit()
        self.db.refresh(session)
        return session

    def log_exercise_execution(
        self,
        exercise_name: str,
        set_number: int,
        prescribed_reps: int,
        load_kg: float,
        rest_seconds: int,
        completed_reps: int | None = None,
        session_id: int | None = None,
        notes: str | None = None,
    ) -> ExerciseExecution:
        execution = ExerciseExecution(
            session_id=session_id,
            exercise_name=exercise_name,
            set_number=set_number,
            prescribed_reps=prescribed_reps,
            completed_reps=completed_reps if completed_reps is not None else prescribed_reps,
            load_kg=load_kg,
            rest_seconds=rest_seconds,
            notes=notes,
            completed=True,
        )
        self.db.add(execution)
        self.db.commit()
        self.db.refresh(execution)
        return execution
