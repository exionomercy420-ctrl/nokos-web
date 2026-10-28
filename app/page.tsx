
"use client";

import { createClient } from "@/lib/supabase/client";

import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Menu =
  | "Dashboard"
  | "Beli Nokos"
  | "Order Aktif"
  | "Riwayat Order"
  | "Top Up Saldo"
  | "Mutasi Saldo"
  | "Profil";

type TransactionStatus = "Menunggu Pembayaran" | "Berhasil" | "Gagal";

type WalletTransaction = {
  id: string;
  createdAt: string;
  amount: number;
  method: string;
  status: TransactionStatus;
};

type WalletApiResponse = {
  balance?: number;
  saldo?: number;
  updatedAt?: string;
  "diperbarui pada"?: string;
  transactions?: unknown[];
  transaksi?: unknown[];
  error?: string;
};

type Service = {
  name: string;
  icon: string;
  category: string;
  price: number;
  description: string;
  color: string;
};

const menus: { name: Menu; icon: string }[] = [
  { name: "Dashboard", icon: "⌂" },
  { name: "Beli Nokos", icon: "▣" },
  { name: "Order Aktif", icon: "◷" },
  { name: "Riwayat Order", icon: "▤" },
  { name: "Top Up Saldo", icon: "＋" },
  { name: "Mutasi Saldo", icon: "⇄" },
  { name: "Profil", icon: "◎" },
];

const services: Service[] = [
  {
    name: "WhatsApp",
    icon: "✆",
    category: "Komunikasi",
    price: 8000,
    description: "Nomor virtual untuk verifikasi WhatsApp",
    color: "bg-green-500/15 text-green-400",
  },
  {
    name: "Telegram",
    icon: "➤",
    category: "Komunikasi",
    price: 7000,
    description: "Nomor virtual untuk verifikasi Telegram",
    color: "bg-sky-500/15 text-sky-400",
  },
  {
    name: "Instagram",
    icon: "◎",
    category: "Sosial Media",
    price: 9000,
    description: "Nomor virtual untuk verifikasi Instagram",
    color: "bg-pink-500/15 text-pink-400",
  },
  {
    name: "Google",
    icon: "G",
    category: "Email",
    price: 12000,
    description: "Nomor virtual untuk verifikasi Google",
    color: "bg-yellow-500/15 text-yellow-400",
  },
  {
    name: "Facebook",
    icon: "f",
    category: "Sosial Media",
    price: 8000,
    description: "Nomor virtual untuk verifikasi Facebook",
    color: "bg-blue-500/15 text-blue-400",
  },
  {
    name: "TikTok",
    icon: "♪",
    category: "Sosial Media",
    price: 10000,
    description: "Nomor virtual untuk verifikasi TikTok",
    color: "bg-white/10 text-white",
  },
];

const categories = ["Semua", "Komunikasi", "Sosial Media", "Email"];

const paymentMethods = ["QRIS", "DANA", "GoPay", "Transfer Bank"];

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

function normalizeTransaction(raw: unknown): WalletTransaction | null {
  if (!raw || typeof raw !== "object") return null;

  const item = raw as Record<string, unknown>;

  const id = String(item.id ?? item.reference_id ?? "");
  const createdAt = String(item.createdAt ?? item.created_at ?? "");
  const amount = Number(item.amount);

  if (
    !id ||
    !createdAt ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return null;
  }

  const rawStatus = String(item.status ?? "").toLowerCase();

  let status: TransactionStatus;

  if (["success", "berhasil", "paid"].includes(rawStatus)) {
    status = "Berhasil";
  } else if (
    ["failed", "gagal", "expired", "cancelled", "canceled"].includes(
      rawStatus,
    )
  ) {
    status = "Gagal";
  } else {
    status = "Menunggu Pembayaran";
  }

  return {
    id,
    createdAt,
    amount,
    method: String(
      item.method ??
        item.payment_method ??
        item.description ??
        "Top up",
    ),
    status,
  };
}

export default function Home() {
  const [active, setActive] = useState<Menu>("Dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const previousScrollY = useRef(0);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [phoneCountry, setPhoneCountry] = useState("Indonesia");

  const [topupAmount, setTopupAmount] = useState("25000");
  const [paymentMethod, setPaymentMethod] = useState("QRIS");

  const [notice, setNotice] = useState("");
  const [profileName, setProfileName] = useState("Memuat profil...");
  const [profileEmail, setProfileEmail] = useState("");

  // Ambil identitas dari sesi Supabase, bukan placeholder frontend.
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getUser();
        if (cancelled || error || !data.user) return;

        const user = data.user;
        const email = user.email ?? "";
        const metadata = user.user_metadata ?? {};
        const metadataName = metadata.full_name ?? metadata.name ?? metadata.display_name;
        const name = typeof metadataName === "string" && metadataName.trim()
          ? metadataName.trim()
          : email || "Pengguna";

        setProfileEmail(email);
        setProfileName(name);
      } catch (error) {
        console.error("Gagal memuat profil pengguna:", error);
      }
    }

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const [walletTransactions, setWalletTransactions] = useState<
    WalletTransaction[]
  >([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState("");

  // Sidebar mengecil ketika halaman digulir ke bawah.
  useEffect(() => {
    const getScrollPosition = (event?: Event) => {
      const target = event?.target;

      if (
        target instanceof HTMLElement &&
        target !== document.body &&
        target !== document.documentElement &&
        target.scrollHeight > target.clientHeight
      ) {
        return target.scrollTop;
      }

      return window.scrollY || document.documentElement.scrollTop || 0;
    };

    const handleScroll = (event: Event) => {
      const target = event.target;

      if (target instanceof HTMLElement && target.closest("aside")) return;

      const currentScrollY = getScrollPosition(event);
      const difference = currentScrollY - previousScrollY.current;

      if (currentScrollY <= 80) {
        setSidebarCollapsed(false);
      } else if (difference > 6) {
        setSidebarCollapsed(true);
      } else if (difference < -6) {
        setSidebarCollapsed(false);
      }

      previousScrollY.current = currentScrollY;
    };

    previousScrollY.current = getScrollPosition();

    document.addEventListener("scroll", handleScroll, {
      passive: true,
      capture: true,
    });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Saldo dan transaksi hanya dibaca dari backend.
  useEffect(() => {
    let cancelled = false;

    async function loadWallet() {
      setWalletLoading(true);
      setWalletError("");

      try {
        const response = await fetch("/api/wallet", {
          method: "GET",
          cache: "no-store",
        });

        const data = (await response.json()) as WalletApiResponse;

        if (!response.ok) {
          throw new Error(data.error || "Gagal memuat data saldo.");
        }

        const balance = Number(data.balance ?? data.saldo ?? 0);
        const rawTransactions = data.transactions ?? data.transaksi ?? [];

        if (!Number.isFinite(balance) || balance < 0) {
          throw new Error("Format saldo dari server tidak valid.");
        }

        if (!Array.isArray(rawTransactions)) {
          throw new Error("Format riwayat transaksi tidak valid.");
        }

        const transactions = rawTransactions
          .map(normalizeTransaction)
          .filter(
            (item): item is WalletTransaction => item !== null,
          );

        if (!cancelled) {
          setWalletBalance(balance);
          setWalletTransactions(transactions);
        }
      } catch (error) {
        if (!cancelled) {
          setWalletError(
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat memuat saldo.",
          );
        }
      } finally {
        if (!cancelled) setWalletLoading(false);
      }
    }

    void loadWallet();

    return () => {
      cancelled = true;
    };
  }, []);

  const pendingTopups = walletTransactions.filter(
    (item) => item.status === "Menunggu Pembayaran",
  );

  const totalMoneyIn = walletTransactions
    .filter((item) => item.status === "Berhasil")
    .reduce((total, item) => total + item.amount, 0);

  const filteredServices = useMemo(
    () =>
      services.filter((service) => {
        const matchesSearch = service.name
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchesCategory =
          category === "Semua" || service.category === category;

        return matchesSearch && matchesCategory;
      }),
    [search, category],
  );

  function navigate(menu: Menu) {
    setActive(menu);
    setNotice("");
    setSelectedService(null);
  }

  function chooseService(service: Service) {
    setSelectedService(service);
    setNotice("");
  }

  function renderDashboard() {
    const stats = [
      {
        label: "Saldo Akun",
        value: walletLoading ? "Memuat..." : formatRupiah(walletBalance),
        icon: "◈",
        color: "text-violet-300",
      },
      {
        label: "Order Aktif",
        value: "0",
        icon: "◷",
        color: "text-sky-300",
      },
      {
        label: "Total Transaksi",
        value: String(walletTransactions.length),
        icon: "▤",
        color: "text-green-300",
      },
      {
        label: "Total Top Up Berhasil",
        value: formatRupiah(totalMoneyIn),
        icon: "⇄",
        color: "text-orange-300",
      },
    ];

    return (
      <>
        <section className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-700 via-purple-800 to-[#21123d] p-6 md:p-9">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-fuchsia-400/15 blur-3xl" />

          <div className="relative z-10 max-w-2xl">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-violet-100">
              PLATFORM NOKOS
            </span>

            <h2 className="mt-5 text-3xl font-bold leading-tight md:text-4xl">
              Semua kebutuhan
              <br />
              nomor virtual, satu tempat.
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-6 text-violet-100/80">
              Kelola pesanan nomor virtual, pantau status OTP, dan cek saldo
              dari satu dashboard.
            </p>

            <button
              onClick={() => navigate("Beli Nokos")}
              className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-bold text-violet-800 transition hover:bg-violet-100"
            >
              Mulai Beli Nokos ↗
            </button>
          </div>

          <div className="absolute bottom-5 right-8 hidden text-8xl font-black text-white/10 md:block">
            N
          </div>
        </section>

        {walletError && (
          <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
            Gagal memuat saldo: {walletError}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-[#151020] p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">{stat.label}</p>
                <span className={`text-2xl ${stat.color}`}>{stat.icon}</span>
              </div>
              <p className="mt-4 text-2xl font-bold">{stat.value}</p>
              <p className="mt-1 text-xs text-gray-500">Data dari server</p>
            </div>
          ))}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">Layanan Populer</h3>
              <p className="mt-1 text-sm text-gray-400">
                Pilih layanan untuk melihat detail.
              </p>
            </div>

            <button
              onClick={() => navigate("Beli Nokos")}
              className="text-sm font-semibold text-violet-300 hover:text-white"
            >
              Lihat Semua →
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {services.slice(0, 3).map((service) => (
              <ServiceCard
                key={service.name}
                service={service}
                onChoose={chooseService}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#151020] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">Transaksi Terbaru</h3>
              <p className="mt-1 text-sm text-gray-400">
                Ringkasan aktivitas akun.
              </p>
            </div>

            <button
              onClick={() => navigate("Mutasi Saldo")}
              className="text-sm text-violet-300 hover:text-white"
            >
              Lihat Riwayat →
            </button>
          </div>

          {walletTransactions.length === 0 ? (
            <EmptyState
              icon="▤"
              title="Belum ada transaksi"
              description="Transaksi dari backend akan ditampilkan di sini."
            />
          ) : (
            <div className="mt-5 space-y-3">
              {walletTransactions.slice(0, 5).map((item) => (
                <TransactionRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </>
    );
  }

  function renderBuyPage() {
    return (
      <>
        <section className="rounded-2xl border border-white/10 bg-[#151020] p-5 md:p-6">
          <h3 className="text-lg font-bold">Cari Layanan Nokos</h3>
          <p className="mt-1 text-sm text-gray-400">
            Cari aplikasi dan pilih layanan yang kamu butuhkan.
          </p>

          <div className="mt-5">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari WhatsApp, Telegram, Google..."
              className="w-full rounded-xl border border-white/10 bg-[#0e0a16] px-4 py-3 text-sm outline-none transition placeholder:text-gray-500 focus:border-violet-500"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-lg px-4 py-2 text-sm transition ${
                  category === item
                    ? "bg-violet-600 text-white"
                    : "border border-white/10 bg-white/[0.03] text-gray-400 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {selectedService && (
          <section className="rounded-2xl border border-violet-400/30 bg-violet-500/[0.07] p-5 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                  Detail layanan
                </p>
                <h3 className="mt-2 text-xl font-bold">
                  {selectedService.name}
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  {selectedService.description}
                </p>
              </div>

              <button
                onClick={() => setSelectedService(null)}
                className="rounded-lg px-3 py-1 text-gray-400 hover:bg-white/10 hover:text-white"
                aria-label="Tutup detail"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Negara
                </label>
                <select
                  value={phoneCountry}
                  onChange={(event) => setPhoneCountry(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0e0a16] px-3 py-3 text-sm outline-none focus:border-violet-500"
                >
                  <option>Indonesia</option>
                  <option>Malaysia</option>
                  <option>Thailand</option>
                  <option>Filipina</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Harga
                </label>
                <div className="rounded-xl border border-white/10 bg-[#0e0a16] px-3 py-3 text-sm font-bold text-violet-300">
                  {formatRupiah(selectedService.price)}
                </div>
              </div>
            </div>

            <p className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs leading-5 text-yellow-200/80">
              Harga masih contoh. Pembelian nomor sungguhan membutuhkan
              integrasi API penyedia dan pemeriksaan saldo di server.
            </p>

            <button
              onClick={() =>
                setNotice(
                  `Layanan ${selectedService.name} (${phoneCountry}) dipilih. Pembelian belum diproses karena API penyedia belum terhubung.`,
                )
              }
              className="mt-4 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold transition hover:bg-violet-500"
            >
              Lanjutkan Pembelian
            </button>

            {notice && (
              <p className="mt-3 text-sm leading-6 text-violet-200">
                {notice}
              </p>
            )}
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.name}
              service={service}
              onChoose={chooseService}
            />
          ))}

          {filteredServices.length === 0 && (
            <div className="sm:col-span-2 xl:col-span-3">
              <EmptyState
                icon="⌕"
                title="Layanan tidak ditemukan"
                description="Coba kata pencarian atau kategori yang lain."
              />
            </div>
          )}
        </section>
      </>
    );
  }

  function renderOrders() {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#151020] p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Daftar Order Aktif</h3>
            <p className="mt-1 text-sm text-gray-400">
              Pantau nomor dan status penerimaan OTP.
            </p>
          </div>

          <span className="rounded-lg bg-yellow-500/10 px-3 py-2 text-xs text-yellow-300">
            0 order aktif
          </span>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="border-y border-white/10 text-gray-400">
              <tr>
                <th className="px-3 py-4 font-medium">Layanan</th>
                <th className="px-3 py-4 font-medium">Nomor</th>
                <th className="px-3 py-4 font-medium">OTP</th>
                <th className="px-3 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-8 text-center text-gray-500"
                >
                  Belum ada order aktif.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs leading-5 text-gray-500">
          Data pesanan akan tampil setelah backend dan API penyedia
          diintegrasikan.
        </p>

        <button
          onClick={() => navigate("Beli Nokos")}
          className="mt-5 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold hover:bg-violet-500"
        >
          + Buat Pesanan
        </button>
      </section>
    );
  }

  function renderHistory() {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#151020] p-5 md:p-6">
        <h3 className="text-lg font-bold">Riwayat Order</h3>
        <p className="mt-1 text-sm text-gray-400">
          Semua pesanan yang selesai, dibatalkan, atau kedaluwarsa.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <input
            placeholder="Cari ID transaksi..."
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0e0a16] px-4 py-3 text-sm outline-none focus:border-violet-500"
          />
          <button
            onClick={() =>
              setNotice("Filter riwayat order membutuhkan integrasi backend.")
            }
            className="rounded-xl border border-white/10 px-4 py-3 text-sm hover:bg-white/5"
          >
            Cari
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[550px] text-left text-sm">
            <thead className="border-y border-white/10 text-gray-400">
              <tr>
                <th className="px-3 py-4 font-medium">ID Order</th>
                <th className="px-3 py-4 font-medium">Layanan</th>
                <th className="px-3 py-4 font-medium">Harga</th>
                <th className="px-3 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-8 text-center text-gray-500"
                >
                  Belum ada riwayat order.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {notice && <p className="mt-4 text-sm text-violet-300">{notice}</p>}
      </section>
    );
  }

  function renderTopup() {
    const amount = Number(topupAmount);
    const validAmount =
      Number.isFinite(amount) &&
      Number.isInteger(amount) &&
      amount >= 10000;

    function createTopup(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();

      if (!validAmount) {
        setNotice("Nominal minimal Rp10.000 dan harus berupa angka bulat.");
        return;
      }

      setNotice(
        "Top up belum tersedia. Integrasi payment gateway belum aktif, sehingga belum ada tagihan yang dibuat.",
      );
    }

    return (
      <div className="space-y-5">
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-700/30 to-[#151020] p-5">
            <p className="text-sm text-gray-400">Saldo tersedia</p>
            <p className="mt-2 text-3xl font-bold">
              {walletLoading ? "Memuat..." : formatRupiah(walletBalance)}
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Saldo ditampilkan dari server.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#151020] p-5">
            <p className="text-sm text-gray-400">
              Top up menunggu pembayaran
            </p>
            <p className="mt-2 text-3xl font-bold">
              {pendingTopups.length}
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Transaksi yang belum terkonfirmasi.
            </p>
          </div>
        </section>

        {walletError && (
          <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
            Gagal memuat saldo: {walletError}
          </div>
        )}

        <div className="grid items-start gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl border border-white/10 bg-[#151020] p-5 md:p-6">
            <h3 className="text-lg font-bold">Isi Saldo</h3>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              Masukkan nominal dan pilih metode pembayaran. Pembuatan tagihan
              belum aktif sebelum payment gateway terhubung.
            </p>

            <form className="mt-6 space-y-5" onSubmit={createTopup}>
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Nominal top up
                </label>
                <input
                  type="number"
                  min="10000"
                  step="1000"
                  value={topupAmount}
                  onChange={(event) => setTopupAmount(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0e0a16] px-4 py-3 text-sm outline-none focus:border-violet-500"
                  required
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  {[10000, 25000, 50000, 100000].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTopupAmount(String(value))}
                      className={`rounded-lg border px-3 py-2 text-xs ${
                        amount === value
                          ? "border-violet-500 bg-violet-500/15 text-violet-200"
                          : "border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      {formatRupiah(value)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm text-gray-300">
                  Metode pembayaran
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`rounded-xl border p-4 text-left text-sm font-semibold transition ${
                        paymentMethod === method
                          ? "border-violet-500 bg-violet-500/10 text-white"
                          : "border-white/10 text-gray-400 hover:bg-white/[0.03]"
                      }`}
                    >
                      <span className="block text-xs text-violet-300">
                        METODE
                      </span>
                      <span className="mt-2 block">{method}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-violet-600 px-4 py-3 font-bold hover:bg-violet-500"
              >
                Buat Permintaan Top Up
              </button>

              {notice && (
                <p className="rounded-xl border border-violet-400/20 bg-violet-500/10 p-3 text-sm leading-6 text-violet-200">
                  {notice}
                </p>
              )}
            </form>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#151020] p-5 md:p-6">
            <h3 className="font-bold">Ringkasan Top Up</h3>

            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between gap-3 text-gray-400">
                <span>Nominal</span>
                <span className="text-white">
                  {formatRupiah(Number.isFinite(amount) ? amount : 0)}
                </span>
              </div>

              <div className="flex justify-between gap-3 text-gray-400">
                <span>Metode</span>
                <span className="text-white">{paymentMethod}</span>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between gap-3 font-bold">
                  <span>Total</span>
                  <span className="text-violet-300">
                    {formatRupiah(Number.isFinite(amount) ? amount : 0)}
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-5 rounded-xl border border-amber-400/15 bg-amber-500/[0.06] p-4 text-xs leading-5 text-amber-100/80">
              Belum ada pembayaran nyata yang diproses. Jangan menganggap
              nominal ini sebagai tagihan yang sudah dibayar.
            </p>
          </section>
        </div>

        <section className="rounded-2xl border border-white/10 bg-[#151020] p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">Riwayat Top Up</h3>
              <p className="mt-1 text-sm text-gray-400">
                Transaksi yang dikembalikan backend.
              </p>
            </div>

            <span className="rounded-lg bg-violet-500/10 px-3 py-2 text-xs text-violet-200">
              {walletTransactions.length} transaksi
            </span>
          </div>

          {walletTransactions.length === 0 ? (
            <EmptyState
              icon="＋"
              title="Belum ada top up"
              description="Transaksi top up yang tersimpan di server akan muncul di sini."
            />
          ) : (
            <div className="mt-5 space-y-3">
              {walletTransactions.map((item) => (
                <TransactionRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  function renderMutations() {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#151020] p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Mutasi Saldo</h3>
            <p className="mt-1 text-sm text-gray-400">
              Riwayat transaksi saldo dari server.
            </p>
          </div>

          <button
            onClick={() => navigate("Top Up Saldo")}
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold hover:bg-violet-500"
          >
            + Top Up
          </button>
        </div>

        {walletError && (
          <p className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
            {walletError}
          </p>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm text-gray-400">
              Total uang masuk berhasil
            </p>
            <p className="mt-2 text-2xl font-bold text-green-300">
              {formatRupiah(totalMoneyIn)}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm text-gray-400">Saldo tersedia</p>
            <p className="mt-2 text-2xl font-bold text-violet-300">
              {walletLoading ? "Memuat..." : formatRupiah(walletBalance)}
            </p>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="border-y border-white/10 text-gray-400">
              <tr>
                <th className="px-3 py-4 font-medium">Tanggal</th>
                <th className="px-3 py-4 font-medium">ID / Keterangan</th>
                <th className="px-3 py-4 font-medium">Tipe</th>
                <th className="px-3 py-4 font-medium">Status</th>
                <th className="px-3 py-4 text-right font-medium">Nominal</th>
              </tr>
            </thead>

            <tbody>
              {walletTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-8 text-center text-gray-500"
                  >
                    {walletLoading
                      ? "Memuat transaksi..."
                      : "Belum ada mutasi saldo."}
                  </td>
                </tr>
              ) : (
                walletTransactions.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-white/[0.05]"
                  >
                    <td className="whitespace-nowrap px-3 py-4 text-gray-400">
                      {new Date(item.createdAt).toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-medium">Top up {item.method}</p>
                      <p className="mt-1 text-xs text-gray-500">{item.id}</p>
                    </td>
                    <td className="px-3 py-4 text-green-300">Uang masuk</td>
                    <td className="px-3 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-right font-semibold">
                      {item.status === "Berhasil" ? "+" : ""}
                      {formatRupiah(item.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs leading-5 text-gray-500">
          Saldo dan status transaksi dikelola oleh backend. Pembayaran harus
          diverifikasi oleh payment gateway sebelum saldo ditambahkan.
        </p>
      </section>
    );
  }

  function renderProfile() {
    return (
      <div className="grid items-start gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-2xl border border-white/10 bg-[#151020] p-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-700 text-3xl font-bold">
            {profileName.charAt(0).toUpperCase() || "P"}
          </div>

          <h3 className="mt-4 text-xl font-bold">{profileName}</h3>
          <p className="mt-1 break-all text-sm text-gray-400">
            {profileEmail}
          </p>

          <span className="mt-4 inline-block rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
            Profil
          </span>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#151020] p-5 md:p-6">
          <h3 className="text-lg font-bold">Pengaturan Profil</h3>
          <p className="mt-1 text-sm text-gray-400">
            Ubah informasi tampilan profil.
          </p>

          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              setNotice(
                "Informasi profil diperbarui pada tampilan ini. Penyimpanan permanen belum dihubungkan.",
              );
            }}
          >
            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Nama pengguna
              </label>
              <input
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-[#0e0a16] px-4 py-3 text-sm outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={profileEmail}
                onChange={(event) => setProfileEmail(event.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-[#0e0a16] px-4 py-3 text-sm outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold hover:bg-violet-500"
            >
              Simpan Perubahan
            </button>

            {notice && (
              <p className="text-sm leading-6 text-violet-300">{notice}</p>
            )}
          </form>

          <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-gray-500">
            Data profil saat ini hanya berubah pada tampilan. Hubungkan ke
            Supabase agar perubahan tersimpan permanen.
          </p>
        </section>
      </div>
    );
  }

  function renderContent() {
    switch (active) {
      case "Dashboard":
        return renderDashboard();
      case "Beli Nokos":
        return renderBuyPage();
      case "Order Aktif":
        return renderOrders();
      case "Riwayat Order":
        return renderHistory();
      case "Top Up Saldo":
        return renderTopup();
      case "Mutasi Saldo":
        return renderMutations();
      case "Profil":
        return renderProfile();
      default:
        return renderDashboard();
    }
  }

  return (
    <main className="min-h-screen bg-[#0c0912] text-white">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-30 flex h-screen flex-col border-r border-white/[0.08] bg-[#100c18] shadow-2xl transition-[width] duration-300 ${
            sidebarCollapsed ? "w-16" : "w-64"
          }`}
        >
          <div
            className={`flex h-20 items-center border-b border-white/[0.08] ${
              sidebarCollapsed ? "justify-center px-2" : "gap-3 px-6"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-700 text-xl font-black">
              N
            </div>

            {!sidebarCollapsed && (
              <div>
                <h1 className="text-lg font-extrabold tracking-wide">NOKOS</h1>
                <p className="text-[10px] tracking-[0.2em] text-gray-500">
                  VIRTUAL NUMBER
                </p>
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 pt-6">
            {!sidebarCollapsed && (
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                MENU UTAMA
              </p>
            )}

            <nav className="space-y-1">
              {menus.map((menu) => (
                <button
                  key={menu.name}
                  onClick={() => navigate(menu.name)}
                  title={sidebarCollapsed ? menu.name : undefined}
                  aria-label={menu.name}
                  className={`flex w-full items-center rounded-xl py-3 text-left text-sm transition ${
                    sidebarCollapsed ? "justify-center px-2" : "gap-3 px-3"
                  } ${
                    active === menu.name
                      ? "bg-violet-600/15 font-semibold text-violet-300"
                      : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <span className="w-6 shrink-0 text-center text-lg">
                    {menu.icon}
                  </span>

                  {!sidebarCollapsed && <span>{menu.name}</span>}

                  {active === menu.name && !sidebarCollapsed && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-3">
            {sidebarCollapsed ? (
              <a
                href="https://wa.me/62895340196625"
                target="_blank"
                rel="noopener noreferrer"
                title="Hubungi Support via WhatsApp"
                aria-label="Hubungi Support via WhatsApp"
                className="flex h-12 w-full items-center justify-center rounded-xl border border-violet-400/15 bg-violet-500/[0.07] text-xl text-violet-300 hover:bg-violet-500/15"
              >
                ?
              </a>
            ) : (
              <div className="rounded-2xl border border-violet-400/15 bg-violet-500/[0.07] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className="text-violet-300">✦</span>
                  Bantuan
                </div>

                <p className="mt-2 text-xs leading-5 text-gray-400">
                  Pusat bantuan dan informasi layanan.
                </p>

                <div className="mt-3 flex flex-col gap-2">
                  <a
                    href="https://wa.me/62895340196625"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-violet-300 hover:text-white"
                  >
                    WhatsApp Support →
                  </a>

                  <a
                    href="https://t.me/sokkasikanj"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-violet-300 hover:text-white"
                  >
                    Telegram Support →
                  </a>
                </div>
              </div>
            )}

            {!sidebarCollapsed && (
              <p className="mt-4 text-center text-[10px] text-gray-600">
                NOKOS WEB · FRONTEND
              </p>
            )}
          </div>
        </aside>

        <div
          className={`min-w-0 flex-1 transition-[margin] duration-300 ${
            sidebarCollapsed ? "ml-16" : "ml-64"
          }`}
        >
          <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between gap-4 border-b border-white/[0.08] bg-[#0c0912]/95 px-4 backdrop-blur-xl md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() =>
                  setSidebarCollapsed((previous) => !previous)
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-gray-300 transition hover:bg-white/10 hover:text-white"
                title={
                  sidebarCollapsed
                    ? "Perbesar sidebar"
                    : "Minimalkan sidebar"
                }
                aria-label={
                  sidebarCollapsed
                    ? "Perbesar sidebar"
                    : "Minimalkan sidebar"
                }
              >
                {sidebarCollapsed ? "»" : "«"}
              </button>

              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold">{active}</h2>
                <p className="hidden text-xs text-gray-500 sm:block">
                  Dashboard / {active}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">{profileName}</p>
                <p className="text-xs text-gray-500">
                  Saldo:{" "}
                  {walletLoading ? "Memuat..." : formatRupiah(walletBalance)}
                </p>
              </div>

              <button
                onClick={() => navigate("Profil")}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-violet-500/15 font-bold text-violet-200 hover:bg-violet-500/25"
                aria-label="Buka profil"
                title="Buka profil"
              >
                {profileName.charAt(0).toUpperCase() || "P"}
              </button>

              <a
                href="/auth/signout"
                className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 sm:px-4 sm:text-sm"
              >
                Logout
              </a>
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-6 p-4 md:space-y-7 md:p-8">
            {notice &&
              active !== "Top Up Saldo" &&
              active !== "Profil" &&
              active !== "Beli Nokos" && (
                <div className="flex items-start justify-between gap-3 rounded-xl border border-violet-400/20 bg-violet-500/10 p-4 text-sm leading-6 text-violet-200">
                  <span>{notice}</span>
                  <button
                    onClick={() => setNotice("")}
                    className="shrink-0 text-violet-300"
                    aria-label="Tutup pemberitahuan"
                  >
                    ✕
                  </button>
                </div>
              )}

            {renderContent()}

            <footer className="border-t border-white/[0.08] pt-5 text-center text-xs text-gray-600">
              © 2026 NOKOS WEB. Pembayaran nyata memerlukan backend dan
              verifikasi payment gateway.
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}

function ServiceCard({
  service,
  onChoose,
}: {
  service: Service;
  onChoose: (service: Service) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#151020] p-5 transition hover:-translate-y-0.5 hover:border-violet-400/30">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl font-bold ${service.color}`}
        >
          {service.icon}
        </div>

        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-gray-400">
          {service.category}
        </span>
      </div>

      <h4 className="mt-4 font-bold">{service.name}</h4>
      <p className="mt-1 min-h-10 text-xs leading-5 text-gray-400">
        {service.description}
      </p>

      <div className="mt-4 flex items-end justify-between gap-2">
        <div>
          <p className="text-[10px] text-gray-500">Mulai dari</p>
          <p className="mt-1 font-bold text-violet-300">
            {formatRupiah(service.price)}
          </p>
        </div>

        <button
          onClick={() => onChoose(service)}
          className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold transition hover:bg-violet-500"
        >
          Pilih
        </button>
      </div>
    </div>
  );
}

function TransactionRow({ item }: { item: WalletTransaction }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-semibold">
          {formatRupiah(item.amount)}
          <span className="ml-2 text-xs font-normal text-gray-500">
            {item.method}
          </span>
        </p>
        <p className="mt-1 break-all text-xs text-gray-500">
          {item.id} · {new Date(item.createdAt).toLocaleString("id-ID")}
        </p>
        <div className="mt-2">
          <StatusBadge status={item.status} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TransactionStatus }) {
  const className =
    status === "Berhasil"
      ? "bg-green-500/10 text-green-300"
      : status === "Gagal"
        ? "bg-red-500/10 text-red-300"
        : "bg-amber-500/10 text-amber-300";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs ${className}`}
    >
      {status}
    </span>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-2xl text-gray-500">
        {icon}
      </div>

      <h4 className="mt-4 font-semibold">{title}</h4>
      <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
}
