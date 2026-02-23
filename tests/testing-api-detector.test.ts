import { describe, expect, test, vi } from 'vitest';
import { createTestingApiDetector } from '../src/detectors/testingApiDetector';

describe('testing api detector', () => {
  test('emits failure events when failed counts are present', () => {
    let listener: ((results: unknown) => void) | undefined;
    const api = {
      onDidChangeTestResults: (value: (results: unknown) => void) => {
        listener = value;
        return { dispose: vi.fn() };
      }
    };

    const now = vi.fn(() => 1000);
    const detector = createTestingApiDetector(api, now);
    const onFailure = vi.fn();

    detector.start(onFailure);

    listener?.([
      { id: 'run-a', counts: { failed: 2, errored: 1 } },
      { id: 'run-b', failed: 0 },
      { id: 'run-c', failed: 3 }
    ]);

    expect(onFailure).toHaveBeenCalledTimes(2);
    expect(onFailure).toHaveBeenNthCalledWith(1, {
      source: 'testing-api',
      runId: 'run-a',
      failedCount: 3,
      timestamp: 1000
    });
    expect(onFailure).toHaveBeenNthCalledWith(2, {
      source: 'testing-api',
      runId: 'run-c',
      failedCount: 3,
      timestamp: 1000
    });
  });

  test('returns noop disposable when api does not expose test results event', () => {
    const detector = createTestingApiDetector({}, () => 1000);
    const subscription = detector.start(vi.fn());

    expect(typeof subscription.dispose).toBe('function');
  });
});
