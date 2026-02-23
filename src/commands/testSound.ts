import * as vscode from 'vscode';
import { AudioPlayer } from '../audio/audioPlayer';
import { Logger } from '../logging/outputChannel';

export function registerTestSoundCommand(
  commandsApi: { registerCommand: (command: string, callback: () => Promise<void> | void) => vscode.Disposable },
  windowApi: { showInformationMessage: (message: string) => Thenable<string | undefined> },
  audioPlayer: AudioPlayer,
  logger: Logger
): vscode.Disposable {
  return commandsApi.registerCommand('faaahhh.testSound', async () => {
    await audioPlayer.play({
      source: 'terminal',
      runId: 'manual-test-sound',
      failedCount: 1,
      timestamp: Date.now()
    });

    logger.info('Manual sound test command executed.');
    await windowApi.showInformationMessage('Faaahhh sound test played.');
  });
}
