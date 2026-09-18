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


export type Pcm16WaveInfo = {
  channels: number;
  sampleRate: number;
  bitsPerSample: number;
  dataBytes: number;
  frameCount: number;
  durationSeconds: number;
};

function readAscii(view: DataView, offset: number, length: number): string {
  let value = '';
  for (let index = 0; index < length; index += 1) {
    value += String.fromCharCode(view.getUint8(offset + index));
  }
  return value;
}

export function inspectPcm16Wave(bytes: Uint8Array): Pcm16WaveInfo {
  if (bytes.byteLength < 44) throw new RangeError('WAV payload is shorter than the canonical 44-byte PCM header.');

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (readAscii(view, 0, 4) !== 'RIFF') throw new Error('Missing RIFF signature.');
  if (readAscii(view, 8, 4) !== 'WAVE') throw new Error('Missing WAVE signature.');
  if (readAscii(view, 12, 4) !== 'fmt ') throw new Error('Expected PCM fmt chunk at byte 12.');
  if (view.getUint32(16, true) !== 16) throw new Error('Expected canonical 16-byte PCM fmt chunk.');
  if (view.getUint16(20, true) !== 1) throw new Error('WAV encoding is not linear PCM.');
  if (readAscii(view, 36, 4) !== 'data') throw new Error('Expected data chunk at byte 36.');

  const channels = view.getUint16(22, true);
  const sampleRate = view.getUint32(24, true);
  const blockAlign = view.getUint16(32, true);
  const bitsPerSample = view.getUint16(34, true);
  const dataBytes = view.getUint32(40, true);
  const declaredRiffBytes = view.getUint32(4, true) + 8;

  if (channels < 1) throw new Error('WAV declares zero channels.');
  if (sampleRate < 1) throw new Error('WAV declares an invalid sample rate.');
  if (bitsPerSample !== 16) throw new Error(`Expected PCM16, received ${bitsPerSample}-bit samples.`);
  if (blockAlign !== channels * 2) throw new Error('WAV block alignment is inconsistent with PCM16 channel count.');
  if (declaredRiffBytes !== bytes.byteLength) throw new Error('RIFF size field does not match payload length.');
  if (44 + dataBytes !== bytes.byteLength) throw new Error('WAV data chunk size does not match payload length.');
  if (dataBytes % blockAlign !== 0) throw new Error('WAV data chunk does not contain a whole number of frames.');

  const frameCount = dataBytes / blockAlign;
  return {
    channels,
    sampleRate,
    bitsPerSample,
    dataBytes,
    frameCount,
    durationSeconds: frameCount / sampleRate,
  };
}
