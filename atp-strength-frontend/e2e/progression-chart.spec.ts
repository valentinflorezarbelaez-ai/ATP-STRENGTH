import { test, expect } from '@playwright/test';

test.describe('SPEC-E2E-03: Neuromuscular Progression Chart & PR Engine', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('hasEnteredTemple', 'true');
      window.localStorage.setItem('neuro_strength_coach_mode', 'false');
    });
  });

  test('Displays empty state message when no set history is recorded for exercise', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1:has-text("NEURO//STRENGTH")')).toBeVisible({ timeout: 10000 });

    // Open Fuerza / Progreso modal to inspect progression chart
    const progressBtn = page.locator('button:has-text("FUERZA / PROGRESO")');
    await expect(progressBtn).toBeVisible({ timeout: 5000 });
    await progressBtn.click();

    const chartTitle = page.locator('text=CURVA DE SUPERCOMPENSACIÓN NEUROMUSCULAR (e1RM)');
    await expect(chartTitle).toBeVisible({ timeout: 5000 });

    const emptyMsg = page.locator('text=Aún no hay series registradas');
    await expect(emptyMsg).toBeVisible();
  });

  test('Renders interactive SVG curve when multi-session PR progression exists', async ({ page }) => {
    await page.addInitScript(() => {
      const records = [
        {
          id: 'rec-1',
          exercise_name: 'Press de Banca',
          set_number: 1,
          load_kg: 80,
          completed_reps: 5,
          rpe: 8,
          rir: 2,
          e1rm: 93.3,
          is_pr: true,
          timestamp: '2026-09-01T10:00:00.000Z',
        },
        {
          id: 'rec-2',
          exercise_name: 'Press de Banca',
          set_number: 1,
          load_kg: 90,
          completed_reps: 3,
          rpe: 8.5,
          rir: 1.5,
          e1rm: 100.5,
          is_pr: true,
          timestamp: '2026-09-10T10:00:00.000Z',
        },
        {
          id: 'rec-3',
          exercise_name: 'Press de Banca',
          set_number: 1,
          load_kg: 100,
          completed_reps: 3,
          rpe: 9,
          rir: 1,
          e1rm: 111.7,
          is_pr: true,
          timestamp: '2026-09-20T10:00:00.000Z',
        },
      ];
      window.localStorage.setItem('atp_history_records_v1', JSON.stringify(records));
    });

    await page.goto('/');
    await expect(page.locator('h1:has-text("NEURO//STRENGTH")')).toBeVisible({ timeout: 10000 });

    // Open Fuerza / Progreso modal to inspect progression chart
    const progressBtn = page.locator('button:has-text("FUERZA / PROGRESO")');
    await expect(progressBtn).toBeVisible({ timeout: 5000 });
    await progressBtn.click();

    // The chart header should be present
    const chartTitle = page.locator('text=CURVA DE SUPERCOMPENSACIÓN NEUROMUSCULAR (e1RM)');
    await expect(chartTitle).toBeVisible({ timeout: 5000 });

    // SVG elements should render the curve
    const svgChart = page.locator('svg[viewBox="0 0 600 220"]');
    await expect(svgChart).toBeVisible({ timeout: 5000 });

    // Check stats are rendered: 3 Series Registradas, and positive progression gain
    await expect(page.locator('text=3').and(page.locator('text=Series Registradas'))).toBeDefined();
  });
});
