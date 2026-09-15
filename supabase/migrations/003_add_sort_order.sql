-- Tambah kolom sort_order ke table cards
ALTER TABLE cards ADD COLUMN IF NOT EXISTS "sort_order" INTEGER DEFAULT 0;

-- Update sort_order berdasarkan angka di Card ID
-- Contoh: "571" -> sort_order = 1, "57200" -> sort_order = 200
UPDATE cards
SET "sort_order" = CAST(SUBSTRING("Card ID" FROM 3) AS INTEGER)
WHERE "Card ID" LIKE '57%';
