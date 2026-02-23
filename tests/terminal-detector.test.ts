import { describe, expect, test, vi } from 'vitest';
import { createTerminalDetector } from '../src/detectors/terminalDetector';

describe('terminal detector', () => {
  test('returns noop subscription when terminal shell execution api is unavailable', () => {
    const detector = createTerminalDetector({}, ['npm test'], () => 5000);
    const subscription = detector.start(vi.fn());

    expect(typeof subscription.dispose).toBe('function');
  });

  test('emits when a matching test command exits with failure', () => {
    let listener: ((event: { execution: { commandLine: { value: string } }; exitCode: number | undefined }) => void) | undefined;
    const windowApi = {
      onDidEndTerminalShellExecution: (value: (event: { execution: { commandLine: { value: string } }; exitCode: number | undefined }) => void) => {
        listener = value;
        return { dispose: vi.fn() };
      }
    };

    const onFailure = vi.fn();
    const detector = createTerminalDetector(windowApi, ['npm test', 'pytest'], () => 5000);

    detector.start(onFailure);

    listener?.({
      execution: { commandLine: { value: 'npm test -- --watch=false' } },
      exitCode: 1
    });

    expect(onFailure).toHaveBeenCalledTimes(1);
    expect(onFailure).toHaveBeenCalledWith({
      source: 'terminal',
      runId: 'terminal-5000-npm test -- --watch=false',
      failedCount: 1,
      timestamp: 5000
    });
  });

  test('does not emit for successful or non-test commands', () => {
    let listener: ((event: { execution: { commandLine: { value: string } }; exitCode: number | undefined }) => void) | undefined;
    const windowApi = {
      onDidEndTerminalShellExecution: (value: (event: { execution: { commandLine: { value: string } }; exitCode: number | undefined }) => void) => {
        listener = value;
        return { dispose: vi.fn() };
      }
    };

    const onFailure = vi.fn();
    const detector = createTerminalDetector(windowApi, ['npm test', 'pytest'], () => 6000);

    detector.start(onFailure);

    listener?.({
      execution: { commandLine: { value: 'npm test' } },
      exitCode: 0
    });

    listener?.({
      execution: { commandLine: { value: 'npm run build' } },
      exitCode: 1
    });

    expect(onFailure).toHaveBeenCalledTimes(0);
  });
});
