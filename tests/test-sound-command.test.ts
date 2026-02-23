import { describe, expect, test, vi } from 'vitest';
import { registerTestSoundCommand } from '../src/commands/testSound';

describe('test sound command', () => {
  test('plays sound and shows feedback message', async () => {
    let callback: (() => Promise<void> | void) | undefined;
    const commandsApi = {
      registerCommand: (_command: string, value: () => Promise<void> | void) => {
        callback = value;
        return { dispose: vi.fn() };
      }
    };

    const audioPlayer = {
      play: vi.fn(async () => {})
    };

    const logger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };

    const windowApi = {
      showInformationMessage: vi.fn(async () => 'ok')
    };

    registerTestSoundCommand(commandsApi as any, windowApi as any, audioPlayer, logger);
    await callback?.();

    expect(audioPlayer.play).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(windowApi.showInformationMessage).toHaveBeenCalledWith('Faaahhh sound test played.');
  });
});
