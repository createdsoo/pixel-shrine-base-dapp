import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(new URL("..", import.meta.url).pathname);
const outDir = join(root, "base-submission");
const W = 1284;
const H = 2778;

const c = {
  bg: "#f8f3df",
  ink: "#101827",
  pink: "#ff5d8f",
  yellow: "#ffef8a",
  green: "#7bf1a8",
  blue: "#70d6ff",
  purple: "#be95ff",
};

function esc(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function frame(content) {
  return `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
        <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(16,24,39,0.10)" stroke-width="3"/>
      </pattern>
    </defs>
    <rect width="${W}" height="${H}" fill="${c.bg}"/>
    <rect width="${W}" height="${H}" fill="url(#grid)"/>
    ${content}
  </svg>`;
}

function block(x, y, w, h, fill = c.yellow) {
  return `<rect x="${x + 10}" y="${y + 10}" width="${w}" height="${h}" fill="${c.ink}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${c.ink}" stroke-width="6"/>`;
}

function title(text, sub) {
  return `
    ${block(54, 54, 1176, 270, c.yellow)}
    <text x="92" y="128" font-family="Courier New, monospace" font-size="34" font-weight="900" fill="${c.ink}">PIXEL SHRINE</text>
    <text x="92" y="212" font-family="Arial, sans-serif" font-size="76" font-weight="900" fill="${c.ink}">${esc(text)}</text>
    <text x="96" y="274" font-family="Arial, sans-serif" font-size="30" font-weight="800" fill="${c.ink}">${esc(sub)}</text>
  `;
}

function charm(x, y, size, a, b, d, symbol) {
  const cell = size / 8;
  let rects = "";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const edge = row === 0 || col === 0 || row === 7 || col === 7;
      const cross = row === col || row + col === 7;
      const center = row >= 2 && row <= 5 && col >= 2 && col <= 5;
      const fill = edge ? b : cross ? d : center ? a : c.ink;
      rects += `<rect x="${x + col * cell}" y="${y + row * cell}" width="${cell - 5}" height="${cell - 5}" fill="${fill}"/>`;
    }
  }
  return `
    <rect x="${x + 14}" y="${y + 14}" width="${size}" height="${size + 104}" fill="${c.ink}"/>
    <rect x="${x - 10}" y="${y - 10}" width="${size + 20}" height="${size + 124}" fill="${c.ink}"/>
    <rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${c.ink}"/>
    ${rects}
    <rect x="${x}" y="${y + size + 26}" width="${size}" height="78" fill="${c.bg}" stroke="${c.ink}" stroke-width="6"/>
    <text x="${x + size / 2}" y="${y + size + 78}" text-anchor="middle" font-family="Courier New, monospace" font-size="34" font-weight="900" fill="${c.ink}">${esc(symbol)}</text>
  `;
}

function card(x, y, w, h, label, lines, fill = c.bg) {
  return `
    ${block(x, y, w, h, fill)}
    <text x="${x + 28}" y="${y + 54}" font-family="Courier New, monospace" font-size="22" font-weight="900" fill="${c.ink}">${esc(label)}</text>
    ${lines.map((line, i) => `<text x="${x + 28}" y="${y + 112 + i * 40}" font-family="Arial, sans-serif" font-size="${i === 0 ? 36 : 28}" font-weight="900" fill="${c.ink}">${esc(line)}</text>`).join("")}
  `;
}

function screenshot1() {
  return frame(`
    ${title("Mint tiny pixel wishes.", "Pick colors, choose a symbol, and save the charm on Base.")}
    ${card(72, 380, 548, 250, "COMPOSER", ["Lucky Build", "STAR", "Pink / Gold / Mint"], c.green)}
    ${card(664, 380, 548, 250, "ONE GLANCE", ["Pixel charm preview", "Clear on mobile"], c.blue)}
    ${charm(322, 720, 640, c.pink, c.yellow, c.green, "STAR")}
    ${card(72, 1710, 1140, 250, "WISH NOTE", ["A tiny pixel charm for shipping with focus, luck, and color on Base."], c.bg)}
    <rect x="72" y="2528" width="1140" height="116" fill="${c.green}" stroke="${c.ink}" stroke-width="6"/>
    <text x="642" y="2600" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="${c.ink}">MINT ON BASE</text>
  `);
}

function screenshot2() {
  return frame(`
    ${title("A collectible charm view.", "The output feels like a playful pixel object, not another plain form.")}
    ${charm(322, 410, 640, c.blue, "#ffffff", c.purple, "MOON")}
    ${card(72, 1405, 548, 245, "KEEPER", ["0x9936...9652", "Saved on Base"], c.yellow)}
    ${card(664, 1405, 548, 245, "CHARM", ["Moon Window", "Blue / White / Purple"], c.green)}
    ${card(72, 1705, 1140, 250, "WHY IT WORKS", ["Small personal collectible with color, symbol, note, keeper, and timestamp."], c.bg)}
  `);
}

function screenshot3() {
  return frame(`
    ${title("Reload charms by ID.", "Open previous charms and show who kept them, when, and why.")}
    ${card(72, 380, 1140, 230, "LOOKUP", ["Charm ID 12", "Keeper 0x9936...9652", "Created on Base"], c.blue)}
    ${charm(322, 690, 640, c.green, c.ink, c.pink, "SEED")}
    ${card(72, 1685, 548, 250, "ARCHIVE", ["Tiny keepsakes", "Easy to revisit"], c.yellow)}
    ${card(664, 1685, 548, 250, "USE CASE", ["Luck, goals, launches", "Personal expression"], c.green)}
  `);
}

function iconSvg() {
  return frame(`
    <rect width="1024" height="1024" fill="${c.bg}"/>
    ${charm(232, 170, 560, c.pink, c.yellow, c.green, "STAR")}
  `.replace(`width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"`, 'width="1024" height="1024" viewBox="0 0 1024 1024"'));
}

function thumbnailSvg() {
  return `
  <svg width="1910" height="1000" viewBox="0 0 1910 1000" xmlns="http://www.w3.org/2000/svg">
    <rect width="1910" height="1000" fill="${c.bg}"/>
    <text x="96" y="168" font-family="Arial, sans-serif" font-size="118" font-weight="900" fill="${c.ink}">Pixel Shrine</text>
    <text x="102" y="236" font-family="Arial, sans-serif" font-size="42" font-weight="800" fill="${c.ink}">Mint tiny pixel wishes on Base.</text>
    ${charm(150, 330, 500, c.pink, c.yellow, c.green, "STAR")}
    ${card(820, 350, 760, 220, "MAKE A CHARM", ["Title, symbol, colors, note"], c.green)}
    ${card(820, 620, 760, 220, "SAVE ON BASE", ["Reload by charm ID later"], c.blue)}
  </svg>`;
}

async function writePng(name, svg, width = W, height = H) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg)).resize(width, height).png({ compressionLevel: 9 }).toFile(file);
  return file;
}

async function writeJpg(name, svg, width, height) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg)).resize(width, height).jpeg({ quality: 86, mozjpeg: true }).toFile(file);
  return file;
}

await mkdir(outDir, { recursive: true });

const files = [
  await writeJpg("app-icon.jpg", iconSvg(), 1024, 1024),
  await writeJpg("app-thumbnail.jpg", thumbnailSvg(), 1910, 1000),
  await writePng("screenshot-1.png", screenshot1()),
  await writePng("screenshot-2.png", screenshot2()),
  await writePng("screenshot-3.png", screenshot3()),
];

await writeFile(
  join(outDir, "asset-manifest.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), files }, null, 2),
  "utf8",
);

for (const file of files) console.log(file);
