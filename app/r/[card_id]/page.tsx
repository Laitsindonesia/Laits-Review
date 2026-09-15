"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import AddressAutocomplete from "../../components/AddressAutocomplete";

interface CardData {
  card_id: string;
  claimed: boolean;
  business_name: string;
  phone: string;
  place_id: string;
}

interface SetupForm {
  companyName: string;
  address: string;
  phone: string;
  pin: string;
  placeId: string;
}

export default function CardReviewPage() {
  const params = useParams();
  const cardId = params.card_id as string;

  const [cardData, setCardData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState<SetupForm>({
    companyName: "",
    address: "",
    phone: "",
    pin: "",
    placeId: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof SetupForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchCard = useCallback(async () => {
    try {
      const res = await fetch(`/api/claims/${cardId}`);
      if (!res.ok) {
        setError("Kartu tidak ditemukan");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setCardData(data);
    } catch {
      setError("Gagal memuat data kartu");
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  useEffect(() => {
    if (cardId) fetchCard();
  }, [cardId, fetchCard]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const numericValue = value.replace(/[^0-9]/g, "").slice(0, 13);
      setForm((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (formErrors[name as keyof SetupForm]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof SetupForm, string>> = {};

    if (!form.companyName.trim()) errors.companyName = "Nama bisnis wajib diisi";
    if (!form.address.trim()) errors.address = "Alamat wajib diisi";
    if (!form.phone.trim()) {
      errors.phone = "Nomor telepon wajib diisi";
    } else if (!/^\d{9,13}$/.test(form.phone.replace(/[^0-9]/g, ""))) {
      errors.phone = "Format nomor telepon tidak valid (9-13 digit setelah +62)";
    }
    if (!form.pin.trim()) {
      errors.pin = "PIN wajib diisi";
    } else if (form.pin.length !== 6 || !/^\d{6}$/.test(form.pin)) {
      errors.pin = "PIN harus 6 digit angka";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch(`/api/claims/${cardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName.trim(),
          address: form.address.trim(),
          phone: `62${form.phone.replace(/[^0-9]/g, "").replace(/^0+/, "").replace(/^62/, "")}`,
          placeId: form.placeId,
          pin: form.pin,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || "Gagal mengaktifkan kartu");
        setSubmitting(false);
        return;
      }

      setCardData({
        card_id: cardId,
        claimed: true,
        business_name: data.business_name || form.companyName,
        phone: data.phone || form.phone,
        place_id: data.place_id || form.placeId,
      });
    } catch {
      setSubmitError("Terjadi kesalahan. Silakan coba lagi.");
      setSubmitting(false);
    }
  };

  const inputClass = (field: keyof SetupForm) =>
    `w-full rounded-lg border px-4 py-3 text-sm transition-all duration-300 outline-none ${
      formErrors[field]
        ? "border-red-500/50 bg-red-950/30 text-red-200 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
        : "border-navy-600/50 bg-navy-800/50 text-navy-100 placeholder-navy-500 focus:border-cyan-glow/50 focus:ring-2 focus:ring-cyan-glow/20 focus:bg-navy-800/80"
    }`;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-cyan-glow border-t-transparent" />
          <p className="text-sm text-navy-400">Memuat...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="relative z-10 mx-auto max-w-md text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full glass border-red-500/30">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-navy-100">Kartu Tidak Ditemukan</h1>
          <p className="text-navy-400">Kartu dengan ID <span className="text-cyan-glow font-mono">{cardId}</span> tidak tersedia.</p>
        </div>
      </main>
    );
  }

  if (!cardData) return null;

  if (!cardData.claimed) {
    return (
      <main className="min-h-screen relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-glow/5 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-cyan-glow/5 blur-[150px]" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-indigo-glow/5 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-2xl px-4 py-12">
          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl glass glow-border">
              <svg className="h-8 w-8 text-cyan-glow" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-cyan-glow to-blue-glow bg-clip-text text-transparent">
                Buat Link Review
              </span>
            </h1>
            <p className="mt-2 text-navy-400">
              Isi data bisnis Anda untuk menghasilkan link &amp; QR code review.
            </p>
          </div>

          <form onSubmit={handleSetupSubmit} className="glass rounded-2xl p-8 glow-border">
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-200">
                  Nama Perusahaan / Bisnis <span className="text-cyan-glow">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleFormChange}
                  placeholder="Contoh: KopiKita"
                  className={inputClass("companyName")}
                />
                {formErrors.companyName && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.companyName}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-200">
                  Alamat Perusahaan <span className="text-cyan-glow">*</span>
                </label>
                <AddressAutocomplete
                  value={form.address}
                  onChange={(val) => {
                    setForm((prev) => ({ ...prev, address: val }));
                    if (formErrors.address) setFormErrors((prev) => ({ ...prev, address: undefined }));
                  }}
                  onSelect={(data) => {
                    setForm((prev) => ({ ...prev, placeId: data.placeId }));
                  }}
                  placeholder="Contoh: Jl. Sudirman No. 123, Jakarta"
                  className={formErrors.address ? "ring-2 ring-red-500/20" : ""}
                />
                {formErrors.address && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.address}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-200">
                  Nomor Telepon / WhatsApp <span className="text-cyan-glow">*</span>
                </label>
                <div className="flex">
                  <span className="flex items-center rounded-l-lg border border-r-0 border-navy-600/50 bg-navy-700/80 px-4 text-sm text-navy-300">
                    +62
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    placeholder="8123456789"
                    className={`flex-1 rounded-r-lg border px-4 py-3 text-sm transition-all duration-300 outline-none ${
                      formErrors.phone
                        ? "border-red-500/50 bg-red-950/30 text-red-200 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                        : "border-navy-600/50 bg-navy-800/50 text-navy-100 placeholder-navy-500 focus:border-cyan-glow/50 focus:ring-2 focus:ring-cyan-glow/20 focus:bg-navy-800/80"
                    }`}
                  />
                </div>
                {formErrors.phone && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-200">
                  6-Digit PIN <span className="text-cyan-glow">*</span>
                </label>
                <input
                  type="password"
                  name="pin"
                  value={form.pin}
                  onChange={handleFormChange}
                  placeholder="Contoh: 123456"
                  maxLength={6}
                  className={inputClass("pin")}
                />
                {formErrors.pin && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.pin}</p>
                )}
              </div>
            </div>

            {submitError && (
              <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                <p className="text-sm text-red-400">{submitError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-8 w-full rounded-xl bg-gradient-to-r from-cyan-glow to-blue-glow px-6 py-3.5 text-sm font-semibold text-navy-950 shadow-lg shadow-cyan-glow/25 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-glow/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {submitting ? "Memproses..." : "Buka Halaman Review →"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-navy-600">
            Created by Laits ID
          </p>
        </div>
      </main>
    );
  }

  return <ReviewInterface cardData={cardData} />;
}

function ReviewInterface({ cardData }: { cardData: CardData }) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (rating >= 4 && rating <= 5) {
      setIsRedirecting(true);
      let googleUrl = cardData.place_id
        ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(cardData.place_id)}`
        : cardData.place_id;
      if (!googleUrl) {
        setIsRedirecting(false);
        return;
      }
      const timer = setTimeout(() => {
        window.location.href = googleUrl;
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [rating, cardData.place_id]);

  const handleRatingClick = (value: number) => {
    if (isRedirecting || submitted) return;
    setRating(value);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !feedback.trim()) return;

    const message = [
      `*Umpan Balik Pelanggan*`,
      ``,
      `*Bisnis:* ${cardData.business_name}`,
      `*Rating:* ${"⭐".repeat(rating)} (${rating}/5)`,
      `*Nama Pelanggan:* ${customerName.trim()}`,
      ``,
      `*Masukan / Keluhan:*`,
      `${feedback.trim()}`,
    ].join("\n");

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cardData.phone}?text=${encodedMessage}`;

    setSubmitted(true);
    setTimeout(() => {
      window.location.href = whatsappUrl;
    }, 2000);
  };

  const getStarColor = (star: number) => {
    const active = hoveredStar >= star || rating >= star;
    return active ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" : "text-navy-600";
  };

  const getRatingText = (value: number) => {
    const texts: Record<number, string> = {
      1: "Sangat Tidak Puas",
      2: "Tidak Puas",
      3: "Biasa Saja",
      4: "Puas",
      5: "Sangat Puas",
    };
    return texts[value] || "";
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-glow/5 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/3 h-72 w-72 rounded-full bg-cyan-glow/5 blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-indigo-glow/5 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-lg px-4 py-12">
        <div className="text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl glass glow-border">
            <svg className="h-8 w-8 text-cyan-glow" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-100">
            Bagaimana pengalaman Anda?
          </h1>
          <p className="mt-2 text-navy-400">
            Berikan penilaian untuk{" "}
            <span className="font-semibold text-cyan-glow">{cardData.business_name}</span>
          </p>
        </div>

        {isRedirecting ? (
          <div className="mt-12 glass rounded-2xl p-8 text-center glow-border animate-pulse-glow">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-cyan-glow/20">
              <svg className="h-8 w-8 text-cyan-glow" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-navy-100">
              Terima Kasih!
            </h2>
            <p className="text-navy-300">
              Anda akan diarahkan ke Google Review...
            </p>
            <div className="mt-4">
              <div className="mx-auto h-1 w-32 overflow-hidden rounded-full bg-navy-700">
                <div className="h-full animate-pulse rounded-full bg-gradient-to-r from-cyan-glow to-blue-glow" />
              </div>
            </div>
          </div>
        ) : submitted ? (
          <div className="mt-12 glass rounded-2xl p-8 text-center glow-border">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-navy-100">
              Terima Kasih atas Masukan Anda!
            </h2>
            <p className="text-navy-300">
              Anda akan diarahkan ke WhatsApp untuk mengirim pesan...
            </p>
            <div className="mt-4">
              <div className="mx-auto h-1 w-32 overflow-hidden rounded-full bg-navy-700">
                <div className="h-full animate-pulse rounded-full bg-gradient-to-r from-green-400 to-emerald-400" />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-10 glass rounded-2xl p-8 glow-border">
            <div className="mb-8">
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className={`text-4xl transition-all duration-300 hover:scale-125 active:scale-95 sm:text-5xl ${getStarColor(star)} cursor-pointer`}
                    aria-label={`Bintang ${star}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="mt-3 text-center text-sm font-medium text-cyan-glow glow-text">
                  {getRatingText(rating)}
                </p>
              )}
            </div>

            {rating >= 1 && rating <= 3 && (
              <form onSubmit={handleSubmitFeedback} className="space-y-5">
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="text-sm text-amber-300/80">
                    Kami mohon maaf atas pengalaman Anda. Silakan sampaikan
                    masukan Anda agar kami dapat memperbaikinya.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-navy-200">
                    Nama Anda <span className="text-cyan-glow">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Masukkan nama Anda"
                    required
                    className="w-full rounded-lg border border-navy-600/50 bg-navy-800/50 px-4 py-3 text-sm text-navy-100 placeholder-navy-500 transition-all duration-300 outline-none focus:border-cyan-glow/50 focus:ring-2 focus:ring-cyan-glow/20 focus:bg-navy-800/80"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-navy-200">
                    Masukan / Keluhan <span className="text-cyan-glow">*</span>
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Ceritakan pengalaman Anda..."
                    required
                    rows={4}
                    className="w-full resize-none rounded-lg border border-navy-600/50 bg-navy-800/50 px-4 py-3 text-sm text-navy-100 placeholder-navy-500 transition-all duration-300 outline-none focus:border-cyan-glow/50 focus:ring-2 focus:ring-cyan-glow/20 focus:bg-navy-800/80"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.01] active:scale-[0.99]"
                >
                  Kirim via WhatsApp
                </button>
              </form>
            )}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-navy-600">
          Powered by Laits Review
        </p>
      </div>
    </main>
  );
}
