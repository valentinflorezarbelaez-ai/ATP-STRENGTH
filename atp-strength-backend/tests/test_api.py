"""
SPEC-0004: Automated Tests for Backend API & Telemetry Persistence
Run: pytest tests/test_api.py -v
"""
import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Ensure SQLite memory database for isolated testing
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from main import app
from src.config.database import Base, get_db

# Isolated test database in memory
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def test_health_check():
    """Verify backend health endpoint returns healthy status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "atp-strength-backend"


def test_root_endpoint():
    """Verify root endpoint returns welcome message."""
    response = client.get("/")
    assert response.status_code == 200
    assert "active" in response.json()["message"]


def test_log_set_with_neuromuscular_telemetry():
    """
    REQ-EARS-SYNC-01: Ingestion of logged set with RPE, RIR, and e1RM
    Verifies that all telemetry fields are accepted and persisted.
    """
    payload = {
        "exercise_name": "Sentadilla Trasera",
        "set_number": 2,
        "prescribed_reps": 3,
        "completed_reps": 3,
        "load_kg": 140.0,
        "rest_seconds": 240,
        "notes": "RPE 9.5 • Heavy effort",
        "rpe": 9.5,
        "rir": 0.5,
        "e1rm": 154.4,
    }
    response = client.post("/api/state/log-set", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["exercise_name"] == "Sentadilla Trasera"
    assert data["set_number"] == 2
    assert data["load_kg"] == 140.0
    assert data["completed_reps"] == 3
    assert data["completed"] is True
    assert data["rpe"] == 9.5
    assert data["rir"] == 0.5
    assert data["e1rm"] == 154.4


def test_timer_lifecycle():
    """Verify timer state retrieval and update."""
    # Get default timer
    get_res = client.get("/api/state/timer")
    assert get_res.status_code == 200
    timer_data = get_res.json()
    assert timer_data["duration_seconds"] == 180

    # Update timer state
    update_payload = {
        "is_running": True,
        "remaining_seconds": 120,
        "duration_seconds": 180,
        "timer_type": "atp_resynthesis",
    }
    put_res = client.put("/api/state/timer", json=update_payload)
    assert put_res.status_code == 200
    updated = put_res.json()
    assert updated["is_running"] is True
    assert updated["remaining_seconds"] == 120


def test_exercise_maxes_with_rpe_formula():
    """Verify saving 1RM with 'rpe' formula."""
    payload = {
        "exercise_name": "Press de Banca",
        "lifted_weight": 100.0,
        "reps_performed": 3,
        "formula": "rpe",
        "notes": "Calibrado RPE 9.0",
    }
    post_res = client.post("/api/strength/maxes", json=payload)
    assert post_res.status_code == 200
    data = post_res.json()
    assert data["exercise_name"] == "Press de Banca"
    assert data["formula"] == "rpe"
    assert data["lifted_weight"] == 100.0
