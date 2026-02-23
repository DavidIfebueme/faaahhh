import { FailureDetector } from '../core/contracts';

type DisposableLike = { dispose: () => void };

type TaskLike = {
  name?: string;
  source?: string;
  detail?: string;
  group?: {
    id?: string;
  };
  definition?: {
    type?: string;
    script?: string;
    task?: string;
    command?: string;
  };
};

type TaskProcessEndEventLike = {
  execution: {
    task: TaskLike;
  };
  exitCode: number | undefined;
};

type TasksApiLike = {
  onDidEndTaskProcess?: (listener: (event: TaskProcessEndEventLike) => void) => DisposableLike;
};

type Clock = () => number;

const keywords = ['test', 'jest', 'vitest', 'pytest', 'go test', 'cargo test', 'dotnet test', 'mvn test', 'gradle test'];

function text(value: unknown): string {
  return typeof value === 'string' ? value.toLowerCase() : '';
}

function isLikelyTestTask(task: TaskLike): boolean {
  if (task.group?.id?.toLowerCase() === 'test') {
    return true;
  }

  const values = [
    text(task.name),
    text(task.source),
    text(task.detail),
    text(task.definition?.type),
    text(task.definition?.script),
    text(task.definition?.task),
    text(task.definition?.command)
  ];

  const joined = values.filter((value) => value.length > 0).join(' ');

  if (!joined) {
    return false;
  }

  return keywords.some((keyword) => joined.includes(keyword));
}

export function createTaskDetector(tasksApi: TasksApiLike, now: Clock = () => Date.now()): FailureDetector {
  return {
    start: (onFailure) => {
      if (typeof tasksApi.onDidEndTaskProcess !== 'function') {
        return { dispose: () => {} };
      }

      try {
        const disposable = tasksApi.onDidEndTaskProcess((event) => {
          const failed = typeof event.exitCode === 'number' && event.exitCode !== 0;
          if (!failed) {
            return;
          }

          if (!isLikelyTestTask(event.execution.task)) {
            return;
          }

          const task = event.execution.task;
          const taskName = typeof task.name === 'string' && task.name.length > 0 ? task.name : 'task';
          const timestamp = now();

          onFailure({
            source: 'task',
            runId: `task-${timestamp}-${taskName}`,
            failedCount: 1,
            timestamp
          });
        });

        return { dispose: () => disposable.dispose() };
      } catch {
        return { dispose: () => {} };
      }
    }
  };
}
