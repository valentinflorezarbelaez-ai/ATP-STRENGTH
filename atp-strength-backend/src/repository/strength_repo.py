import datetime

from sqlalchemy.orm import Session

from src.domain.models import ExerciseExecution, ExerciseMax


class StrengthRepository:
    """Repository managing 1RM calculations, Training Maxes, and historical strength telemetry."""

    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def calculate_1rm(weight: float, reps: int, formula: str = "epley") -> float:
        """Physiological 1RM calculation based on peer-reviewed equations."""
        if reps <= 1 or formula == "direct":
            return round(weight, 1)

        if formula == "brzycki":
            denom = 1.0278 - (0.0278 * reps)
            if denom <= 0:
                return round(weight, 1)
            return round(weight / denom, 1)

        # Default: Epley formula
        return round(weight * (1.0 + (reps / 30.0)), 1)

    @staticmethod
    def calculate_phase_prescriptions(training_max: float, step: float = 2.5) -> dict:
        """
        Calculates sequential phase weights rounded to practical plate increments (default 2.5 kg).
        - Phase 1 (Activation): 20% TM
        - Phase 2 (Light Approach): 40% TM
        - Phase 3 (Medium Approach): 60% TM
        - Phase 4 (Heavy PAP): 80% TM
        - Phase 5 (Real Strength / Work Sets): 85% TM
        """
        def round_plate(w: float) -> float:
            if w <= 0:
                return 0.0
            return round(round(w / step) * step, 1)

        return {
            "phase_1_activation": round_plate(training_max * 0.20),
            "phase_2_light": round_plate(training_max * 0.40),
            "phase_3_medium": round_plate(training_max * 0.60),
            "phase_4_pap": round_plate(training_max * 0.80),
            "phase_5_work": round_plate(training_max * 0.85),
        }

    def get_all_maxes(self) -> list[ExerciseMax]:
        return self.db.query(ExerciseMax).order_by(ExerciseMax.exercise_name).all()

    def get_max_by_name(self, exercise_name: str) -> ExerciseMax | None:
        return self.db.query(ExerciseMax).filter(ExerciseMax.exercise_name == exercise_name).first()

    def upsert_max(
        self,
        exercise_name: str,
        lifted_weight: float,
        reps_performed: int,
        formula: str = "epley",
        notes: str | None = None,
    ) -> ExerciseMax:
        one_rep_max = self.calculate_1rm(lifted_weight, reps_performed, formula)
        training_max = round(one_rep_max * 0.90, 1)  # 90% CNS protection margin

        record = self.get_max_by_name(exercise_name)
        if not record:
            record = ExerciseMax(
                exercise_name=exercise_name,
                one_rep_max=one_rep_max,
                training_max=training_max,
                formula=formula,
                lifted_weight=lifted_weight,
                reps_performed=reps_performed,
                notes=notes,
            )
            self.db.add(record)
        else:
            record.one_rep_max = one_rep_max
            record.training_max = training_max
            record.formula = formula
            record.lifted_weight = lifted_weight
            record.reps_performed = reps_performed
            record.notes = notes
            record.updated_at = datetime.datetime.utcnow()

        self.db.commit()
        self.db.refresh(record)
        return record

    def get_history(self, exercise_name: str | None = None, limit: int = 50) -> list[ExerciseExecution]:
        query = self.db.query(ExerciseExecution)
        if exercise_name:
            query = query.filter(ExerciseExecution.exercise_name == exercise_name)
        return query.order_by(ExerciseExecution.timestamp.desc()).limit(limit).all()
