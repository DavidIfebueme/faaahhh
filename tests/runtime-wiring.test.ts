import { describe, expect, test, vi } from 'vitest';
import { FailureEvent } from '../src/core/contracts';
import { FailureEventCoordinator } from '../src/core/failureEventCoordinator';
import { wireDetectors } from '../src/core/runtime';

describe('runtime wiring', () => {
  test('forwards detector failures to coordinator', () => {
    const play = vi.fn();
    const coordinator = new FailureEventCoordinator(play);
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
    const coordinator = new FailureEventCoordinator(() => {});

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
});
