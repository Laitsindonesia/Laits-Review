const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");
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

function hashPin(pin) {
  return crypto.createHash("sha256").update(pin).digest("hex");
}

async function main() {
  const env = loadEnv();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  console.log("Mencari kartu dengan PIN plaintext...");

  const { data: cards, error } = await supabase
    .from("cards")
    .select("id, Pin")
    .not("Pin", "is", null);

  if (error) {
    console.error("Gagal mengambil data:", error.message);
    process.exit(1);
  }

  if (!cards || cards.length === 0) {
    console.log("Tidak ada kartu dengan PIN.");
    return;
  }

  console.log(`Ditemukan ${cards.length} kartu dengan PIN.`);

  let updated = 0;
  for (const card of cards) {
    if (card.Pin && card.Pin.length === 64) {
      continue;
    }

    const hashed = hashPin(card.Pin);
    const { error: updateError } = await supabase
      .from("cards")
      .update({ Pin: hashed })
      .eq("id", card.id);

    if (updateError) {
      console.error(`Gagal hash PIN untuk kartu ${card.id}:`, updateError.message);
    } else {
      updated++;
    }
  }

  console.log(`Berhasil hash ${updated} PIN.`);
}

main().catch((err) => {
  console.error("Terjadi kesalahan:", err.message);
  process.exit(1);
});
