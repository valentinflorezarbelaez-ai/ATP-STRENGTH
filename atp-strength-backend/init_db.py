import sys
import os

# Add directory to sys.path so it can find src
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.config.database import Base, engine
from src.domain.models import WorkoutSession, TimerState, ExerciseExecution, ExerciseMax

def init_db():
    print("🔄 Conectando a PostgreSQL e inicializando tablas...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tablas creadas/verificadas exitosamente en la base de datos:")
        for table in Base.metadata.tables.keys():
            print(f"  - 📋 {table}")
    except Exception as exc:
        print("❌ Error de conexión o autenticación:")
        print(f"   {exc}")
        print("\n💡 Sugerencia: Verificá la variable DATABASE_URL en atp-strength-backend/.env")
        print("   Asegurate de que el usuario, contraseña, puerto (5433) y nombre de base de datos coincidan con tu PostgreSQL local.")
        sys.exit(1)

if __name__ == "__main__":
    init_db()
