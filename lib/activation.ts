// Mode aktivasi kartu (dipilih pelanggan saat aktivasi, terpisah dari endpoint admin).
// File ini bebas dependensi Node agar aman dipakai di client component.

export const ACTIVATION_MODE_DIRECT = "DIRECT_GOOGLE_REVIEW";
export const ACTIVATION_MODE_LAITS = "LAITS_SOFTWARE";

export type ActivationMode =
  | typeof ACTIVATION_MODE_DIRECT
  | typeof ACTIVATION_MODE_LAITS;

export const ACTIVATION_MODES: readonly ActivationMode[] = [
  ACTIVATION_MODE_DIRECT,
  ACTIVATION_MODE_LAITS,
];

export function isValidActivationMode(value: unknown): value is ActivationMode {
  return value === ACTIVATION_MODE_DIRECT || value === ACTIVATION_MODE_LAITS;
}

/** URL Google Review berbasis Place ID. Return null jika Place ID kosong/tidak valid. */
export function buildGoogleReviewUrl(placeId: unknown): string | null {
  const clean = typeof placeId === "string" ? placeId.trim() : "";
  if (!clean) return null;
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(clean)}`;
}
