/**
 * Browser adapter for SPEC-0006 Data Portability & Backup.
 * Provides client-side file downloads and file-picker imports.
 */
import {
  generateBackupData,
  restoreBackupData,
  generateHistoryCsv,
  BACKUP_VERSION,
} from './dataPortabilityCore.mjs';

function browserStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

function triggerDownload(content: string, filename: string, mimeType: string) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportBackupJson(): void {
  const storage = browserStorage();
  if (!storage) return;
  const data = generateBackupData(storage);
  const dateStr = new Date().toISOString().split('T')[0];
  triggerDownload(
    JSON.stringify(data, null, 2),
    `neuro_strength_backup_${dateStr}.json`,
    'application/json'
  );
}

export function exportHistoryCsv(records: unknown[] = []): void {
  const csv = generateHistoryCsv(records as Parameters<typeof generateHistoryCsv>[0]);
  const dateStr = new Date().toISOString().split('T')[0];
  triggerDownload(csv, `neuro_strength_history_${dateStr}.csv`, 'text/csv');
}

export async function importBackupJsonFile(file: File): Promise<{ success: boolean; restoredKeys: string[] }> {
  const storage = browserStorage();
  if (!storage) throw new Error('ERR_STORAGE_UNAVAILABLE: LocalStorage not accessible');

  const text = await file.text();
  return restoreBackupData(storage, text) as { success: boolean; restoredKeys: string[] };
}

export { BACKUP_VERSION };
