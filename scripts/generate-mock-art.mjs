import { readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = join(projectRoot, "public/test-fixtures/spotify-api.json");
const coverDirectory = join(projectRoot, "public/test-fixtures/covers");

const palettes = [
  ["#f1dfc8", "#312a38", "#ff7b9c", "#8cb8d8"],
  ["#1e3543", "#f5e8d5", "#f2a5b8", "#7ec9bd"],
  ["#d8c8f0", "#251e36", "#ffd166", "#6b5ca5"],
  ["#c9d8c4", "#253129", "#f48c8c", "#4b7362"],
  ["#29252d", "#f4e5c2", "#e26083", "#8ca6d8"],
  ["#f5cfd8", "#3a252e", "#9c4864", "#8bc6c1"],
];

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wrapTitle(value, width = 17, maxLines = 3) {
  const words = value.toUpperCase().split(/\s+/);
  const lines = [];
  for (const word of words) {
    const current = lines.at(-1);
    if (!current || `${current} ${word}`.length > width) {
      lines.push(word);
    } else {
      lines[lines.length - 1] = `${current} ${word}`;
    }
    if (lines.length === maxLines) break;
  }
  return lines;
}

function coverSvg(album, artist, number) {
  const [background, ink, accent, secondary] =
    palettes[(number - 1) % palettes.length];
  const variant = (number - 1) % 4;
  const shapes = [];

  if (variant === 0) {
    shapes.push(
      `<circle cx="465" cy="165" r="210" fill="${accent}" opacity=".82"/>`,
      `<circle cx="465" cy="165" r="125" fill="${background}"/>`,
      `<circle cx="465" cy="165" r="58" fill="${secondary}"/>`,
    );
  } else if (variant === 1) {
    for (let offset = -160; offset < 760; offset += 110) {
      shapes.push(
        `<path d="M${offset} 640 L${offset + 270} 0" stroke="${accent}" stroke-width="42" opacity=".78"/>`,
      );
    }
    shapes.push(
      `<rect x="375" y="70" width="195" height="195" rx="96" fill="${secondary}" opacity=".9"/>`,
    );
  } else if (variant === 2) {
    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 4; column += 1) {
        if ((row + column) % 2 === 0) {
          shapes.push(
            `<rect x="${310 + column * 72}" y="${32 + row * 72}" width="72" height="72" fill="${accent}" opacity=".72"/>`,
          );
        }
      }
    }
    shapes.push(
      `<path d="M30 520 C160 410 255 650 390 500 S600 380 650 455" fill="none" stroke="${secondary}" stroke-width="58"/>`,
    );
  } else {
    shapes.push(
      `<path d="M330 630 C340 405 240 365 390 215 C510 94 610 145 680 35 L680 680 Z" fill="${accent}" opacity=".83"/>`,
      `<ellipse cx="412" cy="260" rx="165" ry="78" fill="${secondary}" opacity=".9" transform="rotate(-22 412 260)"/>`,
      `<circle cx="548" cy="365" r="52" fill="${ink}" opacity=".8"/>`,
    );
  }

  const titleLines = wrapTitle(album.name);
  const titleMarkup = titleLines
    .map(
      (line, index) =>
        `<tspan x="46" dy="${index === 0 ? 0 : 64}">${escapeXml(line)}</tspan>`,
    )
    .join("");
  const artistName = escapeXml(artist.toUpperCase());

  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">
  <rect width="640" height="640" fill="${background}"/>
  ${shapes.join("\n  ")}
  <rect x="24" y="24" width="592" height="592" rx="16" fill="none" stroke="${ink}" stroke-width="6"/>
  <text x="46" y="72" fill="${ink}" font-family="Arial, sans-serif" font-size="19" font-weight="700" letter-spacing="4">SO SAD · ALBUM ${String(number).padStart(2, "0")}</text>
  <text x="46" y="405" fill="${ink}" font-family="Georgia, serif" font-size="54" font-weight="700">${titleMarkup}</text>
  <text x="48" y="590" fill="${ink}" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="2">${artistName}</text>
</svg>
`;
}

const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const albumsById = new Map();

for (const page of Object.values(fixture.tracks)) {
  for (const track of page.items) {
    if (!albumsById.has(track.album.id)) {
      albumsById.set(track.album.id, {
        album: track.album,
        artist: track.artists[0]?.name || "Unknown Artist",
      });
    }
  }
}

let number = 0;
const expectedFiles = new Set();
for (const [albumId, { album, artist }] of albumsById) {
  number += 1;
  const filename = `album-${String(number).padStart(2, "0")}.svg`;
  expectedFiles.add(filename);
  const url = `test-fixtures/covers/${filename}`;

  await writeFile(
    join(coverDirectory, filename),
    coverSvg(album, artist, number),
    "utf8",
  );

  for (const page of Object.values(fixture.tracks)) {
    for (const candidate of page.items) {
      if (candidate.album.id !== albumId) continue;
      candidate.album.images = [
        { height: 640, url, width: 640 },
        { height: 300, url, width: 300 },
        { height: 64, url, width: 64 },
      ];
    }
  }
}

for (const filename of await readdir(coverDirectory)) {
  if (/^(track|album)-.+\.svg$/.test(filename) && !expectedFiles.has(filename)) {
    await unlink(join(coverDirectory, filename));
  }
}

await writeFile(
  fixturePath,
  `${JSON.stringify(fixture, null, 2)}\n`,
  "utf8",
);

console.log(`Generated ${number} unique album covers in ${coverDirectory}`);
