import { FailureDetector } from '../core/contracts';

type DisposableLike = { dispose: () => void };

type TerminalEndEventLike = {
  execution: {
    commandLine: {
      value: string;
    };
  };
  exitCode: number | undefined;
};

type WindowLike = {
  onDidEndTerminalShellExecution: (listener: (event: TerminalEndEventLike) => void) => DisposableLike;
};

type Clock = () => number;

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function isTestCommand(commandLine: string, patterns: string[]): boolean {
  const normalizedCommand = normalize(commandLine);

  if (!normalizedCommand) {
    return false;
  }

  for (const pattern of patterns) {
    const normalizedPattern = normalize(pattern);
    if (normalizedPattern.length > 0 && normalizedCommand.includes(normalizedPattern)) {
      return true;
    }
  }

  return false;
}

export function createTerminalDetector(windowApi: WindowLike, patterns: string[], now: Clock = () => Date.now()): FailureDetector {
  return {
    start: (onFailure) => {
      const disposable = windowApi.onDidEndTerminalShellExecution((event) => {
        const command = event.execution.commandLine.value;
        const failed = typeof event.exitCode === 'number' && event.exitCode !== 0;

        if (!failed) {
          return;
        }

        if (!isTestCommand(command, patterns)) {
          return;
        }

        onFailure({
          source: 'terminal',
          runId: `terminal-${now()}-${command}`,
          failedCount: 1,
          timestamp: now()
        });
      });

      return { dispose: () => disposable.dispose() };
    }
  };
}
