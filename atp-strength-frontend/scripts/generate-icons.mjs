import sharp from "sharp";
import fs from "node:fs";

const svg192 = fs.readFileSync("public/icon-192.svg");
const svg512 = fs.readFileSync("public/icon-512.svg");

async function generate() {
  // 1. Standard PNG icons
  await sharp(svg192).resize(192, 192).png().toFile("public/icon-192.png");
  await sharp(svg512).resize(512, 512).png().toFile("public/icon-512.png");

  // 2. Full-bleed background for maskable (Android adaptive) & Apple touch icon
  const maskableSvg = svg512.toString().replace(/rx="112"/g, 'rx="0"');
  await sharp(Buffer.from(maskableSvg)).resize(512, 512).png().toFile("public/icon-maskable-512.png");
  await sharp(Buffer.from(maskableSvg)).resize(192, 192).png().toFile("public/icon-maskable-192.png");
  await sharp(Buffer.from(maskableSvg)).resize(180, 180).png().toFile("public/apple-touch-icon.png");

  // 3. Favicon PNG (32x32)
  await sharp(svg192).resize(32, 32).png().toFile("public/favicon-32x32.png");

  console.log("All PWA PNG icons generated successfully!");
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
