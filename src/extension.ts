import * as vscode from 'vscode';
import { SystemAudioPlayer } from './audio/audioPlayer';
import { registerTestSoundCommand } from './commands/testSound';
import { readSettings } from './config/settings';
import { FailureEventCoordinator } from './core/failureEventCoordinator';
import { wireDetectors } from './core/runtime';
import { createTaskDetector } from './detectors/taskDetector';
import { createTestingApiDetector } from './detectors/testingApiDetector';
import { createTerminalDetector } from './detectors/terminalDetector';
import { createOutputChannelLogger } from './logging/outputChannel';

export function activate(context: vscode.ExtensionContext): void {
  const settings = readSettings();
  const output = createOutputChannelLogger(vscode.window);
  const logger = output.logger;
  const audioPlayer = new SystemAudioPlayer(context, () => readSettings());
  const commandDisposable = registerTestSoundCommand(vscode.commands, vscode.window, audioPlayer, logger);

  context.subscriptions.push({ dispose: () => output.disposable.dispose() });
  context.subscriptions.push(commandDisposable);

  const coordinator = new FailureEventCoordinator(
    (event) => {
      logger.info(`Failure detected from ${event.source} (${event.runId}).`);
      void audioPlayer.play(event);
    },
    {
      enabled: settings.enabled,
      cooldownMs: settings.cooldownMs,
      dedupeWindowMs: settings.dedupeWindowMs
    }
  );

  let runtime: { dispose: () => void } = { dispose: () => {} };
  try {
    runtime = wireDetectors(
      [
        createTestingApiDetector(vscode.tests as unknown as { onDidChangeTestResults?: (listener: (results: unknown) => void) => { dispose: () => void } }),
        createTerminalDetector(vscode.window, settings.terminalCommandPatterns),
        createTaskDetector(vscode.tasks)
      ],
      coordinator
    );
  } catch (error) {
    logger.error(String(error));
  }

  context.subscriptions.push({ dispose: () => runtime.dispose() });
}

export function deactivate(): void {}
