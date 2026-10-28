-- Mode aktivasi kartu: dipilih pelanggan saat aktivasi, terpisah dari qr_destination (endpoint admin).
-- NULL  = kartu lama / belum memilih -> perilaku default lama: redirect ke /r/[Card ID].
-- Prioritas di aplikasi: qr_destination (endpoint admin) > activation_mode > default /r.
-- Migrasi additive/non-destruktif: tidak mengubah kolom atau data yang sudah ada.

ALTER TABLE cards ADD COLUMN IF NOT EXISTS activation_mode TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cards_activation_mode_check'
      AND conrelid = 'public.cards'::regclass
  ) THEN
    ALTER TABLE cards
      ADD CONSTRAINT cards_activation_mode_check
      CHECK (
        activation_mode IS NULL
        OR activation_mode IN ('DIRECT_GOOGLE_REVIEW', 'LAITS_SOFTWARE')
      );
  END IF;
END $$;
