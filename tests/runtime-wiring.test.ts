import { describe, expect, test, vi } from 'vitest';
import { FailureEvent } from '../src/core/contracts';
import { FailureEventCoordinator } from '../src/core/failureEventCoordinator';
import { wireDetectors } from '../src/core/runtime';

describe('runtime wiring', () => {
  test('forwards detector failures to coordinator', () => {
    const play = vi.fn();
    const coordinator = new FailureEventCoordinator(play, {
      enabled: true,
      cooldownMs: 0,
      dedupeWindowMs: 0
    });
    const event: FailureEvent = {
      source: 'terminal',
      runId: 'run-1',
      failedCount: 2,
      timestamp: Date.now()
    };

    const detector = {
      start: (onFailure: (value: FailureEvent) => void) => {
        onFailure(event);
        return { dispose: vi.fn() };
      }
    };

    wireDetectors([detector], coordinator);

    expect(play).toHaveBeenCalledTimes(1);
    expect(play).toHaveBeenCalledWith(event);
  });

  test('disposes all detector subscriptions', () => {
    const disposeA = vi.fn();
    const disposeB = vi.fn();
    const coordinator = new FailureEventCoordinator(() => {}, {
      enabled: true,
      cooldownMs: 0,
      dedupeWindowMs: 0
    });

    const detectorA = {
      start: () => ({ dispose: disposeA })
    };

    const detectorB = {
      start: () => ({ dispose: disposeB })
    };

    const runtime = wireDetectors([detectorA, detectorB], coordinator);

    runtime.dispose();

    expect(disposeA).toHaveBeenCalledTimes(1);
    expect(disposeB).toHaveBeenCalledTimes(1);
  });

  test('continues wiring when a detector throws on start', () => {
    const play = vi.fn();
    const coordinator = new FailureEventCoordinator(play, {
      enabled: true,
      cooldownMs: 0,
      dedupeWindowMs: 0
    });

    const goodDetector = {
      start: (onFailure: (value: FailureEvent) => void) => {
        onFailure({
          source: 'task',
          runId: 'ok',
          failedCount: 1,
          timestamp: 1
        });
        return { dispose: vi.fn() };
      }
    };

    const badDetector = {
      start: () => {
        throw new Error('boom');
      }
    };

    wireDetectors([badDetector, goodDetector], coordinator);

    expect(play).toHaveBeenCalledTimes(1);
  });
});
