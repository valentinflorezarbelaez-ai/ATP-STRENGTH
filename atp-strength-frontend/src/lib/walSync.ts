/**
 * SPEC-0002: Fuerza Sync WAL — Motor de Sincronización con Write-Ahead Logging
 * Target: PRJ-APP-FUERZA
 * Policy: Append-Only Local First, FIFO Synchronization, Checksum Integrity
 */

export type WalEntryStatus = "PENDING_SYNC" | "SYNCING" | "COMMITTED" | "FAILED";

export interface WalLogEntry<T = unknown> {
  entryId: string;
  timestamp: string;
  status: WalEntryStatus;
  endpoint: string;
  method: "POST" | "PUT";
  payload: T;
  checksum: string;
  retryCount: number;
}

const WAL_STORAGE_KEY = "ATP_WAL_SYNC_QUEUE_V1";
const MAX_COMMITTED_HISTORY = 50;

/**
 * Genera un checksum determinista FNV-1a (32-bit hex) para verificar integridad del payload.
 */
export function calculateChecksum(payload: unknown): string {
  const str = JSON.stringify(payload) || "";
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Obtiene la cola completa del WAL almacenada en localStorage.
 */
export function getWalQueue(): WalLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WalLogEntry[];
  } catch (err) {
    console.error("Error al leer ATP WAL:", err);
    return [];
  }
}

/**
 * Persiste la cola del WAL de forma atómica en localStorage.
 */
function saveWalQueue(queue: WalLogEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WAL_STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error("Error al persistir ATP WAL:", err);
  }
}

/**
 * [REQ-EARS-WAL-01] Encola una entrada en modo Append-Only antes de la transmisión.
 */
export function enqueueWalEntry<T>(
  endpoint: string,
  payload: T,
  method: "POST" | "PUT" = "POST"
): WalLogEntry<T> {
  const entryId = `WAL-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const entry: WalLogEntry<T> = {
    entryId,
    timestamp: new Date().toISOString(),
    status: "PENDING_SYNC",
    endpoint,
    method,
    payload,
    checksum: calculateChecksum(payload),
    retryCount: 0,
  };

  const queue = getWalQueue();
  queue.push(entry as WalLogEntry);
  saveWalQueue(queue);

  return entry;
}

/**
 * Retorna el número de transacciones pendientes de sincronización.
 */
export function getPendingWalCount(): number {
  const queue = getWalQueue();
  return queue.filter((item) => item.status === "PENDING_SYNC" || item.status === "SYNCING").length;
}

/**
 * [REQ-EARS-WAL-02] Procesa la cola en orden estrictamente cronológico (FIFO).
 * Si ocurre una falla de red, preserva los registros pendientes para reintento diferido [REQ-EARS-WAL-03].
 */
export async function flushWalQueue(apiUrl: string): Promise<{ synced: number; failed: number }> {
  if (typeof window === "undefined") return { synced: 0, failed: 0 };

  const queue = getWalQueue();
  let synced = 0;
  let failed = 0;

  for (let i = 0; i < queue.length; i++) {
    const entry = queue[i];
    if (entry.status !== "PENDING_SYNC" && entry.status !== "SYNCING") {
      continue;
    }

    // [REQ-EARS-WAL-04] Detección de corrupción de Checksum
    const expectedChecksum = calculateChecksum(entry.payload);
    if (entry.checksum !== expectedChecksum) {
      console.error(`[ERR-FUE-WAL-CORRUPTED] Checksum inválido en entrada ${entry.entryId}`);
      entry.status = "FAILED";
      failed++;
      continue;
    }

    entry.status = "SYNCING";
    saveWalQueue(queue);

    try {
      const response = await fetch(`${apiUrl}${entry.endpoint}`, {
        method: entry.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry.payload),
      });

      if (response.ok) {
        entry.status = "COMMITTED";
        synced++;
      } else {
        // Error de servidor (4xx / 5xx)
        entry.retryCount++;
        if (response.status >= 400 && response.status < 500) {
          entry.status = "FAILED";
        } else {
          entry.status = "PENDING_SYNC";
        }
        failed++;
        break; // Detener FIFO ante fallo de backend para preservar orden
      }
    } catch {
      // Error de red / offline: mantener PENDING_SYNC y detener el vaciado
      entry.status = "PENDING_SYNC";
      entry.retryCount++;
      failed++;
      break;
    }
  }

  // Poda controlada de entradas confirmadas para no saturar localStorage
  const committed = queue.filter((e) => e.status === "COMMITTED");
  const pendingOrFailed = queue.filter((e) => e.status !== "COMMITTED");
  const prunedCommitted = committed.slice(-MAX_COMMITTED_HISTORY);
  const finalQueue = [...prunedCommitted, ...pendingOrFailed];

  saveWalQueue(finalQueue);
  return { synced, failed };
}
