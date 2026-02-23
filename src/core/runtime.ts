import { FailureCoordinator, FailureDetector } from './contracts';

export function wireDetectors(
  detectors: FailureDetector[],
  coordinator: FailureCoordinator
): { dispose: () => void } {
  const disposables: Array<{ dispose: () => void }> = [];

  for (const detector of detectors) {
    try {
      const disposable = detector.start((event) => coordinator.onFailure(event));
      disposables.push(disposable);
    } catch {
      continue;
    }
  }

  return {
    dispose: () => {
      for (const disposable of disposables) {
        try {
          disposable.dispose();
        } catch {
          continue;
        }
      }
    }
  };
}
