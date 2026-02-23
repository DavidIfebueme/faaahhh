# Faaahhh

Faaahhh is a VS Code extension that plays a sound when test runs fail.

## Features

- Detects failed test runs from integrated terminal test commands.
- Detects failed test-oriented tasks from VS Code task process end events.
- Uses Testing API result events when available in the runtime API surface.
- Applies cooldown and dedupe logic to avoid repeated spam.
- Supports bundled audio and custom audio file paths.
- Provides `Faaahhh: Test Sound` command for quick validation.
- Writes detection and playback logs to the `Faaahhh` output channel.

## Configuration

- `faaahhh.enabled`: Enables or disables playback.
- `faaahhh.cooldownMs`: Minimum time between played sounds.
- `faaahhh.audioSource`: `bundled` or `custom`.
- `faaahhh.customAudioPath`: Absolute path for custom audio file.
- `faaahhh.terminalCommandPatterns`: Command fragments recognized as tests.
- `faaahhh.dedupeWindowMs`: Duplicate suppression window for overlapping detectors.

## Notes

- The bundled `media/faaahhh.mp3` file is included as a placeholder asset in this repository. Replace it with your preferred final sound before publishing.
- On Linux and macOS the extension uses system audio players (`paplay`, `aplay`, `ffplay`, `afplay`) when available.
- On Windows playback currently uses PowerShell `Media.SoundPlayer`, which is most reliable with WAV files.
- Testing API coverage depends on runtime API support and test provider integration.

## Development

- Install dependencies: `npm install`
- Build: `npm run build`
- Test: `npm test`

## Command

- `Faaahhh: Test Sound` (`faaahhh.testSound`)
