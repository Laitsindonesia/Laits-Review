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
