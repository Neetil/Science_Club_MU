const offlineTimers = new Map<string, NodeJS.Timeout>();
const disconnectTimers = new Map<string, NodeJS.Timeout>();

export function clearOfflineTimer(sessionId: string): void {
  const timer = offlineTimers.get(sessionId);
  if (timer) {
    clearTimeout(timer);
    offlineTimers.delete(sessionId);
  }
}

export function clearDisconnectTimer(sessionId: string): void {
  const timer = disconnectTimers.get(sessionId);
  if (timer) {
    clearTimeout(timer);
    disconnectTimers.delete(sessionId);
  }
}

export function scheduleDisconnectTimer(sessionId: string, callback: () => void, delayMs = 8_000): void {
  clearDisconnectTimer(sessionId);
  const timer = setTimeout(callback, delayMs);
  disconnectTimers.set(sessionId, timer);
}

export function scheduleOfflineTimer(
  sessionId: string,
  callback: () => void,
  delayMs = 60_000,
): void {
  clearOfflineTimer(sessionId);
  const timer = setTimeout(callback, delayMs);
  offlineTimers.set(sessionId, timer);
}
