"use client";

import { useState, useEffect } from "react";
import { buildGoogleReviewUrl } from "../../lib/activation";

export default function DirectActivatedRedirect({
  placeId,
}: {
  placeId: string;
}) {
  const [countdown, setCountdown] = useState(3);
  const googleUrl = buildGoogleReviewUrl(placeId);

  useEffect(() => {
    if (!googleUrl) return;
    if (countdown <= 0) {
      window.location.href = googleUrl;
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, googleUrl]);

  return (
    <main className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-glow/5 via-transparent to-transparent" />
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-cyan-glow/5 blur-[150px]" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-indigo-glow/5 blur-[120px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4">
        <div className="glass w-full rounded-2xl p-8 text-center glow-border">
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
          <h1 className="mb-2 text-2xl font-bold text-navy-100">
            Aktivasi Berhasil!
          </h1>
          <p className="text-sm leading-relaxed text-navy-300">
            Kartu Anda kini mengarahkan pelanggan{" "}
            <span className="font-semibold text-cyan-glow">
              ke Google Review
            </span>{" "}
            bisnis Anda.
          </p>

          {googleUrl ? (
            <>
              <p className="mt-4 text-sm text-navy-400">
                Anda akan diarahkan ke Google Review dalam{" "}
                <span className="font-semibold text-cyan-glow">{countdown}</span>{" "}
                detik...
              </p>
              <div className="mx-auto mt-3 h-1 w-40 overflow-hidden rounded-full bg-navy-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-glow to-blue-glow transition-all duration-1000 ease-linear"
                  style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                />
              </div>
              <a
                href={googleUrl}
                className="mt-6 inline-block w-full rounded-xl bg-gradient-to-r from-cyan-glow to-blue-glow px-6 py-3.5 text-sm font-semibold text-navy-950 shadow-lg shadow-cyan-glow/25 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-glow/40 hover:scale-[1.01] active:scale-[0.99]"
              >
                Buka Google Review Sekarang →
              </a>
            </>
          ) : (
            <p className="mt-4 text-sm text-amber-300/90">
              Tempel tautan Google Review Anda melalui panel admin untuk
              mengaktifkan tujuan kartu.
            </p>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-navy-600">
          Powered by Laits.id
        </p>
      </div>
    </main>
  );
}
