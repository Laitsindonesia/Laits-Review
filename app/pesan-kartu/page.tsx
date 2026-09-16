"use client";

import Image from "next/image";
import Link from "next/link";

const WHATSAPP_NUMBER = "62881080630325";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Halo, saya ingin pesan Review Langsung Card")}`;

export default function PesanKartuPage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-glow/5 via-transparent to-transparent" />
      <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-cyan-glow/5 blur-[120px]" />
      <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-indigo-glow/5 blur-[150px]" />

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pt-16 pb-20 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-cyan-glow">
          Review Langsung
        </p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          <span className="bg-gradient-to-r from-cyan-glow via-blue-glow to-indigo-glow bg-clip-text text-transparent">
            Pesan Sekarang
          </span>
        </h1>
        <p className="mx-auto mb-3 max-w-2xl text-lg font-semibold text-navy-200">
          Ubah Pelanggan Puas Menjadi Ulasan Bintang 5.
        </p>
        <p className="mx-auto mb-10 max-w-xl text-sm text-navy-400">
          Cukup minta mereka tap kartu ini ke HP, dan halaman ulasan Google
          Anda akan langsung terbuka otomatis.
        </p>

        <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Pesan via WhatsApp
          </a>
          <a
            href="#cara-kerja"
            className="inline-flex items-center gap-2 rounded-xl border border-navy-500/30 bg-navy-800/40 px-8 py-4 text-sm font-semibold text-navy-300 transition-all duration-300 hover:bg-navy-700/60 hover:border-cyan-glow/30 hover:text-cyan-glow active:scale-[0.98]"
          >
            Lihat Cara Kerja
          </a>
        </div>

        {/* Mockup Card */}
        <div className="mx-auto max-w-md">
          <div className="glass rounded-2xl p-6 glow-border">
            <div className="aspect-[3/2] rounded-xl bg-gradient-to-br from-navy-700/80 to-navy-800/80 border border-navy-600/50 flex flex-col items-center justify-center gap-3 p-6">
              <Image
                src="/icon-pwa.png"
                alt="Review Langsung Card"
                width={64}
                height={64}
                className="object-contain"
              />
              <p className="text-sm font-bold text-cyan-glow">Review Langsung</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="text-lg text-amber-400">★</span>
                ))}
              </div>
              <p className="text-[10px] text-navy-400">Tap untuk memberi rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cara Kerja Section */}
      <section id="cara-kerja" className="relative z-10 mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-navy-100">
            Hanya Butuh 3 Detik
          </h2>
          <p className="mx-auto max-w-xl text-sm text-navy-400">
            Hilangkan semua kerumitan. Permudah pelanggan Anda untuk memberikan
            rating terbaik mereka.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Tunjukkan Kartu",
              desc: "Sodorkan kartu fisik Review Langsung kepada pelanggan yang puas saat mereka sedang membayar di kasir.",
              icon: (
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              ),
            },
            {
              step: "2",
              title: "Pelanggan Tap HP",
              desc: "Pelanggan hanya perlu menempelkan bagian belakang HP mereka ke kartu. (Mendukung iPhone & Android).",
              icon: (
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
              ),
            },
            {
              step: "3",
              title: "Ulasan Terkirim",
              desc: "Halaman pengisian ulasan Google bisnis Anda langsung terbuka. Pelanggan tinggal memberi bintang 5 dan klik kirim.",
              icon: (
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              ),
            },
          ].map((item) => (
            <div key={item.step} className="glass rounded-2xl p-8 text-center glow-border transition-all duration-300 hover:scale-[1.02]">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-cyan-glow/10 text-cyan-glow">
                {item.icon}
              </div>
              <div className="mb-2 text-xs font-bold uppercase tracking-widest text-cyan-glow/60">
                Langkah {item.step}
              </div>
              <h3 className="mb-3 text-lg font-bold text-navy-100">{item.title}</h3>
              <p className="text-sm leading-relaxed text-navy-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fitur Section */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-navy-100">
            Dirancang Khusus untuk Bisnis Lokal
          </h2>
          <p className="mx-auto max-w-xl text-sm text-navy-400">
            Fitur-fitur yang menjamin kemudahan penggunaan dan kredibilitas di
            mata pelanggan.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Bebas Biaya Bulanan",
              desc: "Berhentilah membayar biaya langganan software. Beli kartu satu kali, gunakan selamanya.",
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659 1.171-1.019 1.171 1.019.879-.659M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
                </svg>
              ),
            },
            {
              title: "Bisa Direset Mandiri",
              desc: "Pindah lokasi toko? Tidak perlu beli baru. Reset dan tautkan ulang kartu Anda sendiri dengan PIN.",
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                </svg>
              ),
            },
            {
              title: "100% Bebas Aplikasi",
              desc: "Pelanggan sama sekali tidak perlu mengunduh aplikasi tambahan untuk memberikan ulasan.",
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              ),
            },
            {
              title: "Desain Google Premium",
              desc: "Kartu dicetak dengan finishing elegan dan aksen identitas Google yang menaikkan prestise bisnis.",
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                </svg>
              ),
            },
            {
              title: "Sistem Anti-Bajak",
              desc: "Kartu terkunci secara eksklusif ke halaman bisnis Anda dan tidak bisa dialihkan orang lain.",
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              ),
            },
            {
              title: "Dilengkapi QR Code",
              desc: "Jika smartphone pelanggan belum memiliki NFC, mereka cukup memindai QR code di belakang kartu.",
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
                </svg>
              ),
            },
          ].map((item, i) => (
            <div key={i} className="glass rounded-2xl p-6 glow-border transition-all duration-300 hover:scale-[1.02]">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-glow/10 text-cyan-glow">
                {item.icon}
              </div>
              <h3 className="mb-2 text-lg font-bold text-navy-100">{item.title}</h3>
              <p className="text-sm leading-relaxed text-navy-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 py-20">
        <div className="glass rounded-2xl p-12 text-center glow-border">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-navy-100">
            Mulai Dominasi Hasil Pencarian
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-sm text-navy-400">
            Pelanggan mencari tempat dengan rating terbaik. Pastikan itu bisnis
            Anda. Pesan Review Langsung Card hari ini.
          </p>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-10 py-4 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Pesan via WhatsApp
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-navy-700/50 py-10">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="mb-3 text-sm font-bold text-navy-200">Review Langsung</p>
          <div className="mb-4 flex items-center justify-center gap-6 text-xs text-navy-500">
            <a href="#" className="hover:text-navy-300 transition-colors">
              Syarat &amp; Ketentuan
            </a>
            <a href="#" className="hover:text-navy-300 transition-colors">
              Kebijakan Privasi
            </a>
          </div>
          <p className="text-xs text-navy-600">
            &copy; 2026 Review Langsung. Hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </main>
  );
}
