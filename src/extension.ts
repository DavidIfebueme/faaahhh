import * as vscode from 'vscode';
import { NoopAudioPlayer } from './audio/audioPlayer';
import { readSettings } from './config/settings';
import { FailureEventCoordinator } from './core/failureEventCoordinator';
import { wireDetectors } from './core/runtime';
import { createTestingApiDetector } from './detectors/testingApiDetector';
import { createTerminalDetector } from './detectors/terminalDetector';

export function activate(context: vscode.ExtensionContext): void {
  const settings = readSettings();
  const audioPlayer = new NoopAudioPlayer();
  const coordinator = new FailureEventCoordinator((event) => {
    void audioPlayer.play(event);
  });

  const runtime = wireDetectors(
    [
      createTestingApiDetector(vscode.tests as unknown as { onDidChangeTestResults?: (listener: (results: unknown) => void) => { dispose: () => void } }),
      createTerminalDetector(
        vscode.window as unknown as {
          onDidEndTerminalShellExecution: (listener: (event: {
            execution: { commandLine: { value: string } };
            exitCode: number | undefined;
          }) => void) => { dispose: () => void };
        },
        settings.terminalCommandPatterns
      )
    ],
    coordinator
  );

  const disposable = vscode.commands.registerCommand('faaahhh.testSound', async () => {
    await vscode.window.showInformationMessage('Faaahhh extension is active.');
  });

  context.subscriptions.push({ dispose: () => runtime.dispose() });
  context.subscriptions.push(disposable);
}

export function deactivate(): void {}
