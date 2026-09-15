const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envContent = fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [key, ...rest] = line.split("=");
  if (key) env[key.trim()] = rest.join("=").trim();
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateSortOrder() {
  const { data: cards, error } = await supabase
    .from("cards")
    .select("*");

  if (error) {
    console.error("Error fetching cards:", error.message);
    process.exit(1);
  }

  console.log(`Found ${cards.length} cards. Updating sort_order...`);

  for (const card of cards) {
    const num = parseInt((card["Card ID"] || "").slice(2), 10);
    if (isNaN(num)) {
      console.log(`SKIP: ${card["Card ID"]} (invalid number)`);
      continue;
    }

    const { error: updateError } = await supabase
      .from("cards")
      .update({ "sort_order": num })
      .eq("id", card.id);

    if (updateError) {
      console.error(`FAIL: ${card["Card ID"]} - ${updateError.message}`);
    }
  }

  console.log("Done! All sort_order values updated.");
}

updateSortOrder();
