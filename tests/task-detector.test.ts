import { describe, expect, test, vi } from 'vitest';
import { createTaskDetector } from '../src/detectors/taskDetector';

describe('task detector', () => {
  test('returns noop subscription when task process api is unavailable', () => {
    const detector = createTaskDetector({}, () => 7000);
    const subscription = detector.start(vi.fn());

    expect(typeof subscription.dispose).toBe('function');
  });

  test('emits for failed test-group tasks', () => {
    let listener: ((event: { execution: { task: { name?: string; group?: { id?: string } } }; exitCode: number | undefined }) => void) | undefined;
    const tasksApi = {
      onDidEndTaskProcess: (value: (event: { execution: { task: { name?: string; group?: { id?: string } } }; exitCode: number | undefined }) => void) => {
        listener = value;
        return { dispose: vi.fn() };
      }
    };

    const onFailure = vi.fn();
    const detector = createTaskDetector(tasksApi, () => 7000);

    detector.start(onFailure);

    listener?.({
      execution: { task: { name: 'all tests', group: { id: 'test' } } },
      exitCode: 2
    });

    expect(onFailure).toHaveBeenCalledTimes(1);
    expect(onFailure).toHaveBeenCalledWith({
      source: 'task',
      runId: 'task-7000-all tests',
      failedCount: 1,
      timestamp: 7000
    });
  });

  test('does not emit for successful or non-test tasks', () => {
    let listener: ((event: { execution: { task: { name?: string; definition?: { type?: string } } }; exitCode: number | undefined }) => void) | undefined;
    const tasksApi = {
      onDidEndTaskProcess: (value: (event: { execution: { task: { name?: string; definition?: { type?: string } } }; exitCode: number | undefined }) => void) => {
        listener = value;
        return { dispose: vi.fn() };
      }
    };

    const onFailure = vi.fn();
    const detector = createTaskDetector(tasksApi, () => 8000);

    detector.start(onFailure);

    listener?.({
      execution: { task: { name: 'build app', definition: { type: 'npm' } } },
      exitCode: 1
    });

    listener?.({
      execution: { task: { name: 'unit tests', definition: { type: 'npm' } } },
      exitCode: 0
    });

    expect(onFailure).toHaveBeenCalledTimes(0);
  });
});
