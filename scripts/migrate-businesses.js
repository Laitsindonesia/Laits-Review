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

async function main() {
  const env = loadEnv();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const jsonPath = path.join(__dirname, "..", "data", "businesses.json");
  const rawData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const businesses = rawData.businesses;

  console.log(`Migrasi ${businesses.length} bisnis ke Supabase...`);

  const { error: deleteError } = await supabase
    .from("businesses")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (deleteError) {
    console.error("Gagal hapus data lama:", deleteError.message);
    process.exit(1);
  }

  const { error: insertError } = await supabase.from("businesses").insert(businesses);

  if (insertError) {
    console.error("Gagal insert data:", insertError.message);
    process.exit(1);
  }

  console.log(`Berhasil! ${businesses.length} bisnis telah dimigrasi ke Supabase.`);
}

main().catch((err) => {
  console.error("Terjadi kesalahan:", err.message);
  process.exit(1);
});
