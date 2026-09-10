"""
Clean Architecture Invariant Verification.
Guards the purity of the Domain layer against infrastructure leakage.
"""
import inspect
import src.domain.models as domain_models


def test_domain_layer_purity():
    """Verify that domain models have zero dependencies on SQLAlchemy or ORM frameworks."""
    source = inspect.getsource(domain_models)
    assert "sqlalchemy" not in source.lower(), "Domain layer must have zero SQLAlchemy dependencies"
    assert "Base" not in domain_models.__dict__, "Domain layer must not import ORM Base"
    assert hasattr(domain_models, "WorkoutSessionDomain")
    assert hasattr(domain_models, "TimerStateDomain")
    assert hasattr(domain_models, "ExerciseExecutionDomain")
    assert hasattr(domain_models, "ExerciseMaxDomain")
