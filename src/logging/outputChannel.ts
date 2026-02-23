import * as vscode from 'vscode';

export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export class OutputChannelLogger implements Logger {
  private readonly channel: vscode.OutputChannel;

  constructor(channel: vscode.OutputChannel) {
    this.channel = channel;
  }

  info(message: string): void {
    this.channel.appendLine(`[info] ${message}`);
  }

  warn(message: string): void {
    this.channel.appendLine(`[warn] ${message}`);
  }

  error(message: string): void {
    this.channel.appendLine(`[error] ${message}`);
  }
}

export function createOutputChannelLogger(windowApi: { createOutputChannel: (name: string) => vscode.OutputChannel }): {
  logger: Logger;
  disposable: { dispose: () => void };
} {
  const channel = windowApi.createOutputChannel('Faaahhh');
  return {
    logger: new OutputChannelLogger(channel),
    disposable: { dispose: () => channel.dispose() }
  };
}
