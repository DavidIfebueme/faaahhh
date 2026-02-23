import { FailureCoordinator, FailureEvent } from './contracts';

export class FailureEventCoordinator implements FailureCoordinator {
  private readonly onPlay: (event: FailureEvent) => void;

  constructor(onPlay: (event: FailureEvent) => void) {
    this.onPlay = onPlay;
  }

  onFailure(event: FailureEvent): void {
    this.onPlay(event);
  }
}
