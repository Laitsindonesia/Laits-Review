"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function ReviewContent() {
  const searchParams = useSearchParams();
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const name = searchParams.get("name") || "Bisnis Kami";
  const phone = searchParams.get("phone") || "";
  const placeId = searchParams.get("place_id") || "";
  const cardId = searchParams.get("card_id") || "";

  useEffect(() => {
    if (rating >= 4 && rating <= 5 && placeId) {
      setIsRedirecting(true);
      const googleReviewUrl = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
      const timer = setTimeout(() => {
        window.location.href = googleReviewUrl;
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [rating, placeId]);

  const handleRatingClick = (value: number) => {
    if (isRedirecting || submitted) return;
    setRating(value);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    const message = [
      `*Rating:* ${"⭐".repeat(rating)} (${rating}/5)`,
      `*Masukan Untuk Manager Toko:*`,
      `${feedback.trim()}`,
    ].join("\n");

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

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

  if (!phone) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-transparent to-transparent" />
        <div className="relative z-10 mx-auto max-w-md text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full glass border-red-500/30">
            <svg
              className="h-8 w-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-navy-100">Link Tidak Valid</h1>
          <p className="text-navy-400">
            Parameter yang diperlukan tidak ditemukan. Pastikan Anda menggunakan
            link yang benar dari dashboard setup.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-glow/5 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/3 h-72 w-72 rounded-full bg-cyan-glow/5 blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-indigo-glow/5 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-lg px-4 py-12">
        <div className="text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl glass glow-border">
            <svg
              className="h-8 w-8 text-cyan-glow"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-100">
            Bagaimana pengalaman Anda?
          </h1>
          <p className="mt-2 text-navy-400">
            Berikan penilaian untuk{" "}
            <span className="font-semibold text-cyan-glow">{name}</span>
          </p>
        </div>

        {isRedirecting ? (
          <div className="mt-12 glass rounded-2xl p-8 text-center glow-border animate-pulse-glow">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-cyan-glow/20">
              <svg
                className="h-8 w-8 text-cyan-glow"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
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
              <svg
                className="h-8 w-8 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
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
            {/* Star Rating */}
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

            {/* Feedback Form (Rating 1-3 only) */}
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
                  Beri Masukan Ke Manager Toko
                </button>
              </form>
            )}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-navy-600">
          Powered by Laits.id
        </p>
      </div>
    </main>
  );
}

function LoadingFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-cyan-glow border-t-transparent" />
        <p className="text-sm text-navy-400">Memuat...</p>
      </div>
    </main>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ReviewContent />
    </Suspense>
  );
}
