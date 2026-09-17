"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../../../lib/supabase";

interface Card {
  id: string;
  "Card ID": string;
  "Nama Bisnis": string;
  "Nomor Telpon": string;
  "Card Status": boolean;
  created_at: string;
  qr_token?: string;
  qr_destination?: string;
}

function getNextCardId(cards: Card[]): string {
  const prefix = "57";
  const numbers = cards
    .map((c) => c["Card ID"])
    .filter((id) => id.startsWith(prefix))
    .map((id) => parseInt(id.slice(prefix.length), 10))
    .filter((n) => !isNaN(n));
  const max = numbers.length > 0 ? numbers.reduce((a, b) => Math.max(a, b), 0) : 0;
  const next = max + 1;
  return `${prefix}${String(next)}`;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showGenerate, setShowGenerate] = useState(false);
  const [showEdit, setShowEdit] = useState<Card | null>(null);
  const [showQR, setShowQR] = useState<Card | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Card | null>(null);
  const [permanentDeleteConfirm, setPermanentDeleteConfirm] = useState<Card | null>(null);
  const [batchCount, setBatchCount] = useState("");
  const [generating, setGenerating] = useState(false);
  const [editForm, setEditForm] = useState({ business_name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editPinInput, setEditPinInput] = useState("");
  const [editPinError, setEditPinError] = useState("");
  const [editPinVerified, setEditPinVerified] = useState(false);
  const [destInput, setDestInput] = useState("");
  const [savingDest, setSavingDest] = useState(false);
  const [destError, setDestError] = useState("");
  const [destOk, setDestOk] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 25;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/admin/login");
      } else {
        fetchCards();
      }
    });
  }, [router]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cards");
      const data = await res.json();

      if (Array.isArray(data)) {
        const sorted = (data as Card[]).sort(
          (a, b) => parseInt(a["Card ID"], 10) - parseInt(b["Card ID"], 10)
        );
        setCards(sorted);
      }
    } catch {
      // silent
    }
    setLoading(false);
  };

  const filtered = cards.filter(
    (c) =>
      c["Card ID"].toLowerCase().includes(search.toLowerCase()) ||
      c["Nama Bisnis"].toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalCards = cards.length;
  const totalClaimed = cards.filter((c) => c["Card Status"] === true).length;
  const totalUnclaimed = totalCards - totalClaimed;

  const handleGenerateBatch = async () => {
    const count = parseInt(batchCount, 10);
    if (isNaN(count) || count <= 0) return;

    setGenerating(true);
    try {
      const res = await fetch("/api/cards/generate-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
      });
      const data = await res.json();

      if (data.success && data.cards) {
        setCards((prev) => {
          const updated = [...prev, ...data.cards];
          return updated.sort(
            (a, b) => parseInt(a["Card ID"], 10) - parseInt(b["Card ID"], 10)
          );
        });
        setBatchCount("");
        setShowGenerate(false);
      }
    } catch {
      // silent
    }
    setGenerating(false);
  };

  const handlePermanentDelete = async (card: Card) => {
    const { error } = await supabase
      .from("cards")
      .delete()
      .eq("id", card.id);

    if (!error) {
      setPermanentDeleteConfirm(null);
      fetchCards();
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEdit) return;
    setSaving(true);

    const { error } = await supabase
      .from("cards")
      .update({
        "Nama Bisnis": editForm.business_name,
        "Nomor Telpon": editForm.phone,
      })
      .eq("id", showEdit.id);

    if (!error) {
      setShowEdit(null);
      fetchCards();
    }
    setSaving(false);
  };

  const handleUnclaim = async (card: Card) => {
    const { error } = await supabase
      .from("cards")
      .update({ "Card Status": false, "Nama Bisnis": "", "Nomor Telpon": "", "Pin": null })
      .eq("id", card.id);

    if (!error) {
      setDeleteConfirm(null);
      fetchCards();
    }
  };

  const getReviewLink = (card: Card) => {
    return `${window.location.origin}/r/${card["Card ID"]}`;
  };

  const getQrLink = (card: Card) => {
    if (card.qr_token) return `${window.location.origin}/q/${card.qr_token}`;
    return getReviewLink(card);
  };

  const getDisplayDestination = (card: Card) => {
    if (card.qr_destination) return card.qr_destination;
    return `/r/${card["Card ID"]} (default)`;
  };

  const openQR = (card: Card) => {
    setDestInput(card.qr_destination || "");
    setDestError("");
    setDestOk("");
    setShowQR(card);
  };

  const handleSaveDestination = async () => {
    if (!showQR) return;
    setSavingDest(true);
    setDestError("");
    setDestOk("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/cards/${showQR.id}/destination`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ destination: destInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDestError(data.error || "Gagal menyimpan destination");
        return;
      }
      const updated: Card = { ...showQR, qr_destination: data.qr_destination };
      setShowQR(updated);
      setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setDestOk("Destination tersimpan. QR fisik tetap sama.");
    } catch {
      setDestError("Gagal menyimpan destination.");
    } finally {
      setSavingDest(false);
    }
  };

  const copyLink = async (card: Card) => {
    const link = getQrLink(card);
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = link;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(card.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <main className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-glow/5 via-transparent to-transparent" />
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-cyan-glow/5 blur-[150px]" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-indigo-glow/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-cyan-glow to-blue-glow bg-clip-text text-transparent">
                Admin Dashboard
              </span>
            </h1>
            <p className="mt-1 text-sm text-navy-400">Kelola data kartu review</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowGenerate(true)}
              className="rounded-xl bg-gradient-to-r from-cyan-glow to-blue-glow px-5 py-2.5 text-sm font-semibold text-navy-950 shadow-lg shadow-cyan-glow/25 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-glow/40 hover:scale-[1.01] active:scale-[0.99]"
            >
              + Generate Batch
            </button>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-navy-500/30 bg-navy-800/40 px-5 py-2.5 text-sm font-medium text-navy-300 transition-all duration-300 hover:bg-navy-700/60 hover:border-red-500/30 hover:text-red-400 active:scale-[0.98]"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="glass rounded-2xl p-6 glow-border">
            <p className="text-sm text-navy-400">Total Card ID</p>
            <p className="mt-1 text-3xl font-bold text-cyan-glow">{totalCards}</p>
          </div>
          <div className="glass rounded-2xl p-6 glow-border">
            <p className="text-sm text-navy-400">Total Claimed</p>
            <p className="mt-1 text-3xl font-bold text-green-400">{totalClaimed}</p>
          </div>
          <div className="glass rounded-2xl p-6 glow-border">
            <p className="text-sm text-navy-400">Total Unclaimed</p>
            <p className="mt-1 text-3xl font-bold text-amber-400">{totalUnclaimed}</p>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Card ID atau Nama Bisnis..."
            className="w-full rounded-lg border border-navy-600/50 bg-navy-800/50 px-4 py-3 text-sm text-navy-100 placeholder-navy-500 outline-none focus:border-cyan-glow/50 focus:ring-2 focus:ring-cyan-glow/20"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-glow border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center glow-border">
            <h3 className="mb-2 text-lg font-semibold text-navy-200">Tidak ada data</h3>
            <p className="text-sm text-navy-400">
              Klik &quot;+ Generate Batch&quot; untuk menambahkan kartu baru.
            </p>
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden glow-border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-600/50">
                    <th className="px-6 py-4 text-left font-medium text-navy-400">No.</th>
                    <th className="px-6 py-4 text-left font-medium text-navy-400">Card ID</th>
                    <th className="px-6 py-4 text-left font-medium text-navy-400">Nama Bisnis</th>
                    <th className="px-6 py-4 text-left font-medium text-navy-400">No WA</th>
                    <th className="px-6 py-4 text-left font-medium text-navy-400">Status</th>
                    <th className="px-6 py-4 text-left font-medium text-navy-400">Tanggal</th>
                    <th className="px-6 py-4 text-right font-medium text-navy-400">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((card, index) => (
                    <tr key={card.id} className="border-b border-navy-700/50 last:border-0 hover:bg-navy-800/30 transition-colors">
                      <td className="px-6 py-4 text-navy-400 text-xs font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                      <td className="px-6 py-4 font-mono text-xs font-medium text-cyan-glow">{card["Card ID"]}</td>
                      <td className="px-6 py-4 text-navy-200">{card["Nama Bisnis"] || "-"}</td>
                      <td className="px-6 py-4 text-navy-300">{card["Nomor Telpon"] || "-"}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          card["Card Status"] === true
                            ? "bg-green-500/10 text-green-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}>
                          {card["Card Status"] === true ? "Claimed" : "Unclaimed"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-navy-400 text-xs">
                        {new Date(card.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditForm({
                                business_name: card["Nama Bisnis"],
                                phone: card["Nomor Telpon"],
                              });
                              setEditPinInput("");
                              setEditPinError("");
                              setEditPinVerified(false);
                              setShowEdit(card);
                            }}
                            className="rounded-lg border border-navy-500/30 bg-navy-800/40 px-3 py-1.5 text-xs font-medium text-navy-300 transition-all hover:bg-navy-700/60 hover:border-cyan-glow/30 hover:text-cyan-glow active:scale-95"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              copyLink(card);
                            }}
                            className="rounded-lg border border-navy-500/30 bg-navy-800/40 px-3 py-1.5 text-xs font-medium text-navy-300 transition-all hover:bg-navy-700/60 hover:border-cyan-glow/30 hover:text-cyan-glow active:scale-95"
                          >
                            {copied === card.id ? "✓" : "Link"}
                          </button>
                          <button
                            onClick={() => openQR(card)}
                            className="rounded-lg border border-navy-500/30 bg-navy-800/40 px-3 py-1.5 text-xs font-medium text-navy-300 transition-all hover:bg-navy-700/60 hover:border-amber-500/30 hover:text-amber-400 active:scale-95"
                          >
                            QR
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(card)}
                            className="rounded-lg border border-navy-500/30 bg-navy-800/40 px-3 py-1.5 text-xs font-medium text-navy-300 transition-all hover:bg-navy-700/60 hover:border-amber-500/30 hover:text-amber-400 active:scale-95"
                          >
                            Reset
                          </button>
                          <button
                            onClick={() => setPermanentDeleteConfirm(card)}
                            className="rounded-lg border border-navy-500/30 bg-navy-800/40 px-3 py-1.5 text-xs font-medium text-navy-300 transition-all hover:bg-navy-700/60 hover:border-red-500/30 hover:text-red-400 active:scale-95"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between border-t border-navy-600/50 px-6 py-4">
                <p className="text-sm text-navy-400">
                  Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} data
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-navy-500/30 bg-navy-800/40 px-3 py-1.5 text-xs font-medium text-navy-300 transition-all hover:bg-navy-700/60 hover:border-cyan-glow/30 hover:text-cyan-glow active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-navy-800/40 disabled:hover:border-navy-500/30 disabled:hover:text-navy-300"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      if (totalPages <= 7) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      return false;
                    })
                    .reduce<(number | string)[]>((acc, page, idx, arr) => {
                      if (idx > 0 && typeof arr[idx - 1] === "number" && page - (arr[idx - 1] as number) > 1) {
                        acc.push("...");
                      }
                      acc.push(page);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      typeof item === "string" ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-navy-500 text-xs">...</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setCurrentPage(item)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                            currentPage === item
                              ? "bg-gradient-to-r from-cyan-glow to-blue-glow text-navy-950 shadow-lg shadow-cyan-glow/25"
                              : "border border-navy-500/30 bg-navy-800/40 text-navy-300 hover:bg-navy-700/60 hover:border-cyan-glow/30 hover:text-cyan-glow"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-navy-500/30 bg-navy-800/40 px-3 py-1.5 text-xs font-medium text-navy-300 transition-all hover:bg-navy-700/60 hover:border-cyan-glow/30 hover:text-cyan-glow active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-navy-800/40 disabled:hover:border-navy-500/30 disabled:hover:text-navy-300"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {showGenerate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg glass rounded-2xl p-8 glow-border">
              <h2 className="mb-2 text-xl font-bold text-navy-100">Generate Batch Baru</h2>
              <p className="mb-4 text-sm text-navy-400">
                Masukkan jumlah kartu yang ingin dibuat. ID akan otomatis menggunakan format angka berurutan.
              </p>
              <input
                type="number"
                min={1}
                max={1000}
                value={batchCount}
                onChange={(e) => setBatchCount(e.target.value)}
                placeholder="Contoh: 10"
                className="w-full rounded-lg border border-navy-600/50 bg-navy-800/50 px-4 py-3 text-sm text-navy-100 placeholder-navy-500 outline-none focus:border-cyan-glow/50 focus:ring-2 focus:ring-cyan-glow/20"
              />
              <p className="mt-2 text-xs text-navy-500">
                {batchCount && parseInt(batchCount) > 0
                  ? `${batchCount} kartu akan dibuat mulai dari ${getNextCardId(cards)}`
                  : "Masukkan jumlah kartu"}
              </p>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => { setShowGenerate(false); setBatchCount(""); }}
                  className="flex-1 rounded-xl border border-navy-500/30 bg-navy-800/40 px-6 py-3 text-sm font-medium text-navy-300 transition-all hover:bg-navy-700/60 active:scale-[0.98]"
                >
                  Batal
                </button>
                <button
                  onClick={handleGenerateBatch}
                  disabled={generating || !batchCount || parseInt(batchCount) <= 0}
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyan-glow to-blue-glow px-6 py-3 text-sm font-semibold text-navy-950 shadow-lg shadow-cyan-glow/25 transition-all hover:shadow-xl hover:shadow-cyan-glow/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {generating ? "Membuat..." : "Generate"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg glass rounded-2xl p-8 glow-border">
              {!editPinVerified ? (
                <>
                  <h2 className="mb-2 text-xl font-bold text-navy-100">Verifikasi PIN</h2>
                  <p className="mb-6 text-sm text-navy-400">
                    Masukkan PIN untuk mengedit data kartu{" "}
                    <span className="font-mono font-semibold text-cyan-glow">{showEdit["Card ID"]}</span>
                  </p>
                  <input
                    type="password"
                    value={editPinInput}
                    onChange={(e) => {
                      setEditPinInput(e.target.value.replace(/[^0-9]/g, "").slice(0, 6));
                      setEditPinError("");
                    }}
                    placeholder="Masukkan 6 digit PIN"
                    maxLength={6}
                    className="w-full rounded-lg border border-navy-600/50 bg-navy-800/50 px-4 py-3 text-sm text-navy-100 placeholder-navy-500 outline-none focus:border-cyan-glow/50 focus:ring-2 focus:ring-cyan-glow/20"
                  />
                  {editPinError && (
                    <p className="mt-2 text-xs text-red-400">{editPinError}</p>
                  )}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowEdit(null)}
                      className="flex-1 rounded-xl border border-navy-500/30 bg-navy-800/40 px-6 py-3 text-sm font-medium text-navy-300 transition-all hover:bg-navy-700/60 active:scale-[0.98]"
                    >
                      Batal
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/verify-pin", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ cardId: showEdit.id, pin: editPinInput }),
                          });
                          const data = await res.json();
                          if (data.valid) {
                            setEditPinVerified(true);
                            setEditPinError("");
                          } else {
                            setEditPinError("PIN salah. Silakan coba lagi.");
                          }
                        } catch {
                          setEditPinError("Gagal verifikasi PIN.");
                        }
                      }}
                      disabled={editPinInput.length !== 6}
                      className="flex-1 rounded-xl bg-gradient-to-r from-cyan-glow to-blue-glow px-6 py-3 text-sm font-semibold text-navy-950 shadow-lg shadow-cyan-glow/25 transition-all hover:shadow-xl hover:shadow-cyan-glow/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                    >
                      Verifikasi
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="mb-6 text-xl font-bold text-navy-100">Edit Data</h2>
                  <form onSubmit={handleEdit} className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-navy-200">Card ID</label>
                      <input
                        type="text"
                        value={showEdit["Card ID"]}
                        disabled
                        className="w-full rounded-lg border border-navy-600/50 bg-navy-800/30 px-4 py-3 text-sm text-navy-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-navy-200">Nama Bisnis</label>
                      <input
                        type="text"
                        value={editForm.business_name}
                        onChange={(e) => setEditForm({ ...editForm, business_name: e.target.value })}
                        className="w-full rounded-lg border border-navy-600/50 bg-navy-800/50 px-4 py-3 text-sm text-navy-100 outline-none focus:border-cyan-glow/50 focus:ring-2 focus:ring-cyan-glow/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-navy-200">No WhatsApp</label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value.replace(/[^0-9]/g, "").slice(0, 13) })}
                        placeholder="8123456789"
                        className="w-full rounded-lg border border-navy-600/50 bg-navy-800/50 px-4 py-3 text-sm text-navy-100 placeholder-navy-500 outline-none focus:border-cyan-glow/50 focus:ring-2 focus:ring-cyan-glow/20"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowEdit(null)}
                        className="flex-1 rounded-xl border border-navy-500/30 bg-navy-800/40 px-6 py-3 text-sm font-medium text-navy-300 transition-all hover:bg-navy-700/60 active:scale-[0.98]"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 rounded-xl bg-gradient-to-r from-cyan-glow to-blue-glow px-6 py-3 text-sm font-semibold text-navy-950 shadow-lg shadow-cyan-glow/25 transition-all hover:shadow-xl hover:shadow-cyan-glow/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                      >
                        {saving ? "Menyimpan..." : "Simpan"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        {showQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md glass rounded-2xl p-8 glow-border max-h-[90vh] overflow-y-auto">
              <h2 className="mb-1 text-xl font-bold text-navy-100 text-center">
                QR Code - {showQR["Card ID"]}
              </h2>
              <p className="mb-1 text-xs text-navy-500 text-center font-mono">
                Token: {showQR.qr_token || "- (jalankan backfill)"}
              </p>
              <p className="mb-4 text-sm text-navy-400 text-center">
                QR fisik berisi link dinamis. Ganti tujuan tanpa cetak ulang.
              </p>
              <div ref={qrRef} className="flex justify-center mb-4">
                <div className="rounded-xl bg-white p-6 shadow-lg shadow-cyan-glow/10">
                  <QRCodeSVG
                    value={getQrLink(showQR)}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#0a1628"
                    level="M"
                    includeMargin={false}
                  />
                </div>
              </div>
              <p className="mb-4 text-xs text-navy-400 text-center break-all">
                QR → <span className="font-mono text-cyan-glow">{getQrLink(showQR)}</span>
                <br />
                Tujuan → <span className="font-mono text-navy-200">{getDisplayDestination(showQR)}</span>
              </p>
              <div className="mb-4 rounded-xl border border-navy-600/50 bg-navy-800/40 p-4">
                <label className="mb-1.5 block text-sm font-medium text-navy-200">
                  Edit QR Destination
                </label>
                <input
                  type="text"
                  value={destInput}
                  onChange={(e) => { setDestInput(e.target.value); setDestError(""); setDestOk(""); }}
                  placeholder="/r/571 (default) atau /promo atau https://..."
                  className="w-full rounded-lg border border-navy-600/50 bg-navy-800/50 px-4 py-2.5 text-sm text-navy-100 placeholder-navy-500 outline-none focus:border-cyan-glow/50 focus:ring-2 focus:ring-cyan-glow/20"
                />
                <p className="mt-1.5 text-[11px] leading-relaxed text-navy-500">
                  Kosongkan untuk kembali ke default. Internal: <span className="font-mono">/promo</span>, <span className="font-mono">/r/571</span>. Eksternal wajib <span className="font-mono">https://</span>.
                </p>
                {destError && <p className="mt-2 text-xs text-red-400">{destError}</p>}
                {destOk && <p className="mt-2 text-xs text-green-400">{destOk}</p>}
                <button
                  onClick={handleSaveDestination}
                  disabled={savingDest}
                  className="mt-3 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/40 active:scale-[0.99] disabled:opacity-50"
                >
                  {savingDest ? "Menyimpan..." : "Simpan Destination"}
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowQR(null)}
                  className="flex-1 rounded-xl border border-navy-500/30 bg-navy-800/40 px-6 py-3 text-sm font-medium text-navy-300 transition-all hover:bg-navy-700/60 active:scale-[0.98]"
                >
                  Tutup
                </button>
                <button
                  onClick={() => copyLink(showQR)}
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyan-glow to-blue-glow px-6 py-3 text-sm font-semibold text-navy-950 shadow-lg shadow-cyan-glow/25 transition-all hover:shadow-xl hover:shadow-cyan-glow/40 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {copied === showQR.id ? "✓ Tersalin!" : "Salin Link QR"}
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md glass rounded-2xl p-8 glow-border">
              <div className="mb-4 flex justify-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20">
                  <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                  </svg>
                </div>
              </div>
              <h2 className="mb-2 text-xl font-bold text-navy-100 text-center">Reset Kartu?</h2>
              <p className="mb-6 text-sm text-navy-400 text-center">
                Kartu <span className="font-semibold text-navy-200">{deleteConfirm["Card ID"]}</span> akan di-reset. Data bisnis dan status claimed akan dihapus.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 rounded-xl border border-navy-500/30 bg-navy-800/40 px-6 py-3 text-sm font-medium text-navy-300 transition-all hover:bg-navy-700/60 active:scale-[0.98]"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleUnclaim(deleteConfirm)}
                  className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/40 hover:scale-[1.01] active:scale-[0.99]"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {permanentDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md glass rounded-2xl p-8 glow-border">
              <div className="mb-4 flex justify-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                  <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </div>
              </div>
              <h2 className="mb-2 text-xl font-bold text-navy-100 text-center">Hapus Kartu?</h2>
              <p className="mb-6 text-sm text-navy-400 text-center">
                Kartu <span className="font-semibold text-navy-200">{permanentDeleteConfirm["Card ID"]}</span> akan dihapus <span className="font-semibold text-red-400">secara permanen</span>. Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setPermanentDeleteConfirm(null)}
                  className="flex-1 rounded-xl border border-navy-500/30 bg-navy-800/40 px-6 py-3 text-sm font-medium text-navy-300 transition-all hover:bg-navy-700/60 active:scale-[0.98]"
                >
                  Batal
                </button>
                <button
                  onClick={() => handlePermanentDelete(permanentDeleteConfirm)}
                  className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.01] active:scale-[0.99]"
                >
                  Hapus Permanen
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-navy-600">
          <Link href="/" className="text-cyan-glow/60 hover:text-cyan-glow transition-colors">
            ← Kembali ke Beranda
          </Link>
        </p>
      </div>
    </main>
  );
}
