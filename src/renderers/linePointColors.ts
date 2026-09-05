/** One attribute buffer per line; viewport and uniform changes retain it. */
export function createLinePointColors(device: GPUDevice) {
  let previous: Float32Array | undefined;
  let buffer = device.createBuffer({
    label: 'lineRenderer/pointColors',
    size: 16,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  return {
    prepare(values: Float32Array | undefined): GPUBuffer {
      if (previous === values) return buffer;
      const next = device.createBuffer({
        label: 'lineRenderer/pointColors',
        size: Math.max(16, values?.byteLength ?? 0),
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
      if (values !== undefined && values.length > 0)
        device.queue.writeBuffer(next, 0, values.buffer as ArrayBuffer, values.byteOffset, values.byteLength);
      buffer.destroy();
      buffer = next;
      previous = values;
      return buffer;
    },
    dispose(): void {
      buffer.destroy();
      previous = undefined;
    },
  };
}
