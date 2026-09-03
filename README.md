# NEURO//STRENGTH (ATP-STRENGTH)

> Motor de Autoconfiguración y Guía Zen de Ejecución para Fuerza Máxima, Potencia y Densidad Muscular Magra.

---

## 🏗️ Arquitectura del Sistema

```text
APP fuerza/                       # Directorio raíz limpio
│
├── 📂 atp-strength-frontend/     # ⚛️ FRONTEND: NEXT.JS (React + TS + Tailwind)
│   ├── .env.local                # Variable para apuntar a la API de Python (http://localhost:8000)
│   ├── package.json              # Módulo de control de Next.js
│   ├── tsconfig.json             # Tipados estrictos de TypeScript
│   └── 📂 src/
│       └── 📂 app/               # Next.js App Router (Pantallas Zen y lógicas)
│
└── 📂 atp-strength-backend/      # 🐍 BACKEND: PYTHON (FastAPI + SQLAlchemy)
    ├── .env                      # Cadena de conexión a PostgreSQL (Puerto 5433)
    ├── main.py                   # Orquestador: Enciende FastAPI y habilita CORS
    └── 📂 src/
        ├── config/               # database.py (Tubería de datos y sesiones)
        ├── domain/               # models.py (Definición matemática de las tablas)
        ├── repository/           # state_repo.py (El único que lee/escribe en la BD)
        └── routes/               # state.py (Endpoints de red para el cronómetro/estado)
```

---

## ⚡ Características Principales

- **Itinerario Fijo de 4 Días (Élite)**:
  - **Lunes (Día A - Empuje/Cuádriceps)**: Sentadilla Trasera (5x3) | Press de Banca (5x3) | Press Militar (4x3) | Fondos en Paralelas (3x5).
  - **Martes (Día B - Tracción/Cadena Posterior)**: Peso Muerto Convencional (2x3) | Dominadas Lastradas (4x4) | Remo Pendlay (3x5) | Peso Muerto Rumano (3x5).
  - **Jueves (Día C - Empuje Supremo)**: Press de Banca (6x2) | Press Militar (4x3) | Fondos en Paralelas (3x5) | Planchas Pesadas (4x30s).
  - **Viernes (Día D - Tracción y Brazos)**: Sentadilla Trasera Técnica (3x3) | Dominadas Lastradas (4x4) | Remo Pendlay (3x5) | Curl de Bíceps con Barra Z (4x5).
  - **Miércoles, Sábado y Domingo**: Descanso Absoluto Neuromuscular.

- **Módulo Zen de Resíntesis de ATP**:
  - Pantalla de aislamiento visual True Black (`#000000`).
  - Reloj masivo con anillo perimetral SVG continuo.
  - Pulso armónico de campana (440Hz) vía Web Audio API al finalizar el descanso.
  - Bloqueo mandatorio entre 3 y 6 minutos según el ejercicio.

---

## 🚀 Inicio Rápido

### 1. Backend (Python + FastAPI)

```bash
cd atp-strength-backend

# Crear entorno virtual e instalar dependencias
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

# Iniciar servidor de desarrollo
uvicorn main:app --reload --port 8000
```

Documentación interactiva disponible en: `http://localhost:8000/docs`

### 2. Frontend (Next.js + TypeScript + Tailwind)

```bash
cd atp-strength-frontend

# Iniciar servidor de desarrollo
npm run dev
```

Dashboard disponible en: `http://localhost:3000`
