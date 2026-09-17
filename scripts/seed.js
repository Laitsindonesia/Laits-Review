const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    env[key] = value;
  }
  return env;
}

const BATCH_SIZE = 500;
const START_ID = 1;
const END_ID = 200;

const QR_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function genQrToken(length = 6) {
  const bytes = require("crypto").randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += QR_ALPHABET[bytes[i] % QR_ALPHABET.length];
  return out;
}

async function main() {
  const env = loadEnv();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseKey === "YOUR_SERVICE_ROLE_KEY_HERE") {
    console.error("ERROR: SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local");
    console.error("Silakan tambahkan key dari dashboard Supabase:");
    console.error("  Settings > API > service_role (secret)");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Menghapus semua kartu lama...");
  const { error: deleteError } = await supabase
    .from("cards")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (deleteError) {
    console.error("Gagal hapus data lama:", deleteError.message);
    process.exit(1);
  }
  console.log("Semua kartu lama berhasil dihapus.");

  const totalCards = END_ID - START_ID + 1;
  let inserted = 0;

  console.log(`Membuat ${totalCards} kartu baru (571 - 57200)...`);

  for (let batchStart = START_ID; batchStart <= END_ID; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE - 1, END_ID);
    const rows = [];

    for (let i = batchStart; i <= batchEnd; i++) {
      rows.push({
        "Card ID": `57${i}`,
        "Nama Bisnis": "",
        "Nomor Telpon": "",
        "Card Status": false,
        qr_token: genQrToken(),
        qr_destination: "",
      });
    }

    const { error: insertError } = await supabase.from("cards").insert(rows);

    if (insertError) {
      console.error(`Gagal insert batch di ID ${batchStart}:`, insertError.message);
      process.exit(1);
    }

    inserted += rows.length;
    const progress = Math.round((inserted / totalCards) * 100);
    process.stdout.write(`\rProgress: ${inserted}/${totalCards} (${progress}%)`);
  }

  console.log("\n");
  console.log("=== SEED SELESAI ===");
  console.log(`${inserted} kartu dari 571 - 57200 berhasil dibuat.`);
}

main().catch((err) => {
  console.error("Terjadi kesalahan:", err.message);
  process.exit(1);
});
