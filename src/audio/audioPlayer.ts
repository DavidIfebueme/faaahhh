import { FailureEvent } from '../core/contracts';

export interface AudioPlayer {
  play(event: FailureEvent): Promise<void>;
}

export class NoopAudioPlayer implements AudioPlayer {
  async play(_event: FailureEvent): Promise<void> {}
}
