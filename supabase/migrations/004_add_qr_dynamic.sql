-- Dynamic QR: token permanen per kartu + destination yang bisa diedit
-- Card ID (571, 572, ...) TIDAK berubah. QR cetak berisi /q/[qr_token].

ALTER TABLE cards ADD COLUMN IF NOT EXISTS qr_token TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS qr_destination TEXT NOT NULL DEFAULT '';

-- Unik agar token tidak bisa ditebak/duplikat (NULL diabaikan Postgres, jadi backfill wajib)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'cards_qr_token_unique') THEN
    CREATE UNIQUE INDEX cards_qr_token_unique ON cards(qr_token);
  END IF;
END $$;
