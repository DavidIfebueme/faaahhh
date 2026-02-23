import { describe, expect, test, vi } from 'vitest';
import { createOutputChannelLogger } from '../src/logging/outputChannel';

describe('output channel logger', () => {
  test('writes structured log lines and disposes channel', () => {
    const appendLine = vi.fn();
    const dispose = vi.fn();
    const createOutputChannel = vi.fn(() => ({ appendLine, dispose }));

    const output = createOutputChannelLogger({ createOutputChannel } as any);

    output.logger.info('hello');
    output.logger.warn('careful');
    output.logger.error('boom');
    output.disposable.dispose();

    expect(createOutputChannel).toHaveBeenCalledWith('Faaahhh');
    expect(appendLine).toHaveBeenNthCalledWith(1, '[info] hello');
    expect(appendLine).toHaveBeenNthCalledWith(2, '[warn] careful');
    expect(appendLine).toHaveBeenNthCalledWith(3, '[error] boom');
    expect(dispose).toHaveBeenCalledTimes(1);
  });
});
