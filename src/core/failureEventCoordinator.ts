import { FailureCoordinator, FailureEvent } from './contracts';

export interface FailureEventCoordinatorOptions {
  enabled: boolean;
  cooldownMs: number;
  dedupeWindowMs: number;
}

export class FailureEventCoordinator implements FailureCoordinator {
  private readonly onPlay: (event: FailureEvent) => void;
  private readonly options: FailureEventCoordinatorOptions;
  private readonly now: () => number;
  private lastPlayAt = -1;
  private recentEvents = new Map<string, number>();

  constructor(
    onPlay: (event: FailureEvent) => void,
    options: FailureEventCoordinatorOptions,
    now: () => number = () => Date.now()
  ) {
    this.onPlay = onPlay;
    this.options = options;
    this.now = now;
  }

  private pruneOldEvents(currentTimestamp: number): void {
    const threshold = Math.max(0, this.options.dedupeWindowMs);
    if (threshold === 0) {
      this.recentEvents.clear();
      return;
    }

    for (const [key, timestamp] of this.recentEvents.entries()) {
      if (currentTimestamp - timestamp > threshold) {
        this.recentEvents.delete(key);
      }
    }
  }

  onFailure(event: FailureEvent): void {
    if (!this.options.enabled) {
      return;
    }

    const timestamp = Number.isFinite(event.timestamp) ? event.timestamp : this.now();
    this.pruneOldEvents(timestamp);

    const dedupeWindow = Math.max(0, this.options.dedupeWindowMs);
    const dedupeKey = `${event.source}:${event.runId}:${event.failedCount}`;
    const previous = this.recentEvents.get(dedupeKey);

    if (previous !== undefined && timestamp - previous <= dedupeWindow) {
      return;
    }

    const cooldown = Math.max(0, this.options.cooldownMs);
    if (this.lastPlayAt >= 0 && timestamp - this.lastPlayAt <= cooldown) {
      this.recentEvents.set(dedupeKey, timestamp);
      return;
    }

    this.recentEvents.set(dedupeKey, timestamp);
    this.lastPlayAt = timestamp;
    this.onPlay(event);
  }
}
