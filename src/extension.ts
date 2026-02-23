import * as vscode from 'vscode';
import { NoopAudioPlayer } from './audio/audioPlayer';
import { FailureEventCoordinator } from './core/failureEventCoordinator';
import { wireDetectors } from './core/runtime';

export function activate(context: vscode.ExtensionContext): void {
  const audioPlayer = new NoopAudioPlayer();
  const coordinator = new FailureEventCoordinator((event) => {
    void audioPlayer.play(event);
  });

  const runtime = wireDetectors([], coordinator);

  const disposable = vscode.commands.registerCommand('faaahhh.testSound', async () => {
    await vscode.window.showInformationMessage('Faaahhh extension is active.');
  });

  context.subscriptions.push({ dispose: () => runtime.dispose() });
  context.subscriptions.push(disposable);
}

export function deactivate(): void {}
