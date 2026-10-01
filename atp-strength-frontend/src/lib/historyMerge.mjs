/**
 * Merge sovereign local set history with server executions.
 * A set logged on the device stays visible until the server has the same row.
 * Each server row consumes at most one local row.
 */

export const HISTORY_MATCH_WINDOW_MS = 12 * 60 * 60 * 1000;

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeName(name) {
  return String(name || "").trim().toLowerCase();
}

function timeMs(item) {
  if (!item || item.timestamp == null || item.timestamp === "") return null;
  const t = new Date(item.timestamp).getTime();
  return Number.isFinite(t) ? t : null;
}

function roundLoad(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

function repsOf(item) {
  const completed = Number(item?.completed_reps);
  if (Number.isFinite(completed)) return completed;
  const prescribed = Number(item?.prescribed_reps);
  return Number.isFinite(prescribed) ? prescribed : 0;
}

function signature(item) {
  return [
    normalizeName(item?.exercise_name),
    Number(item?.set_number) || 0,
    roundLoad(item?.load_kg),
    repsOf(item),
  ].join("|");
}

function sameIdentity(local, server) {
  const localId = local?.id != null ? String(local.id) : "";
  const serverId = server?.id != null ? String(server.id) : "";
  if (localId && serverId && localId === serverId) return true;

  const serverSync = server?.client_sync_id != null ? String(server.client_sync_id) : "";
  const localSync = local?.client_sync_id != null ? String(local.client_sync_id) : "";
  if (serverSync && (serverSync === localId || (localSync && serverSync === localSync))) return true;
  if (localSync && serverId && localSync === serverId) return true;
  return false;
}

function fromLocal(item) {
  const completed = item.completed_reps;
  return {
    id: item.id,
    exercise_name: item.exercise_name,
    set_number: item.set_number ?? 1,
    prescribed_reps: item.prescribed_reps ?? completed,
    completed_reps: completed,
    load_kg: item.load_kg,
    rest_seconds: item.rest_seconds ?? 180,
    notes: item.notes || "",
    completed: item.completed ?? true,
    e1rm: item.e1rm,
    rpe: item.rpe,
    rir: item.rir,
    is_pr: Boolean(item.is_pr),
    timestamp: item.timestamp,
    client_sync_id: item.client_sync_id,
  };
}

function fromServer(item) {
  return {
    id: item.id,
    exercise_name: item.exercise_name,
    set_number: item.set_number,
    prescribed_reps: item.prescribed_reps ?? item.completed_reps,
    completed_reps: item.completed_reps,
    load_kg: item.load_kg,
    rest_seconds: item.rest_seconds ?? 180,
    notes: item.notes || "",
    completed: item.completed ?? true,
    e1rm: item.e1rm,
    rpe: item.rpe,
    rir: item.rir,
    is_pr: Boolean(item.is_pr),
    timestamp: item.timestamp,
    client_sync_id: item.client_sync_id,
  };
}

/**
 * Local fields that describe the lift (timestamp, PR flag, notes, e1RM)
 * stay on the fused row. Server fields fill rest and the sync id.
 */
function fuse(serverItem, localItem) {
  return {
    id: localItem.id ?? serverItem.id,
    exercise_name: serverItem.exercise_name || localItem.exercise_name,
    set_number: serverItem.set_number ?? localItem.set_number,
    prescribed_reps:
      serverItem.prescribed_reps ?? localItem.prescribed_reps ?? localItem.completed_reps,
    completed_reps: serverItem.completed_reps ?? localItem.completed_reps,
    load_kg: serverItem.load_kg ?? localItem.load_kg,
    rest_seconds: serverItem.rest_seconds ?? localItem.rest_seconds ?? 180,
    notes: localItem.notes || serverItem.notes || "",
    completed: serverItem.completed ?? localItem.completed ?? true,
    e1rm: localItem.e1rm ?? serverItem.e1rm,
    rpe: localItem.rpe ?? serverItem.rpe,
    rir: localItem.rir ?? serverItem.rir,
    is_pr: Boolean(localItem.is_pr || serverItem.is_pr),
    timestamp: localItem.timestamp || serverItem.timestamp,
    client_sync_id: serverItem.client_sync_id || localItem.client_sync_id,
  };
}

function findMatchIndex(serverItem, pool) {
  for (let i = 0; i < pool.length; i += 1) {
    if (sameIdentity(pool[i], serverItem)) return i;
  }

  const serverTime = timeMs(serverItem);
  if (serverTime == null) return -1;

  const sig = signature(serverItem);
  let best = -1;
  let bestDelta = Infinity;
  for (let i = 0; i < pool.length; i += 1) {
    const local = pool[i];
    if (signature(local) !== sig) continue;
    const localTime = timeMs(local);
    if (localTime == null) continue;
    const delta = Math.abs(serverTime - localTime);
    if (delta <= HISTORY_MATCH_WINDOW_MS && delta < bestDelta) {
      bestDelta = delta;
      best = i;
    }
  }
  return best;
}

function byNewest(a, b) {
  const ta = timeMs(a) ?? -1;
  const tb = timeMs(b) ?? -1;
  return tb - ta;
}

/**
 * @param {Array<Object>} localItems
 * @param {Array<Object>} serverItems
 * @returns {Array<Object>} newest timestamp first
 */
export function mergeExerciseHistory(localItems, serverItems) {
  const pool = asArray(localItems).slice();
  const merged = [];

  for (const serverItem of asArray(serverItems)) {
    if (!serverItem || typeof serverItem !== "object") continue;
    const index = findMatchIndex(serverItem, pool);
    if (index >= 0) {
      const [localItem] = pool.splice(index, 1);
      merged.push(fuse(serverItem, localItem));
    } else {
      merged.push(fromServer(serverItem));
    }
  }

  for (const localItem of pool) {
    if (!localItem || typeof localItem !== "object") continue;
    merged.push(fromLocal(localItem));
  }

  merged.sort(byNewest);
  return merged;
}
