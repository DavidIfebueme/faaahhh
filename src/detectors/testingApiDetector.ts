import { FailureDetector, FailureEvent } from '../core/contracts';

type DisposableLike = { dispose: () => void };

type TestingResultsApi = {
  onDidChangeTestResults?: (listener: (results: unknown) => void) => DisposableLike;
};

type Clock = () => number;

function coerceFailureCount(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;

    const direct = record.failed;
    if (typeof direct === 'number' && Number.isFinite(direct) && direct > 0) {
      return direct;
    }

    const counts = record.counts;
    if (counts && typeof counts === 'object') {
      const countsRecord = counts as Record<string, unknown>;
      const failed = countsRecord.failed;
      const errored = countsRecord.errored;
      const failedCount = typeof failed === 'number' && Number.isFinite(failed) ? failed : 0;
      const erroredCount = typeof errored === 'number' && Number.isFinite(errored) ? errored : 0;
      const total = failedCount + erroredCount;
      if (total > 0) {
        return total;
      }
    }
  }

  return 0;
}

function toArray(results: unknown): unknown[] {
  if (Array.isArray(results)) {
    return results;
  }

  if (results && typeof (results as { [Symbol.iterator]?: unknown })[Symbol.iterator] === 'function') {
    return Array.from(results as Iterable<unknown>);
  }

  return [results];
}

function toFailureEvent(result: unknown, index: number, now: number): FailureEvent | undefined {
  if (!result || typeof result !== 'object') {
    return undefined;
  }

  const record = result as Record<string, unknown>;
  const failedCount = coerceFailureCount(record);

  if (failedCount <= 0) {
    return undefined;
  }

  const id = typeof record.id === 'string' && record.id.length > 0 ? record.id : `testing-${now}-${index}`;

  return {
    source: 'testing-api',
    runId: id,
    failedCount,
    timestamp: now
  };
}

export function createTestingApiDetector(api: TestingResultsApi, now: Clock = () => Date.now()): FailureDetector {
  return {
    start: (onFailure) => {
      if (typeof api.onDidChangeTestResults !== 'function') {
        return { dispose: () => {} };
      }

      const disposable = api.onDidChangeTestResults((results) => {
        const timestamp = now();
        const list = toArray(results);

        for (let index = 0; index < list.length; index += 1) {
          const event = toFailureEvent(list[index], index, timestamp);
          if (event) {
            onFailure(event);
          }
        }
      });

      return { dispose: () => disposable.dispose() };
    }
  };
}
