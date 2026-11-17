// PCM16 mono from OpenAI Realtime becomes a seekable browser audio asset.
export function pcmToWav(pcm, sampleRate = 24000) {
  if (!Buffer.isBuffer(pcm) || !pcm.length || pcm.length % 2 !== 0)
    throw new Error("Invalid PCM16 audio");
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

export function narrationSimilarity(expected, actual) {
  const words = (value) =>
    value
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/u)
      .filter(Boolean);
  const a = words(expected),
    b = words(actual);
  if (!a.length || !b.length) return 0;
  // LCS accounts for harmless punctuation/number normalization while detecting
  // a response that discusses the passage instead of reading it.
  let previous = new Uint16Array(b.length + 1);
  for (const word of a) {
    const next = new Uint16Array(b.length + 1);
    for (let j = 1; j <= b.length; j++)
      next[j] =
        word === b[j - 1]
          ? previous[j - 1] + 1
          : Math.max(previous[j], next[j - 1]);
    previous = next;
  }
  return (2 * previous[b.length]) / (a.length + b.length);
}

/** Trim only near-silent edges; keep a small breath around each spoken phrase. */
export function trimPcm(pcm, sampleRate = 24000) {
  const count = pcm.length / 2;
  let first = 0,
    last = count - 1;
  while (first < count && Math.abs(pcm.readInt16LE(first * 2)) < 220) first++;
  while (last > first && Math.abs(pcm.readInt16LE(last * 2)) < 220) last--;
  if (first === count) throw new Error("Empty narration");
  const padding = Math.round(sampleRate * 0.06);
  return pcm.subarray(
    Math.max(0, first - padding) * 2,
    Math.min(count, last + padding + 1) * 2,
  );
}

export function joinNarrationClips(clips, sampleRate = 24000) {
  const buffers = [],
    cues = [];
  let byteOffset = 0;
  for (const [index, clip] of clips.entries()) {
    const pcm = trimPcm(clip.pcm, sampleRate);
    const gap =
      index < clips.length - 1
        ? Buffer.alloc(Math.round(sampleRate * 0.12) * 2)
        : Buffer.alloc(0);
    const start = byteOffset / (sampleRate * 2);
    byteOffset += pcm.length + gap.length;
    cues.push({ text: clip.text, start, end: byteOffset / (sampleRate * 2) });
    buffers.push(pcm, gap);
  }
  return {
    pcm: Buffer.concat(buffers),
    cues,
    duration: byteOffset / (sampleRate * 2),
  };
}
