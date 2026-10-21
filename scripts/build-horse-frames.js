const fs = require('fs');
const buf = fs.readFileSync('horse_sprite.bmp');
const dataOffset = buf.readUInt32LE(10);
const width = 188;
const height = 128;
const rowBytes = 24;

const pixels = [];
for (let y = 0; y < height; y++) {
  const rowY = height - 1 - y;
  const rowOffset = dataOffset + rowY * rowBytes;
  const row = [];
  for (let x = 0; x < width; x++) {
    const byteIdx = rowOffset + Math.floor(x / 8);
    const bitIdx = 7 - (x % 8);
    row.push((buf[byteIdx] >> bitIdx) & 1);
  }
  pixels.push(row);
}

const tileW = 47;
const tileH = 32;
const asciiFrames = [];

for (let f = 0; f < 15; f++) {
  const col = f % 4;
  const row = Math.floor(f / 4);
  const lines = [];
  for (let y = 0; y < tileH; y++) {
    let line = '';
    for (let x = 0; x < tileW; x++) {
      const px = pixels[row * tileH + y][col * tileW + x];
      if (!px) {
        line += ' ';
      } else {
        let neighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = row * tileH + y + dy;
            const nx = col * tileW + x + dx;
            if (ny >= 0 && ny < height && nx >= 0 && nx < width && pixels[ny][nx]) {
              neighbors++;
            }
          }
        }
        if (neighbors >= 8) line += '#';
        else if (neighbors >= 6) line += '*';
        else if (neighbors >= 3) line += '+';
        else line += ':';
      }
    }
    lines.push(line);
  }
  asciiFrames.push(lines);
}

const fileContent = `/* ── Orbyt · Authentic Muybridge 1878 ASCII Galloping Horse ───────────
   Historic 15-frame motion study from Eadweard Muybridge's "The Horse in Motion" (1878).
   Extracted from the master equine motion plates.
   Width: 47 chars, Height: 32 chars per frame.
   Shading density ramp: [ ':' edge / hoof, '+' muscle contour, '*' body, '#' dense core ].
*/

export const HORSE_FRAME_WIDTH = 47;
export const HORSE_FRAME_HEIGHT = 32;
export const HORSE_FRAME_COUNT = 15;

export const MUYBRIDGE_ASCII_FRAMES: string[][] = ${JSON.stringify(asciiFrames, null, 2)};
`;

fs.writeFileSync('src/components/orbyt/horse-frames.ts', fileContent, 'utf8');
console.log('✓ Wrote src/components/orbyt/horse-frames.ts with 15 Muybridge ASCII frames');
