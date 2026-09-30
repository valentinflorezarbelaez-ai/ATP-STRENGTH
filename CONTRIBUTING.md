# Contributing to ATP-STRENGTH

Thank you for your interest in contributing to **ATP-STRENGTH**! This platform is built with the engineering rigor of mission-critical systems and the sports-science precision of elite neuromuscular training.

---

## 1. Core Architectural Doctrines

All contributions must strictly respect our architectural boundaries:

1. **Domain Purity (L0 Layer)**:
   * Core computation modules (`atpTimerEngine.mjs`, `walEngine.mjs`, `rpeEngine.mjs`, `prilepinEngine.mjs`, `workoutStrategiesCore.mjs`) must remain pure ECMAScript with **zero runtime dependencies** (`node_modules`).
   * No framework imports, no React dependencies, and no DOM globals inside L0.
2. **Deterministic Evidence Over Claims**:
   * No pull request may be merged without 100% passing tests in the Node.js test runner (`npm test`).
   * All bug fixes must be accompanied by a reproducing unit test before remediation.
3. **Gym-First Mobile Ergonomics**:
   * UI components must provide touch targets $\ge 44 \times 44\text{px}$, avoid input auto-zoom on iOS (`font-size: 16px`), and support safe area insets (`env(safe-area-inset)`).
4. **Conventional Commits**:
   * Commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
     * `feat(...)`: New features or capabilities.
     * `fix(...)`: Bug fixes.
     * `test(...)`: Adding or updating test suites.
     * `refactor(...)`: Code changes that neither fix bugs nor add features.
     * `docs(...)`: Documentation updates.
   * Commits must **never** contain AI attribution or `Co-Authored-By` footers.

---

## 2. Local Development Workflow

```bash
# Clone the repository
git clone https://github.com/valentinflorezarbelaez-ai/ATP-STRENGTH.git
cd ATP-STRENGTH/atp-strength-frontend

# Install dependencies
npm install

# Run the test suite (Node.js native test runner)
npm test

# Start development server
npm run dev

# Verify strict production build (Turbopack + TypeScript)
npm run build
```

---

## 3. Pull Request Guidelines

1. Create a feature branch off `main`: `git checkout -b feat/my-enhancement`.
2. Ensure `npm test` passes cleanly with 0 failures.
3. Verify that `npm run build` succeeds with zero TypeScript errors.
4. Submit your pull request with a concise description of changes and motivation.
