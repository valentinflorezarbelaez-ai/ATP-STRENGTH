# Guía de Contribución en ATP-STRENGTH

¡Gracias por tu interés en contribuir a **ATP-STRENGTH**! Esta plataforma está construida con el rigor de la ingeniería de software de misión crítica y la precisión biomecánica del entrenamiento neuromuscular de fuerza máxima.

---

## 1. Doctrinas Arquitectónicas Fundamentales

Toda contribución debe respetar estrictamente los límites arquitectónicos del sistema:

1. **Pureza de Dominio (Capa L0)**:
   * Los módulos centrales de cálculo (`atpTimerEngine.mjs`, `walEngine.mjs`, `rpeEngine.mjs`, `prilepinEngine.mjs`, `workoutStrategiesCore.mjs`) deben mantenerse como código ECMAScript puro con **cero dependencias externas** (`node_modules`).
   * No se permiten dependencias de React, frameworks ni variables globales del DOM dentro de L0.
2. **Evidencia Determinista sobre Afirmaciones**:
   * No se aprueba ningún Pull Request sin que el 100% de las pruebas unitarias pasen en verde (`npm test`).
   * Toda corrección de errores debe incluir una prueba unitaria que reproduzca el fallo antes de su solución.
3. **Ergonomía Móvil Gym-First**:
   * Los componentes de la interfaz deben garantizar áreas táctiles $\ge 44 \times 44\text{px}$, evitar el auto-zoom en iOS (`font-size: 16px`) y respetar las zonas seguras (`env(safe-area-inset)`).
4. **Convención de Commits**:
   * Los mensajes de commit deben respetar la especificación de [Conventional Commits](https://www.conventionalcommits.org/):
     * `feat(...)`: Nuevas capacidades o características.
     * `fix(...)`: Corrección de errores.
     * `test(...)`: Incorporación o actualización de pruebas.
     * `refactor(...)`: Cambios de estructura sin modificar comportamiento externo.
     * `docs(...)`: Actualización de documentación.
   * Los commits nunca deben incluir atribuciones de IA ni pies `Co-Authored-By`.

---

## 2. Flujo de Trabajo en Desarrollo Local

```bash
# Clonar el repositorio
git clone https://github.com/valentinflorezarbelaez-ai/ATP-STRENGTH.git
cd ATP-STRENGTH/atp-strength-frontend

# Instalar dependencias
npm install

# Ejecutar la suite de pruebas unitarias (Node.js nativo)
npm test

# Iniciar servidor local de desarrollo
npm run dev

# Validar la compilación estricta de producción (Turbopack + TypeScript)
npm run build
```

---

## 3. Criterios de Pull Request

1. Crear una rama de funcionalidad a partir de `main`: `git checkout -b feat/mi-mejora`.
2. Verificar que `npm test` finalice con 0 fallos (97 pruebas en verde).
3. Asegurar que `npm run build` compile sin advertencias ni errores de TypeScript.
4. Describir con precisión la motivación técnica y el alcance de los cambios.
