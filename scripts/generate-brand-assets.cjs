const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xFF];
  }
  return (c ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  chunk.writeUInt32BE(crc32(typeAndData), 8 + len);
  return chunk;
}

function encodePng(width, height, rawData) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk('IHDR', ihdrData);

  const stride = 1 + width * 4;
  const filtered = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    filtered[y * stride] = 0; // Filter None
    rawData.copy(filtered, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idatData = zlib.deflateSync(filtered, { level: 9 });
  const idat = makeChunk('IDAT', idatData);
  const iend = makeChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([sig, ihdr, idat, iend]);
}

function decodePng(buffer) {
  let pos = 8;
  const chunks = [];
  let width = 0, height = 0;
  while (pos < buffer.length) {
    const len = buffer.readUInt32BE(pos);
    const type = buffer.toString('ascii', pos + 4, pos + 8);
    if (type === 'IHDR') {
      width = buffer.readUInt32BE(pos + 8);
      height = buffer.readUInt32BE(pos + 12);
    } else if (type === 'IDAT') chunks.push(buffer.subarray(pos + 8, pos + 8 + len));
    pos += 12 + len;
  }
  const decompressed = zlib.inflateSync(Buffer.concat(chunks));
  const stride = 1 + width * 4;
  const raw = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    const filter = decompressed[y * stride];
    const rowSrc = y * stride + 1;
    const rowDst = y * width * 4;
    for (let x = 0; x < width * 4; x++) {
      let val = decompressed[rowSrc + x];
      let left = x >= 4 ? raw[rowDst + x - 4] : 0;
      let up = y > 0 ? raw[(y - 1) * width * 4 + x] : 0;
      let upleft = (y > 0 && x >= 4) ? raw[(y - 1) * width * 4 + x - 4] : 0;
      if (filter === 1) val = (val + left) & 0xff;
      else if (filter === 2) val = (val + up) & 0xff;
      else if (filter === 3) val = (val + Math.floor((left + up) / 2)) & 0xff;
      else if (filter === 4) {
        let p = left + up - upleft;
        let pa = Math.abs(p - left), pb = Math.abs(p - up), pc = Math.abs(p - upleft);
        let pr = (pa <= pb && pa <= pc) ? left : (pb <= pc ? up : upleft);
        val = (val + pr) & 0xff;
      }
      raw[rowDst + x] = val;
    }
  }
  return { width, height, data: raw };
}

// Resampling using box filter / area averaging
function resize(src, dstW, dstH) {
  const dst = Buffer.alloc(dstW * dstH * 4);
  const xRatio = src.width / dstW;
  const yRatio = src.height / dstH;

  for (let dy = 0; dy < dstH; dy++) {
    const srcYStart = dy * yRatio;
    const srcYEnd = (dy + 1) * yRatio;
    const y0 = Math.floor(srcYStart);
    const y1 = Math.min(Math.ceil(srcYEnd), src.height);

    for (let dx = 0; dx < dstW; dx++) {
      const srcXStart = dx * xRatio;
      const srcXEnd = (dx + 1) * xRatio;
      const x0 = Math.floor(srcXStart);
      const x1 = Math.min(Math.ceil(srcXEnd), src.width);

      let rSum = 0, gSum = 0, bSum = 0, aSum = 0, weightSum = 0;

      for (let sy = y0; sy < y1; sy++) {
        const yWeight = Math.min(sy + 1, srcYEnd) - Math.max(sy, srcYStart);
        for (let sx = x0; sx < x1; sx++) {
          const xWeight = Math.min(sx + 1, srcXEnd) - Math.max(sx, srcXStart);
          const weight = xWeight * yWeight;
          const sIdx = (sy * src.width + sx) * 4;
          const a = src.data[sIdx + 3] / 255;

          rSum += src.data[sIdx] * a * weight;
          gSum += src.data[sIdx + 1] * a * weight;
          bSum += src.data[sIdx + 2] * a * weight;
          aSum += src.data[sIdx + 3] * weight;
          weightSum += weight;
        }
      }

      const dIdx = (dy * dstW + dx) * 4;
      const finalA = aSum / weightSum;
      if (finalA > 0.001) {
        const alphaScale = 255 / finalA;
        dst[dIdx] = Math.round(Math.min(255, Math.max(0, (rSum / weightSum) * alphaScale)));
        dst[dIdx + 1] = Math.round(Math.min(255, Math.max(0, (gSum / weightSum) * alphaScale)));
        dst[dIdx + 2] = Math.round(Math.min(255, Math.max(0, (bSum / weightSum) * alphaScale)));
        dst[dIdx + 3] = Math.round(Math.min(255, Math.max(0, finalA)));
      } else {
        dst[dIdx] = 0;
        dst[dIdx + 1] = 0;
        dst[dIdx + 2] = 0;
        dst[dIdx + 3] = 0;
      }
    }
  }
  return { width: dstW, height: dstH, data: dst };
}

// Crop rectangle from image
function crop(src, x, y, w, h) {
  const dst = Buffer.alloc(w * h * 4);
  for (let dy = 0; dy < h; dy++) {
    const sy = y + dy;
    if (sy >= 0 && sy < src.height) {
      for (let dx = 0; dx < w; dx++) {
        const sx = x + dx;
        if (sx >= 0 && sx < src.width) {
          const sIdx = (sy * src.width + sx) * 4;
          const dIdx = (dy * w + dx) * 4;
          dst[dIdx] = src.data[sIdx];
          dst[dIdx + 1] = src.data[sIdx + 1];
          dst[dIdx + 2] = src.data[sIdx + 2];
          dst[dIdx + 3] = src.data[sIdx + 3];
        }
      }
    }
  }
  return { width: w, height: h, data: dst };
}

// Create an ICO file with multiple PNG images
function createIco(pngBuffers) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = ICO
  header.writeUInt16LE(pngBuffers.length, 4); // count

  let offset = 6 + pngBuffers.length * 16;
  const entries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(item.buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map(p => p.buffer)]);
}

// Create an image on a background with padding (e.g. for app-icon)
function placeOnCanvas(src, canvasSize, padding, bgColor) {
  const canvas = Buffer.alloc(canvasSize * canvasSize * 4);
  const targetInnerSize = canvasSize - padding * 2;
  const scale = Math.min(targetInnerSize / src.width, targetInnerSize / src.height);
  const scaledW = Math.round(src.width * scale);
  const scaledH = Math.round(src.height * scale);
  const scaled = resize(src, scaledW, scaledH);

  const startX = Math.round((canvasSize - scaledW) / 2);
  const startY = Math.round((canvasSize - scaledH) / 2);

  // Fill background
  for (let y = 0; y < canvasSize; y++) {
    for (let x = 0; x < canvasSize; x++) {
      const idx = (y * canvasSize + x) * 4;
      if (bgColor) {
        canvas[idx] = bgColor[0];
        canvas[idx + 1] = bgColor[1];
        canvas[idx + 2] = bgColor[2];
        canvas[idx + 3] = bgColor[3];
      }
    }
  }

  // Blend scaled image over background
  for (let dy = 0; dy < scaledH; dy++) {
    const cy = startY + dy;
    if (cy < 0 || cy >= canvasSize) continue;
    for (let dx = 0; dx < scaledW; dx++) {
      const cx = startX + dx;
      if (cx < 0 || cx >= canvasSize) continue;
      const sIdx = (dy * scaledW + dx) * 4;
      const dIdx = (cy * canvasSize + cx) * 4;
      const sA = scaled.data[sIdx + 3] / 255;
      if (sA <= 0) continue;

      const dA = canvas[dIdx + 3] / 255;
      const outA = sA + dA * (1 - sA);
      if (outA > 0) {
        const outR = (scaled.data[sIdx] * sA + canvas[dIdx] * dA * (1 - sA)) / outA;
        const outG = (scaled.data[sIdx + 1] * sA + canvas[dIdx + 1] * dA * (1 - sA)) / outA;
        const outB = (scaled.data[sIdx + 2] * sA + canvas[dIdx + 2] * dA * (1 - sA)) / outA;
        canvas[dIdx] = Math.round(outR);
        canvas[dIdx + 1] = Math.round(outG);
        canvas[dIdx + 2] = Math.round(outB);
        canvas[dIdx + 3] = Math.round(outA * 255);
      }
    }
  }

  return { width: canvasSize, height: canvasSize, data: canvas };
}

// Invert color (e.g. turn dark artwork into white for dark surfaces)
function invertToLight(src) {
  const dst = Buffer.alloc(src.width * src.height * 4);
  for (let i = 0; i < src.data.length; i += 4) {
    const a = src.data[i + 3];
    if (a > 0) {
      dst[i] = 255;     // white
      dst[i + 1] = 255;
      dst[i + 2] = 255;
      dst[i + 3] = a;
    }
  }
  return { width: src.width, height: src.height, data: dst };
}

// Add subtle contrast halo to white mark so it pops on dark tabs AND remains readable on light tabs
function addContrastHalo(src, radius = 2, opacity = 0.35) {
  const w = src.width;
  const h = src.height;
  const dst = Buffer.alloc(w * h * 4);
  const alpha = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    alpha[i] = src.data[i * 4 + 3] / 255;
  }

  const shadow = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let maxA = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= h) continue;
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= w) continue;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= radius) {
            const a = alpha[ny * w + nx] * (1 - dist / (radius + 1));
            if (a > maxA) maxA = a;
          }
        }
      }
      shadow[y * w + x] = maxA * opacity;
    }
  }

  for (let i = 0; i < w * h; i++) {
    const sA = shadow[i];
    const mA = alpha[i];
    const outA = mA + sA * (1 - mA);
    if (outA > 0.001) {
      const outR = (255 * mA + 0 * sA * (1 - mA)) / outA;
      dst[i * 4] = Math.round(outR);
      dst[i * 4 + 1] = Math.round(outR);
      dst[i * 4 + 2] = Math.round(outR);
      dst[i * 4 + 3] = Math.round(outA * 255);
    }
  }
  return { width: w, height: h, data: dst };
}

// Execution
const originalBuffer = fs.readFileSync(path.join(__dirname, '../public/findyourcclogo2-original.png'));
const original = decodePng(originalBuffer);
console.log('Original dimensions:', original.width, 'x', original.height);

// 1. Full logo bounds (artwork): minX: 389, maxX: 1147, minY: 174, maxY: 824
const logoPad = 24;
const logoX = Math.max(0, 389 - logoPad);
const logoY = Math.max(0, 174 - logoPad);
const logoW = Math.min(original.width - logoX, 1147 - 389 + 1 + logoPad * 2);
const logoH = Math.min(original.height - logoY, 824 - 174 + 1 + logoPad * 2);
const fullLogo = crop(original, logoX, logoY, logoW, logoH);
console.log('Cropped full logo:', fullLogo.width, 'x', fullLogo.height);
const fullLogoPng = encodePng(fullLogo.width, fullLogo.height, fullLogo.data);
fs.writeFileSync(path.join(__dirname, '../public/findyourcclogo2.png'), fullLogoPng);

// 2. Mark bounds (emblem): minX: 516, maxX: 1018, minY: 174, maxY: 684 (w: 503, h: 511)
const markPad = 20;
const markSize = Math.max(503, 511) + markPad * 2;
const markCenterX = Math.round((516 + 1018) / 2);
const markCenterY = Math.round((174 + 684) / 2);
const markX = markCenterX - Math.floor(markSize / 2);
const markY = markCenterY - Math.floor(markSize / 2);
const markSquare = crop(original, markX, markY, markSize, markSize);
console.log('Mark square:', markSquare.width, 'x', markSquare.height);
const markPng = encodePng(markSquare.width, markSquare.height, markSquare.data);
fs.writeFileSync(path.join(__dirname, '../public/findyourcclogo2-mark.png'), markPng);

// 3. Mark in pure white for dark surfaces and favicons
const whiteMark = invertToLight(markSquare);
const whiteMarkPng = encodePng(whiteMark.width, whiteMark.height, whiteMark.data);
fs.writeFileSync(path.join(__dirname, '../public/findyourcclogo2-mark-white.png'), whiteMarkPng);

// White mark with subtle contrast halo for favicons
const whiteFaviconSource = addContrastHalo(whiteMark, 4, 0.4);
const whiteFaviconPng = encodePng(whiteFaviconSource.width, whiteFaviconSource.height, whiteFaviconSource.data);
fs.writeFileSync(path.join(__dirname, '../public/favicon-white.png'), whiteFaviconPng);

// 4. Favicon ICO (16x16, 32x32, 48x48) - now in WHITE
const ico16 = resize(whiteFaviconSource, 16, 16);
const ico32 = resize(whiteFaviconSource, 32, 32);
const ico48 = resize(whiteFaviconSource, 48, 48);

const icoBuffer = createIco([
  { width: 16, height: 16, buffer: encodePng(16, 16, ico16.data) },
  { width: 32, height: 32, buffer: encodePng(32, 32, ico32.data) },
  { width: 48, height: 48, buffer: encodePng(48, 48, ico48.data) },
]);
fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), icoBuffer);
console.log('Wrote public/favicon.ico (white edition)');

// 5. Apple touch icon: 180x180 (iOS requires solid background)
const appleIcon = placeOnCanvas(whiteMark, 180, 24, [15, 23, 42, 255]);
fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon.png'), encodePng(180, 180, appleIcon.data));
console.log('Wrote public/apple-touch-icon.png');

// 6. PWA icons: icon-192.png, icon-512.png
const pwa192 = placeOnCanvas(whiteMark, 192, 28, [15, 23, 42, 255]);
fs.writeFileSync(path.join(__dirname, '../public/icon-192.png'), encodePng(192, 192, pwa192.data));

const pwa512 = placeOnCanvas(whiteMark, 512, 70, [15, 23, 42, 255]);
fs.writeFileSync(path.join(__dirname, '../public/icon-512.png'), encodePng(512, 512, pwa512.data));

const maskable512 = placeOnCanvas(whiteMark, 512, 110, [15, 23, 42, 255]);
fs.writeFileSync(path.join(__dirname, '../public/icon-maskable-512.png'), encodePng(512, 512, maskable512.data));
console.log('Wrote PWA icons');

// 7. SVG Favicon: pure white mark with subtle drop-shadow filter
const base64WhiteMark = whiteMarkPng.toString('base64');
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
    <feDropShadow dx="0" dy="1" stdDeviation="3" flood-color="#000000" flood-opacity="0.45"/>
  </filter>
  <image href="data:image/png;base64,${base64WhiteMark}" x="0" y="0" width="512" height="512" filter="url(#shadow)" />
</svg>
`;
fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), svgContent);
console.log('Wrote public/favicon.svg (white edition)');
