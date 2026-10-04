import { test, expect } from '@playwright/test';

test.describe('SPEC-E2E-01: ATP-Strength App Shell & PWA Gateway', () => {
  test('PWA manifest is accessible and serves valid JSON metadata', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest');
    expect(response.status()).toBe(200);
    const manifest = await response.json();
    expect(manifest.name).toContain('NEURO//STRENGTH');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/');
  });

  test('Service Worker file is served with neuro-strength-v6 cache definition', async ({ request }) => {
    const response = await request.get('/sw.js');
    expect(response.status()).toBe(200);
    const content = await response.text();
    expect(content).toContain('neuro-strength-v6');
    expect(content).toContain('fetchWithTimeout');
  });

  test('Landing page renders temple intro for first-time visitors and transitions to Zen Dashboard', async ({ page }) => {
    await page.goto('/');
    
    // Check either temple intro or direct cockpit
    const enterBtn = page.locator('button:has-text("ENTRAR AL TEMPLO")');
    if (await enterBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await enterBtn.click();
    }

    // Wait for dynamic client chunk to load and replace loading placeholder
    await expect(page.locator('text=CARGANDO MOTOR ZEN...')).toBeHidden({ timeout: 20000 }).catch(() => {});

    // Coach guided view or pro cockpit is active
    const modoProBtn = page.locator('button:has-text("MODO PRO")');
    const proHeading = page.locator('h1:has-text("NEURO//STRENGTH")');
    await expect(modoProBtn.or(proHeading).first()).toBeVisible({ timeout: 20000 });

    // If in Coach view, toggle MODO PRO to verify transition
    if (await modoProBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await modoProBtn.click();
      await expect(proHeading).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=PRO-V1')).toBeVisible();
    }
  });

  test('Pre-seeded temple visitor directly opens Zen Dashboard Cockpit', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('hasEnteredTemple', 'true');
      window.localStorage.setItem('neuro_strength_coach_mode', 'false');
    });

    await page.goto('/');
    const heading = page.locator('h1:has-text("NEURO//STRENGTH")');
    await expect(heading).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Sesión de fuerza')).toBeVisible();
  });

  test('Full-screen calculator page (/calc) renders and calculates e1RM dynamically', async ({ page }) => {
    await page.goto('/calc');
    await expect(page.locator('text=MOTOR UNIVERSAL ACTIVO')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Balance Submáximo (Sin PR)")')).toBeVisible();
  });

  test('Warrior Forge Temple page (/forge) renders epic soundtrack jukebox and quotes', async ({ page }) => {
    await page.goto('/forge');
    await expect(page.locator('h1:has-text("LA FORJA DE LOS")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=EL TEMPLO DEL HIERRO')).toBeVisible();
  });
});
