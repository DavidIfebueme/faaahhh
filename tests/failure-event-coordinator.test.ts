import { describe, expect, test, vi } from 'vitest';
import { FailureEventCoordinator } from '../src/core/failureEventCoordinator';

describe('failure event coordinator', () => {
  test('suppresses duplicate events within dedupe window', () => {
    const onPlay = vi.fn();
    const coordinator = new FailureEventCoordinator(onPlay, {
      enabled: true,
      cooldownMs: 0,
      dedupeWindowMs: 1500
    });

    const firstEvent = { source: 'terminal' as const, runId: 'run-1', failedCount: 1, timestamp: 1000 };
    const duplicate = { source: 'terminal' as const, runId: 'run-1', failedCount: 1, timestamp: 1800 };

    coordinator.onFailure(firstEvent);
    coordinator.onFailure(duplicate);

    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  test('enforces cooldown across different events', () => {
    const onPlay = vi.fn();
    const coordinator = new FailureEventCoordinator(onPlay, {
      enabled: true,
      cooldownMs: 30000,
      dedupeWindowMs: 0
    });

    coordinator.onFailure({ source: 'terminal', runId: 'run-1', failedCount: 1, timestamp: 1000 });
    coordinator.onFailure({ source: 'task', runId: 'run-2', failedCount: 1, timestamp: 2000 });
    coordinator.onFailure({ source: 'task', runId: 'run-3', failedCount: 1, timestamp: 32000 });

    expect(onPlay).toHaveBeenCalledTimes(2);
  });

  test('blocks all playback when disabled', () => {
    const onPlay = vi.fn();
    const coordinator = new FailureEventCoordinator(onPlay, {
      enabled: false,
      cooldownMs: 0,
      dedupeWindowMs: 0
    });

    coordinator.onFailure({ source: 'task', runId: 'run-1', failedCount: 2, timestamp: 1000 });

    expect(onPlay).toHaveBeenCalledTimes(0);
  });
});
