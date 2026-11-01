const SHARE_HASH_PREFIX = "#share=";
const SHARE_FORMAT_PREFIX = "gz.";
const MAX_SHARE_HASH_LENGTH = 300_000;
const MAX_SHARE_JSON_BYTES = 2_000_000;

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(index, index + chunkSize),
    );
  }
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error("The share payload contains invalid characters.");
  }
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function readStreamBytes(
  stream: ReadableStream<Uint8Array>,
  maxBytes: number,
): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new Error("This share snapshot is too large.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const output = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return output;
}

export async function encodeShareValue(value: unknown): Promise<string> {
  if (typeof CompressionStream !== "function") {
    throw new Error("This browser cannot create share links.");
  }

  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const stream = new Blob([toArrayBuffer(bytes)])
    .stream()
    .pipeThrough(new CompressionStream("gzip"));
  const compressed = new Uint8Array(
    await new Response(stream).arrayBuffer(),
  );
  const encoded = `${SHARE_FORMAT_PREFIX}${bytesToBase64Url(compressed)}`;
  if (encoded.length > MAX_SHARE_HASH_LENGTH) {
    throw new Error("This snapshot is too large to share in a URL.");
  }
  return encoded;
}

export function shareHashPrefix(): string {
  return SHARE_HASH_PREFIX;
}

export async function decodeShareHash(hash: string): Promise<unknown> {
  if (!hash.startsWith(SHARE_HASH_PREFIX)) {
    throw new Error("This share link uses an unsupported format.");
  }

  const token = hash.slice(SHARE_HASH_PREFIX.length);
  if (!token.startsWith(SHARE_FORMAT_PREFIX)) {
    throw new Error("This share link uses an unsupported compression format.");
  }

  const encoded = token
    .slice(SHARE_FORMAT_PREFIX.length)
    .replace(/^(?:gz\.)+/, "");
  if (!encoded || encoded.length > MAX_SHARE_HASH_LENGTH) {
    throw new Error("This share link is invalid or too large.");
  }
  if (typeof DecompressionStream !== "function") {
    throw new Error("This browser cannot open share links.");
  }

  let decompressed: Uint8Array;
  try {
    const stream = new Blob([toArrayBuffer(base64UrlToBytes(encoded))])
      .stream()
      .pipeThrough(new DecompressionStream("gzip"));
    decompressed = await readStreamBytes(stream, MAX_SHARE_JSON_BYTES);
  } catch {
    throw new Error("This share link is invalid or damaged.");
  }

  try {
    return JSON.parse(new TextDecoder().decode(decompressed));
  } catch {
    throw new Error("This share link does not contain valid snapshot data.");
  }
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}
