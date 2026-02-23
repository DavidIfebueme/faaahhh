import * as vscode from 'vscode';

export interface FaaahhhSettings {
  enabled: boolean;
  cooldownMs: number;
  audioSource: 'bundled' | 'custom';
  customAudioPath: string;
  terminalCommandPatterns: string[];
  dedupeWindowMs: number;
}

const defaultPatterns = [
  'npm test',
  'pnpm test',
  'yarn test',
  'bun test',
  'vitest',
  'jest',
  'pytest',
  'go test',
  'cargo test',
  'dotnet test',
  'mvn test',
  'gradle test'
];

export function readSettings(config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('faaahhh')): FaaahhhSettings {
  return {
    enabled: config.get<boolean>('enabled', true),
    cooldownMs: config.get<number>('cooldownMs', 30000),
    audioSource: config.get<'bundled' | 'custom'>('audioSource', 'bundled'),
    customAudioPath: config.get<string>('customAudioPath', ''),
    terminalCommandPatterns: config.get<string[]>('terminalCommandPatterns', defaultPatterns),
    dedupeWindowMs: config.get<number>('dedupeWindowMs', 1500)
  };
}
