type DownloadData = BlobPart | Uint8Array<ArrayBufferLike>;

function toBlobPart(data: DownloadData): BlobPart {
  if (data instanceof Uint8Array) {
    const copy = new Uint8Array(data.byteLength);
    copy.set(data);
    return copy.buffer;
  }
  return data;
}

export function downloadBytes(
  bytes: DownloadData,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([toBlobPart(bytes)], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadText(text: string, filename: string, mimeType = 'application/json'): void {
  downloadBytes(text, filename, mimeType);
}
