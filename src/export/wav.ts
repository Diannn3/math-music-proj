export function encodePcm16Wave(
  channels: readonly Float32Array[],
  sampleRate: number,
): Uint8Array {
  if (channels.length < 1) throw new RangeError('At least one channel is required.');
  if (!Number.isFinite(sampleRate) || sampleRate <= 0) throw new RangeError('sampleRate must be positive.');

  const frameCount = channels[0].length;
  if (!channels.every((channel) => channel.length === frameCount)) {
    throw new RangeError('All channels must have the same frame count.');
  }

  const channelCount = channels.length;
  const bytesPerSample = 2;
  const blockAlign = channelCount * bytesPerSample;
  const dataBytes = frameCount * blockAlign;
  const buffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buffer);

  const writeAscii = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeAscii(0, 'RIFF');
  view.setUint32(4, 36 + dataBytes, true);
  writeAscii(8, 'WAVE');
  writeAscii(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, Math.round(sampleRate), true);
  view.setUint32(28, Math.round(sampleRate) * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeAscii(36, 'data');
  view.setUint32(40, dataBytes, true);

  let offset = 44;
  for (let frame = 0; frame < frameCount; frame += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channels[channel][frame]));
      const integer = sample < 0 ? Math.round(sample * 0x8000) : Math.round(sample * 0x7fff);
      view.setInt16(offset, integer, true);
      offset += 2;
    }
  }

  return new Uint8Array(buffer);
}

export function audioBufferToWaveBytes(buffer: AudioBuffer): Uint8Array {
  const channels = Array.from(
    { length: buffer.numberOfChannels },
    (_, channel) => buffer.getChannelData(channel),
  );
  return encodePcm16Wave(channels, buffer.sampleRate);
}
