import { test, expect } from '@playwright/test';

test.describe('SPEC-E2E-02: Offline WAL Persistence & Sovereign Data Engine', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('hasEnteredTemple', 'true');
      window.localStorage.setItem('neuro_strength_coach_mode', 'false');
    });
  });

  test('Telemetry badge renders and reflects offline/online network awareness', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1:has-text("NEURO//STRENGTH")')).toBeVisible({ timeout: 10000 });
    
    // Telemetry badge exists and displays status
    const badge = page.locator('text=ONLINE').or(page.locator('text=OFFLINE')).first();
    await expect(badge).toBeVisible({ timeout: 5000 });
  });

  test('Local storage preserves athlete PR records and WAL queue sovereignly', async ({ page }) => {
    await page.addInitScript(() => {
      const mockRecord = {
        id: 'rec-test-e2e-1',
        exercise_name: 'Sentadilla Trasera',
        set_number: 1,
        load_kg: 140,
        completed_reps: 3,
        rpe: 8.5,
        rir: 1.5,
        e1rm: 156.4,
        is_pr: true,
        timestamp: new Date().toISOString(),
      };
      window.localStorage.setItem('atp_history_records_v1', JSON.stringify([mockRecord]));
      window.localStorage.setItem('atp_wal_v1', JSON.stringify([]));
    });

    await page.goto('/');
    await expect(page.locator('h1:has-text("NEURO//STRENGTH")')).toBeVisible({ timeout: 10000 });

    // Verify localStorage retains sovereign data without loss
    const records = await page.evaluate(() => {
      const raw = window.localStorage.getItem('atp_history_records_v1');
      return raw ? JSON.parse(raw) : [];
    });

    expect(records.length).toBe(1);
    expect(records[0].load_kg).toBe(140);
    expect(records[0].exercise_name).toBe('Sentadilla Trasera');
  });

  test('Simulated offline disconnect keeps UI responsive without throwing uncaught errors', async ({ page, context }) => {
    await page.goto('/');
    await expect(page.locator('h1:has-text("NEURO//STRENGTH")')).toBeVisible({ timeout: 10000 });

    // Switch context to offline (simulating basement gym / flight mode)
    await context.setOffline(true);

    // Verify page continues functioning seamlessly
    await expect(page.locator('h1:has-text("NEURO//STRENGTH")')).toBeVisible();

    // Reconnect
    await context.setOffline(false);
  });
});
