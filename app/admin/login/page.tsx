"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "../../../lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/admin/dashboard");
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message === "Invalid login credentials"
        ? "Email atau password salah"
        : authError.message);
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
  };

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-glow border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-glow/5 via-transparent to-transparent" />
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-cyan-glow/5 blur-[150px]" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-indigo-glow/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-md px-4 py-12 w-full">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl glass glow-border overflow-hidden">
            <Image
              src="/logo-laits.png"
              alt="Laits Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-cyan-glow to-blue-glow bg-clip-text text-transparent">
              Admin Panel
            </span>
          </h1>
          <p className="mt-2 text-navy-400">
            Masukkan email dan password untuk login.
          </p>
        </div>

        <div className="glass rounded-2xl p-8 glow-border">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-200">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="admin@email.com"
                required
                className="w-full rounded-lg border border-navy-600/50 bg-navy-800/50 px-4 py-3 text-sm text-navy-100 placeholder-navy-500 outline-none focus:border-cyan-glow/50 focus:ring-2 focus:ring-cyan-glow/20 focus:bg-navy-800/80"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-200">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Masukkan password"
                required
                className="w-full rounded-lg border border-navy-600/50 bg-navy-800/50 px-4 py-3 text-sm text-navy-100 placeholder-navy-500 outline-none focus:border-cyan-glow/50 focus:ring-2 focus:ring-cyan-glow/20 focus:bg-navy-800/80"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-glow to-blue-glow px-6 py-3.5 text-sm font-semibold text-navy-950 shadow-lg shadow-cyan-glow/25 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-glow/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Login"}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-navy-600">
          <Link href="/" className="text-cyan-glow/60 hover:text-cyan-glow transition-colors">
            ← Kembali ke Beranda
          </Link>
        </p>
      </div>
    </main>
  );
}
