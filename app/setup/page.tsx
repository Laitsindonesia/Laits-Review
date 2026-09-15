"use client";

import { useState } from "react";
import AddressAutocomplete from "../components/AddressAutocomplete";

interface FormData {
  companyName: string;
  address: string;
  phone: string;
  pin: string;
  placeId: string;
}

export default function SetupPage() {
  const [form, setForm] = useState<FormData>({
    companyName: "",
    address: "",
    phone: "",
    pin: "",
    placeId: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [claimError, setClaimError] = useState("");
  const [claiming, setClaiming] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const numericValue = value.replace(/[^0-9]/g, "").slice(0, 13);
      setForm((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!form.companyName.trim()) newErrors.companyName = "Nama bisnis wajib diisi";
    if (!form.address.trim()) newErrors.address = "Alamat wajib diisi";
    if (!form.phone.trim()) {
      newErrors.phone = "Nomor telepon wajib diisi";
    } else if (!/^\d{9,13}$/.test(form.phone.replace(/[^0-9]/g, ""))) {
      newErrors.phone = "Format nomor telepon tidak valid (9-13 digit setelah +62)";
    }
    if (!form.pin.trim()) {
      newErrors.pin = "PIN wajib diisi";
    } else if (form.pin.length !== 6 || !/^\d{6}$/.test(form.pin)) {
      newErrors.pin = "PIN harus 6 digit angka";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setClaiming(true);
    setClaimError("");

    try {
      const response = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName.trim(),
          address: form.address.trim(),
          phone: `62${form.phone.replace(/[^0-9]/g, "").replace(/^0+/, "").replace(/^62/, "")}`,
          placeId: form.placeId,
          pin: form.pin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setClaimError(data.error || "Gagal membuat link review");
        setClaiming(false);
        return;
      }

      const params = new URLSearchParams({
        card_id: data.card_id,
        name: data.business_name,
        phone: data.phone,
      });

      if (data.placeId) {
        params.set("place_id", data.placeId);
      }

      window.location.href = `/review?${params.toString()}`;
    } catch {
      setClaimError("Terjadi kesalahan. Silakan coba lagi.");
      setClaiming(false);
    }
  };

  const inputClass = (field: keyof FormData) =>
    `w-full rounded-lg border px-4 py-3 text-sm transition-all duration-300 outline-none ${
      errors[field]
        ? "border-red-500/50 bg-red-950/30 text-red-200 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
        : "border-navy-600/50 bg-navy-800/50 text-navy-100 placeholder-navy-500 focus:border-cyan-glow/50 focus:ring-2 focus:ring-cyan-glow/20 focus:bg-navy-800/80"
    }`;

  return (
    <main className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-glow/5 via-transparent to-transparent" />
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-cyan-glow/5 blur-[150px]" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-indigo-glow/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-12">
        <div className="mb-10 text-center">
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
                d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"
              />
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

        <form
          onSubmit={handleSubmit}
          className="glass rounded-2xl p-8 glow-border"
        >
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-200">
                Nama Perusahaan / Bisnis <span className="text-cyan-glow">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                placeholder="Contoh: KopiKita"
                className={inputClass("companyName")}
              />
              {errors.companyName && (
                <p className="mt-1 text-xs text-red-400">{errors.companyName}</p>
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
                  if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
                }}
                onSelect={(data) => {
                  setForm((prev) => ({ ...prev, placeId: data.placeId }));
                }}
                placeholder="Contoh: Jl. Sudirman No. 123, Jakarta"
                className={errors.address ? "ring-2 ring-red-500/20" : ""}
              />
              {errors.address && (
                <p className="mt-1 text-xs text-red-400">{errors.address}</p>
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
                  onChange={handleChange}
                  placeholder="8123456789"
                  className={`flex-1 rounded-r-lg border px-4 py-3 text-sm transition-all duration-300 outline-none ${
                    errors.phone
                      ? "border-red-500/50 bg-red-950/30 text-red-200 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                      : "border-navy-600/50 bg-navy-800/50 text-navy-100 placeholder-navy-500 focus:border-cyan-glow/50 focus:ring-2 focus:ring-cyan-glow/20 focus:bg-navy-800/80"
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs text-red-400">{errors.phone}</p>
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
                onChange={handleChange}
                placeholder="Contoh: 123456"
                maxLength={6}
                className={inputClass("pin")}
              />
              {errors.pin && (
                <p className="mt-1 text-xs text-red-400">{errors.pin}</p>
              )}
            </div>
          </div>

          {claimError && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-sm text-red-400">{claimError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={claiming}
            className="mt-8 w-full rounded-xl bg-gradient-to-r from-cyan-glow to-blue-glow px-6 py-3.5 text-sm font-semibold text-navy-950 shadow-lg shadow-cyan-glow/25 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-glow/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {claiming ? "Memproses..." : "Buka Halaman Review →"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-navy-600">
          Created by Laits ID
        </p>
      </div>
    </main>
  );
}
