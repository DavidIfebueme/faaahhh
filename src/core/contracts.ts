export type FailureSource = 'testing-api' | 'terminal' | 'task';

export interface FailureEvent {
  source: FailureSource;
  runId: string;
  failedCount: number;
  timestamp: number;
}

export interface FailureDetector {
  start(onFailure: (event: FailureEvent) => void): { dispose: () => void };
}

export interface FailureCoordinator {
  onFailure(event: FailureEvent): void;
}
