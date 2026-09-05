import { beforeEach, expect, test, vi } from 'vitest';
import { createLinePointColors } from '../linePointColors';
import { validateLinePointColors } from '../../config/linePointColors';
import type { LineSeriesConfig } from '../../config/types';

beforeEach(() => {
  vi.stubGlobal('GPUBufferUsage', { STORAGE: 128, COPY_DST: 8 });
});

test('color attributes upload once, survive viewport preparation and release on replacement/disposal', () => {
  const buffers: { destroy: ReturnType<typeof vi.fn> }[] = [];
  const queue = { writeBuffer: vi.fn() };
  const device = {
    queue,
    createBuffer: vi.fn(() => {
      const buffer = { destroy: vi.fn() };
      buffers.push(buffer);
      return buffer;
    }),
  } as unknown as GPUDevice;
  const colors = createLinePointColors(device);
  const values = new Float32Array([1, 0, 0, 1, 0, 1, 0, 1]);
  expect(queue.writeBuffer).not.toHaveBeenCalled();
  const first = colors.prepare(values);
  expect(colors.prepare(values)).toBe(first);
  expect(queue.writeBuffer).toHaveBeenCalledTimes(1);
  expect(buffers[0]?.destroy).toHaveBeenCalledOnce();
  const second = colors.prepare(values.slice());
  expect(second).not.toBe(first);
  expect(buffers[1]?.destroy).toHaveBeenCalledOnce();
  colors.dispose();
  expect(buffers[2]?.destroy).toHaveBeenCalledOnce();
});

test('geometry operations cannot silently misalign per-point colors', () => {
  const base: LineSeriesConfig = {
    type: 'line',
    data: [
      [0, 1],
      [1, 2],
    ],
    pointColors: new Float32Array(8),
  };
  expect(() => validateLinePointColors(base, 'none', false)).not.toThrow();
  expect(() => validateLinePointColors({ ...base, pointColors: new Float32Array(4) }, 'none', false)).toThrow(/RGBA/);
  expect(() => validateLinePointColors(base, 'lttb', false)).toThrow(/geometry/);
  expect(() => validateLinePointColors(base, 'none', true)).toThrow(/geometry/);
  expect(() => validateLinePointColors({ ...base, connectNulls: true }, 'none', false)).toThrow(/geometry/);
  expect(() => validateLinePointColors({ ...base, step: true }, 'none', false)).toThrow(/geometry/);
});
