
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
  { name: "WhatsApp", icon: "WA", category: "Komunikasi", price: 8000, description: "Nomor virtual untuk verifikasi WhatsApp", color: "bg-green-500/15 text-green-400" },
  { name: "Telegram", icon: "➤", category: "Komunikasi", price: 7000, description: "Nomor virtual untuk verifikasi Telegram", color: "bg-sky-500/15 text-sky-400" },
  { name: "Facebook", icon: "f", category: "Sosial Media", price: 8000, description: "Nomor virtual untuk verifikasi Facebook", color: "bg-blue-500/15 text-blue-400" },
  { name: "TikTok", icon: "♪", category: "Sosial Media", price: 10000, description: "Nomor virtual untuk verifikasi TikTok", color: "bg-white/10 text-white" },
  { name: "DANA", icon: "D", category: "Keuangan", price: 10000, description: "Nomor virtual untuk verifikasi DANA", color: "bg-sky-500/15 text-sky-400" },
  { name: "Instagram", icon: "◎", category: "Sosial Media", price: 9000, description: "Nomor virtual untuk verifikasi Instagram", color: "bg-pink-500/15 text-pink-400" },
  { name: "Grab", icon: "G", category: "Transportasi", price: 9000, description: "Nomor virtual untuk verifikasi Grab", color: "bg-green-500/15 text-green-400" },
  { name: "GoPay", icon: "G", category: "Keuangan", price: 10000, description: "Nomor virtual untuk verifikasi GoPay", color: "bg-cyan-500/15 text-cyan-400" },
  { name: "Twitter/X", icon: "𝕏", category: "Sosial Media", price: 9000, description: "Nomor virtual untuk verifikasi Twitter/X", color: "bg-white/10 text-white" },
  { name: "Google", icon: "G", category: "Email", price: 12000, description: "Nomor virtual untuk verifikasi Google", color: "bg-yellow-500/15 text-yellow-400" },
  { name: "Binance", icon: "◆", category: "Keuangan", price: 15000, description: "Nomor virtual untuk verifikasi Binance", color: "bg-yellow-500/15 text-yellow-400" },
  { name: "MiChat", icon: "M", category: "Komunikasi", price: 8000, description: "Nomor virtual untuk verifikasi MiChat", color: "bg-green-500/15 text-green-400" },
  { name: "myXL", icon: "X", category: "Telekomunikasi", price: 8000, description: "Nomor virtual untuk verifikasi myXL", color: "bg-violet-500/15 text-violet-400" },
  { name: "myIM3", icon: "3", category: "Telekomunikasi", price: 8000, description: "Nomor virtual untuk verifikasi myIM3", color: "bg-yellow-500/15 text-yellow-400" },
  { name: "Tokopedia", icon: "T", category: "Belanja", price: 9000, description: "Nomor virtual untuk verifikasi Tokopedia", color: "bg-green-500/15 text-green-400" },
  { name: "Shopee", icon: "S", category: "Belanja", price: 9000, description: "Nomor virtual untuk verifikasi Shopee", color: "bg-orange-500/15 text-orange-400" },
  { name: "Indomaret", icon: "I", category: "Belanja", price: 8000, description: "Nomor virtual untuk verifikasi Indomaret", color: "bg-red-500/15 text-red-400" },
  { name: "Alfamidi", icon: "A", category: "Belanja", price: 8000, description: "Nomor virtual untuk verifikasi Alfamidi", color: "bg-red-500/15 text-red-400" },
  { name: "Alfagift", icon: "A", category: "Belanja", price: 8000, description: "Nomor virtual untuk verifikasi Alfagift", color: "bg-red-500/15 text-red-400" },
  { name: "Discord", icon: "D", category: "Komunikasi", price: 9000, description: "Nomor virtual untuk verifikasi Discord", color: "bg-indigo-500/15 text-indigo-400" },
  { name: "LINE", icon: "L", category: "Komunikasi", price: 9000, description: "Nomor virtual untuk verifikasi LINE", color: "bg-green-500/15 text-green-400" },
  { name: "Microsoft", icon: "M", category: "Email", price: 12000, description: "Nomor virtual untuk verifikasi Microsoft", color: "bg-sky-500/15 text-sky-400" },
  { name: "Lazada", icon: "L", category: "Belanja", price: 9000, description: "Nomor virtual untuk verifikasi Lazada", color: "bg-violet-500/15 text-violet-400" },
  { name: "PayPal", icon: "P", category: "Keuangan", price: 15000, description: "Nomor virtual untuk verifikasi PayPal", color: "bg-blue-500/15 text-blue-400" },
];

const categories = ["Semua", "Komunikasi", "Sosial Media", "Email", "Keuangan", "Transportasi", "Telekomunikasi", "Belanja"];

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

              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 sm:px-4 sm:text-sm"
                >
                  Logout
                </button>
              </form>
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

function ServiceBrandIcon({ service }: { service: Service }) {
  const frame = "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 shadow-lg";
  switch (service.name) {
    case "WhatsApp":
      return (
        <div className={`${frame} bg-[#25D366]/10 shadow-green-950/20`}>
          <svg aria-label="WhatsApp" role="img" viewBox="0 0 48 48" className="h-9 w-9">
            <path fill="#25D366" d="M24 4C13.1 4 4.2 12.7 4.2 23.5c0 3.5.9 6.8 2.6 9.7L4 44l11.1-2.9a20.2 20.2 0 0 0 8.9 2.1c10.9 0 19.8-8.8 19.8-19.6S34.9 4 24 4Z"/>
            <path fill="#fff" d="M33.8 28.8c-.5-.3-3.1-1.5-3.6-1.7-.5-.2-.8-.3-1.1.3-.3.5-1.3 1.7-1.6 2-.3.3-.6.4-1.1.1-.5-.3-2.2-.8-4.2-2.6-1.5-1.3-2.5-2.9-2.8-3.4-.3-.5 0-.8.2-1 .2-.2.5-.6.8-.9.3-.3.3-.5.5-.8.2-.3.1-.6 0-.9-.1-.3-1.1-2.8-1.5-3.8-.4-1-.8-.9-1.1-.9h-.9c-.3 0-.8.1-1.3.6-.5.5-1.7 1.6-1.7 4s1.8 4.6 2.1 4.9c.3.3 3.5 5.3 8.5 7.4 1.2.5 2.1.8 2.8 1 1.2.4 2.3.3 3.1.2 1-.2 3.1-1.3 3.5-2.4.4-1.2.4-2.1.3-2.4-.2-.3-.5-.4-1-.7Z"/>
          </svg>
        </div>
      );
    case "Telegram":
      return (
        <div className={`${frame} bg-sky-400/10 shadow-sky-950/20`}>
          <svg aria-label="Telegram" role="img" viewBox="0 0 48 48" className="h-9 w-9">
            <circle cx="24" cy="24" r="20" fill="#229ED9"/>
            <path fill="#fff" d="m11.3 23.1 23.1-8.9c1.1-.4 2.1.3 1.7 2l-3.9 18.3c-.3 1.3-1.1 1.6-2.2.9l-6.1-4.5-2.9 2.8c-.3.3-.6.6-1.2.6l.4-6.2 11.3-10.2c.5-.4-.1-.7-.7-.3L17 26l-5.9-1.8c-1.3-.4-1.3-1.3.2-1.9Z"/>
          </svg>
        </div>
      );
    case "Instagram":
      return (
        <div className={`${frame} bg-gradient-to-br from-fuchsia-500/20 via-pink-500/10 to-orange-400/20`}>
          <svg aria-label="Instagram" role="img" viewBox="0 0 48 48" className="h-9 w-9">
            <defs><linearGradient id="ig-gradient" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#FFB800"/><stop offset=".48" stopColor="#F62976"/><stop offset="1" stopColor="#8B5CF6"/></linearGradient></defs>
            <rect x="5" y="5" width="38" height="38" rx="11" fill="none" stroke="url(#ig-gradient)" strokeWidth="4"/>
            <circle cx="24" cy="24" r="9" fill="none" stroke="url(#ig-gradient)" strokeWidth="4"/>
            <circle cx="35" cy="13" r="2.6" fill="#F62976"/>
          </svg>
        </div>
      );
    case "Google":
      return (
        <div className={`${frame} bg-white shadow-black/20`}>
          <svg aria-label="Google" role="img" viewBox="0 0 48 48" className="h-9 w-9">
            <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2l6.6 5.1c3.9-3.6 6.1-8.9 6.1-15Z"/>
            <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4l-6.8 5.2A20.4 20.4 0 0 0 24 44Z"/>
            <path fill="#FBBC05" d="M12.6 27.6a12.2 12.2 0 0 1 0-7.2l-6.8-5.2a20.1 20.1 0 0 0 0 17.6l6.8-5.2Z"/>
            <path fill="#EA4335" d="M24 12.1c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6.1 29.5 4 24 4A20.4 20.4 0 0 0 5.8 15.2l6.8 5.2c1.6-4.8 6.1-8.3 11.4-8.3Z"/>
          </svg>
        </div>
      );
    case "Facebook":
      return (
        <div className={`${frame} bg-[#1877F2]/10 shadow-blue-950/20`}>
          <svg aria-label="Facebook" role="img" viewBox="0 0 48 48" className="h-9 w-9">
            <path fill="#1877F2" d="M24 4a20 20 0 1 0 0 40 20 20 0 0 0 0-40Z"/>
            <path fill="#fff" d="M27.2 40V26.3h4.6l.7-5.3h-5.3v-3.4c0-1.5.4-2.5 2.6-2.5h2.8v-4.7c-.5-.1-2.2-.2-4.2-.2-4.2 0-7 2.5-7 7.2V21h-4.7v5.3h4.7V40h5.8Z"/>
          </svg>
        </div>
      );
    case "TikTok":
      return (
        <div className={`${frame} bg-white/[0.06] shadow-black/20`}>
          <svg aria-label="TikTok" role="img" viewBox="0 0 48 48" className="h-9 w-9">
            <path fill="#25F4EE" d="M28 5h7c.3 4.1 2.5 7.1 7 8v7c-3.1-.1-6.1-1.1-8.7-2.8v12.2c0 7.2-5.8 12.1-12.8 12.1-6.1 0-10.5-4.4-10.5-10.1 0-7 6.4-12 14-10.8v7.2c-3.8-1.2-7.1.8-7.1 3.8 0 2.2 1.7 3.4 3.7 3.4 2.5 0 4.4-1.8 4.4-5.4V5Z"/>
            <path fill="#FE2C55" d="M25 8h6.5c.3 4.1 2.5 7.1 7 8v6.2c-2.8-.5-5.2-1.5-7.2-2.9v11.3c0 7.2-5.8 12.1-12.8 12.1-2.5 0-4.7-.8-6.4-2.1 1.7 1.1 3.8 1.7 6 1.7 7 0 12.8-4.9 12.8-12.1V20c2.6 1.7 5.6 2.7 8.7 2.8v-6.2c-4.5-.9-6.7-3.9-7-8H25Z" opacity=".85"/>
          </svg>
        </div>
      );
    case "DANA":
      return <div className={`${frame} bg-[#168BFF] text-white shadow-blue-950/20`}><span className="rounded-full bg-white px-2 py-1 text-lg font-black italic text-[#168BFF]">D</span></div>;
    case "Grab":
      return <div className={`${frame} bg-[#00B14F] text-white shadow-green-950/20`}><span className="text-xl font-black tracking-tight">Grab</span></div>;
    case "GoPay":
      return <div className={`${frame} bg-[#00AED6] text-white shadow-cyan-950/20`}><span className="text-sm font-black">gopay</span></div>;
    case "Twitter/X":
      return <div className={`${frame} bg-black text-white shadow-black/20`}><span className="text-3xl font-medium">𝕏</span></div>;
    case "Binance":
      return <div className={`${frame} bg-[#F3BA2F] text-[#3B2A00] shadow-yellow-950/20`}><span className="text-3xl font-black">◆</span></div>;
    case "MiChat":
      return <div className={`${frame} bg-[#24C94B] text-white shadow-green-950/20`}><span className="text-2xl font-black">M</span></div>;
    case "myXL":
      return <div className={`${frame} bg-[#7B16F5] text-white shadow-violet-950/20`}><span className="text-2xl font-black">XL</span></div>;
    case "myIM3":
      return <div className={`${frame} bg-[#F9D423] text-[#171717] shadow-yellow-950/20`}><span className="text-xl font-black">IM3</span></div>;
    case "Tokopedia":
      return <div className={`${frame} bg-[#03AC0E] text-white shadow-green-950/20`}><span className="text-2xl font-black">T</span></div>;
    case "Shopee":
      return <div className={`${frame} bg-[#EE4D2D] text-white shadow-orange-950/20`}><span className="text-2xl font-black">S</span></div>;
    case "Indomaret":
      return <div className={`${frame} bg-white text-[#0054A6] shadow-black/20`}><span className="text-xs font-black">Indomaret</span></div>;
    case "Alfamidi":
      return <div className={`${frame} bg-[#E60023] text-white shadow-red-950/20`}><span className="text-xl font-black">A</span></div>;
    case "Alfagift":
      return <div className={`${frame} bg-[#E60023] text-white shadow-red-950/20`}><span className="text-xl font-black">A+</span></div>;
    case "Discord":
      return <div className={`${frame} bg-[#5865F2] text-white shadow-indigo-950/20`}><span className="text-2xl font-black">◕</span></div>;
    case "LINE":
      return <div className={`${frame} bg-[#06C755] text-white shadow-green-950/20`}><span className="text-xl font-black">LINE</span></div>;
    case "Microsoft":
      return <div className={`${frame} bg-white text-slate-800 shadow-black/20`}><span className="grid grid-cols-2 gap-0.5"><i className="h-3 w-3 bg-[#F25022]"/><i className="h-3 w-3 bg-[#7FBA00]"/><i className="h-3 w-3 bg-[#00A4EF]"/><i className="h-3 w-3 bg-[#FFB900]"/></span></div>;
    case "Lazada":
      return <div className={`${frame} bg-[#7E2BCE] text-white shadow-violet-950/20`}><span className="text-2xl font-black">L</span></div>;
    case "PayPal":
      return <div className={`${frame} bg-white text-[#003087] shadow-black/20`}><span className="text-2xl font-black italic">P</span></div>;
    default:
      return <div className={`${frame} ${service.color} text-2xl font-bold`}>{service.icon}</div>;
  }
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
        <ServiceBrandIcon service={service} />

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
