import { FailureCoordinator, FailureDetector } from './contracts';

export function wireDetectors(
  detectors: FailureDetector[],
  coordinator: FailureCoordinator
): { dispose: () => void } {
  const disposables = detectors.map((detector) => detector.start((event) => coordinator.onFailure(event)));

  return {
    dispose: () => {
      for (const disposable of disposables) {
        disposable.dispose();
      }
    }
  };
}
