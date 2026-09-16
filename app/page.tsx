import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-glow/5 via-transparent to-transparent" />
      <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-cyan-glow/5 blur-[120px]" />
      <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-indigo-glow/5 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-lg text-center">
        <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-2xl glass glow-border animate-pulse-glow overflow-hidden">
          <Image
            src="/logo-laits.png"
            alt="Laits Logo"
            width={64}
            height={64}
            className="object-contain"
          />
        </div>

        <h1 className="mb-4 text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-league-spartan)" }}>
          <span className="bg-gradient-to-r from-cyan-glow via-blue-glow to-indigo-glow bg-clip-text text-transparent">
            Laits Review
          </span>
        </h1>

        <Link
          href="/setup"
          className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-cyan-glow/90 to-blue-glow/90 px-10 py-5 text-base font-semibold text-navy-950 shadow-lg shadow-cyan-glow/25 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-glow/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg
            className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
          Buat Link Review
        </Link>

        <div className="mt-16 flex items-center justify-center gap-8 text-xs text-navy-500">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-cyan-glow/60 hover:text-cyan-glow transition-colors"
          >
            <div className="h-2 w-2 rounded-full bg-indigo-glow/50 animate-pulse" />
            Admin Panel
          </Link>
        </div>
      </div>
    </main>
  );
}
