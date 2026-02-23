import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, test, vi } from 'vitest';
import { commandCandidatesFor, SystemAudioPlayer } from '../src/audio/audioPlayer';
import { FaaahhhSettings } from '../src/config/settings';

function makeSettings(overrides: Partial<FaaahhhSettings> = {}): FaaahhhSettings {
  return {
    enabled: true,
    cooldownMs: 30000,
    audioSource: 'bundled',
    customAudioPath: '',
    terminalCommandPatterns: [],
    dedupeWindowMs: 1500,
    ...overrides
  };
}

describe('audio player', () => {
  test('uses valid custom audio path when selected', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'faaahhh-audio-custom-'));
    const customPath = join(dir, 'custom.mp3');
    const bundledPath = join(dir, 'media', 'faaahhh.mp3');

    writeFileSync(customPath, 'x');

    const runner = vi.fn(async () => true);
    const player = new SystemAudioPlayer(
      {
        asAbsolutePath: () => bundledPath
      },
      () => makeSettings({ audioSource: 'custom', customAudioPath: customPath }),
      runner
    );

    await player.play({ source: 'terminal', runId: 'run-1', failedCount: 1, timestamp: 1 });

    expect(runner).toHaveBeenCalledTimes(1);
    expect(runner.mock.calls[0][0].args).toContain(customPath);
  });

  test('falls back to bundled file when custom path is invalid', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'faaahhh-audio-bundled-'));
    const bundledPath = join(dir, 'faaahhh.mp3');

    writeFileSync(bundledPath, 'x');

    const runner = vi.fn(async () => true);
    const player = new SystemAudioPlayer(
      {
        asAbsolutePath: () => bundledPath
      },
      () => makeSettings({ audioSource: 'custom', customAudioPath: join(dir, 'missing.mp3') }),
      runner
    );

    await player.play({ source: 'task', runId: 'run-2', failedCount: 1, timestamp: 2 });

    expect(runner).toHaveBeenCalledTimes(1);
    expect(runner.mock.calls[0][0].args).toContain(bundledPath);
  });

  test('returns platform-specific command candidates', () => {
    const linuxCandidates = commandCandidatesFor('/tmp/a.mp3', 'linux');
    const macCandidates = commandCandidatesFor('/tmp/a.mp3', 'darwin');
    const winCandidates = commandCandidatesFor('C:/a.wav', 'win32');

    expect(linuxCandidates.length).toBeGreaterThan(0);
    expect(macCandidates[0].command).toBe('afplay');
    expect(winCandidates[0].command).toBe('powershell');
  });
});
