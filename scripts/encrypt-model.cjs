/**
 * Regenerates public/models/character.enc from model-source/character.glb.
 *
 *   npm run encrypt-model
 *
 * What this is and isn't: the browser decrypts the model with a password
 * hardcoded in src/components/Character/utils/character.ts, so anyone reading
 * the bundle can recover the .glb. This is obfuscation against casual asset
 * scraping, not security — treat the model as public.
 *
 * The plaintext .glb lives in model-source/ rather than public/ because a
 * served copy alongside the encrypted one defeated the point entirely, and
 * shipped 1.5 MB twice.
 */
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const PASSWORD = "Character3D#@";

const input = path.resolve(__dirname, "../model-source/character.glb");
const output = path.resolve(__dirname, "../public/models/character.enc");

if (!fs.existsSync(input)) {
  console.error(`Source model not found: ${input}`);
  process.exit(1);
}

const key = crypto.createHash("sha256").update(PASSWORD).digest();
const iv = crypto.randomBytes(16);
const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

const source = fs.createReadStream(input);
const destination = fs.createWriteStream(output);

// The IV is prepended to the file; decrypt.ts reads it back off the front.
destination.write(iv);
source.pipe(cipher).pipe(destination);

destination.on("finish", () => {
  console.log(`Wrote ${output} (${fs.statSync(output).size} bytes)`);
});
destination.on("error", (error) => {
  console.error("Failed to write encrypted model:", error);
  process.exit(1);
});
