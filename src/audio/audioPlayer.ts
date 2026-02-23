import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { platform } from 'node:os';
import { spawn } from 'node:child_process';
import { FailureEvent } from '../core/contracts';
import { FaaahhhSettings } from '../config/settings';

type ExtensionContextLike = {
  asAbsolutePath: (relativePath: string) => string;
};

type CommandSpec = {
  command: string;
  args: string[];
};

type Runner = (spec: CommandSpec) => Promise<boolean>;

type SettingsProvider = () => FaaahhhSettings;

export interface AudioPlayer {
  play(event: FailureEvent): Promise<void>;
}

async function fileExists(filePath: string): Promise<boolean> {
  if (!filePath || filePath.trim().length === 0) {
    return false;
  }

  try {
    await access(filePath, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function shellEscapeSingleQuotes(value: string): string {
  return value.replace(/'/g, "''");
}

export function commandCandidatesFor(filePath: string, targetPlatform: NodeJS.Platform = platform()): CommandSpec[] {
  if (targetPlatform === 'darwin') {
    return [{ command: 'afplay', args: [filePath] }];
  }

  if (targetPlatform === 'win32') {
    const escaped = shellEscapeSingleQuotes(filePath);
    return [
      {
        command: 'powershell',
        args: ['-NoProfile', '-Command', `(New-Object Media.SoundPlayer '${escaped}').PlaySync()`]
      }
    ];
  }

  return [
    { command: 'paplay', args: [filePath] },
    { command: 'aplay', args: [filePath] },
    { command: 'ffplay', args: ['-nodisp', '-autoexit', '-loglevel', 'quiet', filePath] }
  ];
}

export async function defaultRunner(spec: CommandSpec): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn(spec.command, spec.args, { stdio: 'ignore' });
    child.on('error', () => resolve(false));
    child.on('close', (code) => resolve(code === 0));
  });
}

export class SystemAudioPlayer implements AudioPlayer {
  private readonly context: ExtensionContextLike;
  private readonly settingsProvider: SettingsProvider;
  private readonly runner: Runner;

  constructor(context: ExtensionContextLike, settingsProvider: SettingsProvider, runner: Runner = defaultRunner) {
    this.context = context;
    this.settingsProvider = settingsProvider;
    this.runner = runner;
  }

  private bundledPath(): string {
    return this.context.asAbsolutePath('media/faaahhh.mp3');
  }

  private async resolveAudioPath(): Promise<string | undefined> {
    const settings = this.settingsProvider();

    if (settings.audioSource === 'custom' && (await fileExists(settings.customAudioPath))) {
      return settings.customAudioPath;
    }

    const bundled = this.bundledPath();
    if (await fileExists(bundled)) {
      return bundled;
    }

    return undefined;
  }

  async play(_event: FailureEvent): Promise<void> {
    const audioPath = await this.resolveAudioPath();
    if (!audioPath) {
      return;
    }

    const candidates = commandCandidatesFor(audioPath);
    for (const candidate of candidates) {
      const played = await this.runner(candidate);
      if (played) {
        return;
      }
    }
  }
}
