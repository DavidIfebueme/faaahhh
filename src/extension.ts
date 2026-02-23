import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand('faaahhh.testSound', async () => {
    await vscode.window.showInformationMessage('Faaahhh extension is active.');
  });

  context.subscriptions.push(disposable);
}

export function deactivate(): void {}
