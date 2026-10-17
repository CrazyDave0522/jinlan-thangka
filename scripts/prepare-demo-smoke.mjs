// Offline fixture preparation only. No environment files, network or paid calls.
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const directory = "evaluation-results/demo-release-inputs";
await mkdir(directory, { recursive: true });
const drawings = [
  { name: "01-square.png", label: "1", shape: '<rect x="240" y="130" width="320" height="320" fill="#b32737"/>', expected: "Red square; small bottom-right code K7", detail: "K7" },
  { name: "02-circle.png", label: "2", shape: '<circle cx="400" cy="290" r="160" fill="#245ec2"/>', expected: "Blue circle", detail: "" },
  { name: "03-triangle.png", label: "3", shape: '<path d="M400 120 L580 450 L220 450 Z" fill="#238344"/>', expected: "Green triangle", detail: "" },
  { name: "04-diamond.png", label: "4", shape: '<path d="M400 110 L570 290 L400 470 L230 290 Z" fill="#e7b52b"/>', expected: "Yellow diamond", detail: "" },
  { name: "05-draft-only.png", label: "DRAFT", shape: '<path d="M240 150 L560 430 M560 150 L240 430" stroke="#743fb0" stroke-width="50"/>', expected: "Purple cross; independent unsent draft", detail: "" },
];
const files = [];
for (const drawing of drawings) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#fffdf6"/><text x="40" y="70" font-family="sans-serif" font-size="48" fill="#222">${drawing.label}</text>${drawing.shape}<text x="735" y="565" font-family="sans-serif" font-size="18" fill="#222">${drawing.detail}</text></svg>`;
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  if (png.byteLength > 500_000) throw new Error("Synthetic input exceeds prepared-image byte budget");
  await writeFile(`${directory}/${drawing.name}`, png);
  files.push({ name: drawing.name, bytes: png.byteLength, sha256: createHash("sha256").update(png).digest("hex"), width: 800, height: 600, expected: drawing.expected });
}
await writeFile(`${directory}/manifest.json`, JSON.stringify({
  purpose: "Synthetic visitor inputs only; never archive records or product examples. Fifth image remains an unsent draft.",
  browserPreparation: "Freeze hashes/dimensions of the actual browser-prepared copies before dispatch; original hashes below do not establish prepared bytes.",
  files,
}, null, 2));
console.log(`Prepared ${files.length} synthetic images and a manifest under ${directory}; no network or provider calls.`);
