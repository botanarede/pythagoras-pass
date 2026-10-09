import fs from 'fs';
import zlib from 'zlib';

/**
 * Creates a minimal valid RGBA PNG file of given width and height.
 */
function createPng(width, height, getPixel) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8 bits per channel
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // deflate
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // no interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 at start of each scanline
  const rawScanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * rawScanlineLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rawScanlineLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Colors for Pitágoras: Dark stadium background (#0f172a), emerald pitch, gold/cyan lines
function standardPixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dist = Math.hypot(x - cx, y - cy);
  const maxR = w * 0.45;

  if (dist > maxR) {
    // Outer border / background
    return [15, 23, 42, 255]; // #0f172a
  }

  // Pitch area
  if (x > w * 0.2 && x < w * 0.8 && y > h * 0.2 && y < h * 0.8) {
    // Triangle lines
    if (Math.abs(y - h * 0.7) < 3) return [245, 158, 11, 255]; // Amber leg A
    if (Math.abs(x - w * 0.7) < 3 && y > h * 0.3 && y < h * 0.7) return [6, 182, 212, 255]; // Cyan leg B
    return [21, 128, 61, 255]; // Emerald green pitch
  }

  return [30, 41, 59, 255];
}

// Generate files
if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

console.log('Generating PWA icons...');
const icon192 = createPng(192, 192, standardPixel);
fs.writeFileSync('public/pwa-192x192.png', icon192);

const icon512 = createPng(512, 512, standardPixel);
fs.writeFileSync('public/pwa-512x512.png', icon512);
fs.writeFileSync('public/pwa-maskable-512x512.png', icon512);

const appleIcon = createPng(180, 180, standardPixel);
fs.writeFileSync('public/apple-touch-icon.png', appleIcon);

console.log('PWA icons created successfully in public/');
