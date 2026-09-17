// Backfill qr_token untuk card lama yang belum punya token.
// Aman dijalankan berulang: hanya mengisi yang NULL/kosong.
// Usage: node scripts/backfill-qr-token.js
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    env[trimmed.slice(0, eqIndex).trim()] = trimmed.slice(eqIndex + 1).trim();
  }
  return env;
}

function genToken(length = 6) {
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

async function main() {
  const env = loadEnv();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: existing, error } = await supabase.from("cards").select('id, "Card ID", qr_token');
  if (error) {
    console.error("Gagal fetch cards:", error.message);
    process.exit(1);
  }

  const used = new Set((existing || []).map((c) => c.qr_token).filter(Boolean));
  const missing = (existing || []).filter((c) => !c.qr_token);
  console.log(`Total: ${existing.length}, belum punya token: ${missing.length}`);

  let updated = 0;
  for (const card of missing) {
    let token = genToken();
    let guard = 0;
    while (used.has(token) && guard++ < 100) token = genToken();

    const { error: upErr } = await supabase
      .from("cards")
      .update({ qr_token: token })
      .eq("id", card.id)
      .is("qr_token", null);

    if (upErr) {
      // Kemungkinan race unique constraint -> generate ulang sekali
      console.error(`Gagal update ${card["Card ID"]}:`, upErr.message);
      continue;
    }
    used.add(token);
    updated++;
    if (updated % 50 === 0) process.stdout.write(`\rUpdated: ${updated}/${missing.length}`);
  }

  console.log(`\nSelesai. ${updated} kartu diberi qr_token.`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
