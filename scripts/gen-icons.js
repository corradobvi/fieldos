#!/usr/bin/env node
// MyVivaio PWA icon generator — pure Node.js stdlib, no external deps
'use strict';
const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

// ── brand ───────────────────────────────────────────────────────────────────
const BG = [4, 120, 87];     // #047857  emerald green
const FG = [255, 255, 255];  // white

// ── pixel glyphs (7 cols × 9 rows, 2-px stroke so readable at small sizes) ─
const M = [
  [1,1,0,0,0,1,1],
  [1,1,0,0,0,1,1],
  [1,1,1,0,1,1,1],
  [1,1,0,1,0,1,1],
  [1,1,0,0,0,1,1],
  [1,1,0,0,0,1,1],
  [1,1,0,0,0,1,1],
  [1,1,0,0,0,1,1],
  [1,1,0,0,0,1,1],
];
const V = [
  [1,1,0,0,0,1,1],
  [1,1,0,0,0,1,1],
  [1,1,0,0,0,1,1],
  [0,1,1,0,1,1,0],
  [0,1,1,0,1,1,0],
  [0,0,1,1,1,0,0],
  [0,0,0,1,0,0,0],
  [0,0,0,1,0,0,0],
  [0,0,0,0,0,0,0],
];
const GW = 7, GH = 9, GAP = 2; // glyph cols, rows, gap between letters

// ── CRC-32 for PNG chunks ────────────────────────────────────────────────────
function makeCRCTable() {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
}
const CRC_TABLE = makeCRCTable();
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ CRC_TABLE[(c ^ buf[i]) & 0xFF];
  return (c ^ 0xFFFFFFFF) >>> 0;
}

// ── PNG encoder (RGBA) ───────────────────────────────────────────────────────
function encodePNG(w, h, rgba) {
  function chunk(type, data) {
    const tb = Buffer.from(type, 'ascii');
    const db = Buffer.isBuffer(data) ? data : Buffer.from(data);
    const lenBuf = Buffer.alloc(4); lenBuf.writeUInt32BE(db.length);
    const payload = Buffer.concat([tb, db]);
    const crcBuf  = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(payload));
    return Buffer.concat([lenBuf, payload, crcBuf]);
  }

  // raw scanlines: filter byte (0) + RGBA rows
  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 4)] = 0; // filter = None
    for (let x = 0; x < w; x++) {
      const si = (y * w + x) * 4;
      const di = y * (1 + w * 4) + 1 + x * 4;
      raw[di]   = rgba[si];
      raw[di+1] = rgba[si+1];
      raw[di+2] = rgba[si+2];
      raw[di+3] = rgba[si+3];
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8]=8; ihdr[9]=6; // 8-bit RGBA

  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),  // PNG sig
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── draw one icon ─────────────────────────────────────────────────────────────
function makeIcon(size) {
  const pixels = new Uint8Array(size * size * 4);

  function setPixel(x, y, r, g, b, a=255) {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const i = (y * size + x) * 4;
    pixels[i]=r; pixels[i+1]=g; pixels[i+2]=b; pixels[i+3]=a;
  }

  // 1. green background
  for (let i = 0; i < size * size; i++) {
    pixels[i*4]=BG[0]; pixels[i*4+1]=BG[1]; pixels[i*4+2]=BG[2]; pixels[i*4+3]=255;
  }

  // 2. white rounded background card (85% of size, corner radius 18%)
  const pad   = Math.round(size * 0.075);
  const r     = Math.round(size * 0.18);
  const x0=pad, y0=pad, x1=size-1-pad, y1=size-1-pad;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      // rounded-corner test
      const inTL = x < x0+r && y < y0+r;
      const inTR = x > x1-r && y < y0+r;
      const inBL = x < x0+r && y > y1-r;
      const inBR = x > x1-r && y > y1-r;
      let inside = true;
      if (inTL) inside = Math.hypot(x-(x0+r), y-(y0+r)) <= r;
      if (inTR) inside = Math.hypot(x-(x1-r), y-(y0+r)) <= r;
      if (inBL) inside = Math.hypot(x-(x0+r), y-(y1-r)) <= r;
      if (inBR) inside = Math.hypot(x-(x1-r), y-(y1-r)) <= r;
      if (inside) setPixel(x, y, FG[0], FG[1], FG[2]);
    }
  }

  // 3. "MV" green letters on white card, centered
  const cardW = x1 - x0 + 1;
  const cardH = y1 - y0 + 1;

  const totalCols = GW + GAP + GW;
  // scale so text fills ~65% of card width, minimum 1
  const sc = Math.max(1, Math.floor(cardW * 0.65 / totalCols));
  const textW = totalCols * sc;
  const textH = GH * sc;
  const tx = x0 + Math.floor((cardW - textW) / 2);
  const ty = y0 + Math.floor((cardH - textH) / 2);

  function drawGlyph(glyph, offX) {
    for (let row = 0; row < GH; row++) {
      for (let col = 0; col < GW; col++) {
        if (!glyph[row][col]) continue;
        for (let dy = 0; dy < sc; dy++)
          for (let dx = 0; dx < sc; dx++)
            setPixel(offX + col*sc + dx, ty + row*sc + dy, BG[0], BG[1], BG[2]);
      }
    }
  }

  drawGlyph(M, tx);
  drawGlyph(V, tx + (GW + GAP) * sc);

  return encodePNG(size, size, pixels);
}

// ── generate all sizes ────────────────────────────────────────────────────────
const OUT = path.join(__dirname, 'icons');
// allow override via argument
const outDir = process.argv[2] || OUT;

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
for (const size of SIZES) {
  const buf = makeIcon(size);
  const p   = path.join(outDir, `icon-${size}.png`);
  fs.writeFileSync(p, buf);
  console.log(`  icon-${size}.png  ${buf.length} B`);
}
console.log('Done — all icons generated.');
