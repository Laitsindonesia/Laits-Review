import crypto from "crypto";

// Alphabet tanpa karakter ambigu (0/O, 1/I/L) agar mudah dibaca saat cetak.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateQrToken(length = 6): string {
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

export type DestinationKind = "default" | "internal" | "external";

export interface DestinationCheck {
  ok: boolean;
  kind?: DestinationKind;
  value?: string;
  error?: string;
}

const PRIVATE_IPV4 =
  /^(10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+|127\.\d+\.\d+\.\d+|0\.0\.0\.0)$/;

/**
 * Validasi destination QR dinamis.
 * - "" (kosong) = default -> /r/[CardID]
 * - "/promo", "/r/571" = internal (hanya path relatif, blok /q/, /api/, /admin/ agar tidak loop/privilege)
 * - "https://..." = eksternal publik (https only, tolak IP private/localhost)
 */
export function validateDestination(input: unknown): DestinationCheck {
  const raw = typeof input === "string" ? input.trim() : "";
  if (!raw) return { ok: true, kind: "default", value: "" };
  if (raw.length > 2048) return { ok: false, error: "Destination terlalu panjang (maks 2048 karakter)" };

  if (raw.startsWith("/")) {
    if (raw.startsWith("//")) return { ok: false, error: "Path internal tidak valid" };
    if (/[\s\\<>"']/.test(raw)) return { ok: false, error: "Path internal mengandung karakter tidak valid" };
    const lower = raw.toLowerCase();
    if (
      lower === "/q" ||
      lower.startsWith("/q/") ||
      lower.startsWith("/api/") ||
      lower.startsWith("/admin")
    ) {
      return { ok: false, error: "Path tersebut tidak diizinkan sebagai destination" };
    }
    if (!/^\/[A-Za-z0-9/_\-.?=&%]*$/.test(raw)) {
      return { ok: false, error: "Path internal tidak valid" };
    }
    return { ok: true, kind: "internal", value: raw };
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    // Izinkan tanpa skema: "google.com/abc" -> "https://google.com/abc"
    try {
      url = new URL(`https://${raw}`);
    } catch {
      return { ok: false, error: "URL tidak valid. Gunakan path /... atau https://..." };
    }
  }

  if (url.protocol !== "https:") {
    return { ok: false, error: "URL eksternal harus https:// (tidak boleh http/javascript/data)" };
  }

  const host = url.hostname.toLowerCase();
  if (
    !host ||
    !host.includes(".") ||
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    PRIVATE_IPV4.test(host)
  ) {
    return { ok: false, error: "Host URL tidak diizinkan" };
  }

  return { ok: true, kind: "external", value: url.toString() };
}

/** Resolve tujuan akhir redirect untuk token. Kosong -> default /r/[cardId]. */
export function resolveRedirectTarget(qrDestination: string, cardId: string): string {
  const dest = (qrDestination || "").trim();
  if (!dest) return `/r/${cardId}`;
  return dest;
}

// ---------------------------------------------------------------------------
// Mode aktivasi kartu (dipilih pelanggan saat aktivasi, terpisah dari endpoint admin)
// Definisi di lib/activation.ts (client-safe); di-export ulang agar API tetap satu pintu.
// ---------------------------------------------------------------------------

export {
  ACTIVATION_MODE_DIRECT,
  ACTIVATION_MODE_LAITS,
  ACTIVATION_MODES,
  isValidActivationMode,
  buildGoogleReviewUrl,
} from "./activation.ts";
export type { ActivationMode } from "./activation.ts";

import { ACTIVATION_MODE_DIRECT, buildGoogleReviewUrl } from "./activation.ts";

export interface CardDestinationInput {
  /** qr_destination dari database (dikelola admin). */
  qrDestination: string;
  /** Card ID (mis. "57142") untuk fallback internal /r/[cardId]. */
  cardId: string;
  /** activation_mode dari database; NULL untuk kartu lama. */
  activationMode?: string | null;
  /** PlaceId bisnis dari database (untuk mode Direct Google Review). */
  placeId?: string | null;
}

export type CardDestination =
  | { kind: "external"; url: string }
  | { kind: "internal"; path: string }
  | { kind: "default"; path: string };

/**
 * Menentukan tujuan akhir kartu saat /q/[token] diakses.
 *
 * Urutan prioritas (wajib):
 * 1. Endpoint admin (qr_destination) jika terisi dan valid -> selalu menang.
 * 2. Mode aktivasi DIRECT_GOOGLE_REVIEW + PlaceId valid -> URL Google Review.
 * 3. Mode aktivasi LAITS_SOFTWARE, mode NULL (kartu lama), Direct tanpa PlaceId,
 *    atau endpoint rusak -> perilaku default /r/[Card ID].
 */
export function determineCardDestination(
  input: CardDestinationInput
): CardDestination {
  const dest = (input.qrDestination || "").trim();
  if (dest) {
    const check = validateDestination(dest);
    if (check.ok && check.value) {
      if (check.kind === "internal") {
        return { kind: "internal", path: check.value };
      }
      return { kind: "external", url: check.value };
    }
    // Endpoint rusak -> jatuh ke logika mode/default, jangan open redirect.
  }

  if (input.activationMode === ACTIVATION_MODE_DIRECT) {
    const url = buildGoogleReviewUrl(input.placeId);
    if (url) return { kind: "external", url };
    // Direct tapi PlaceId kosong -> fallback aman ke halaman /r.
  }

  return { kind: "default", path: `/r/${input.cardId}` };
}
