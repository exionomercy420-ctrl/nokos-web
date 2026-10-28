"use client";

import Link from "next/link";
import { useState } from "react";

const highlights = [
  { icon: "✦", title: "Cepat & praktis", description: "Pilih layanan dan kelola pesanan dari satu dashboard." },
  { icon: "◈", title: "Saldo terpantau", description: "Lihat saldo serta riwayat transaksi dalam satu tempat." },
  { icon: "⌁", title: "Banyak layanan", description: "WhatsApp, Telegram, Instagram, dan layanan lainnya." },
];

export default function LoginPage() {
  const [mode, setMode] = useState<"register" | "login">("register");
  const isRegister = mode === "register";

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#070611] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-[-8rem] h-[28rem] w-[28rem] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute -right-20 bottom-[-10rem] h-[32rem] w-[32rem] rounded-full bg-blue-500/20 blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      </div>

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/login" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-300/20 bg-gradient-to-br from-violet-500 to-blue-600 text-xl font-black shadow-lg shadow-violet-950/50">N</div>
          <div>
            <p className="font-extrabold tracking-[0.16em]">NOKOS WEB</p>
            <p className="text-[10px] tracking-[0.22em] text-slate-500">VIRTUAL NUMBER PLATFORM</p>
          </div>
        </Link>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-400">Akses akun</span>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-100px)] w-full max-w-7xl items-center gap-12 px-5 pb-12 pt-6 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:gap-20 lg:pb-20">
        <section className="mx-auto w-full max-w-2xl lg:mx-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/[0.08] px-3 py-1.5 text-xs font-medium text-violet-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />
            Satu dashboard untuk kebutuhan nokos
          </div>
          <h1 className="mt-6 max-w-xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Verifikasi lebih mudah.
            <span className="mt-2 block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent">Semua dalam satu tempat.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-400 sm:text-lg">
            Masuk ke akun NOKOS WEB untuk mengelola layanan nomor virtual, memantau pesanan, dan melihat saldo dengan praktis.
          </p>

          <div className="mt-9 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/[0.09] bg-white/[0.035] p-4 backdrop-blur-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-400/10 text-lg text-violet-200">{item.icon}</span>
                <h2 className="mt-3 text-sm font-bold">{item.title}</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-xs text-slate-600">Akses akun aman melalui autentikasi Google.</p>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="rounded-[2rem] border border-white/[0.12] bg-[#100d1d]/90 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-9">
            <div className="mb-7">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 text-2xl font-black shadow-lg shadow-violet-950/50">N</div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">{isRegister ? "Mulai sekarang" : "Selamat datang kembali"}</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">{isRegister ? "Buat akun NOKOS" : "Masuk ke akunmu"}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{isRegister ? "Daftar untuk mulai mengelola layanan nomor virtual." : "Gunakan akun Google yang sama dengan saat mendaftar."}</p>
            </div>

            <div className="mb-5 grid grid-cols-2 rounded-xl border border-white/10 bg-black/20 p-1">
              <button type="button" onClick={() => setMode("register")} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${isRegister ? "bg-violet-600 text-white shadow-lg shadow-violet-950/30" : "text-slate-400 hover:text-white"}`}>
                Daftar
              </button>
              <button type="button" onClick={() => setMode("login")} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${!isRegister ? "bg-violet-600 text-white shadow-lg shadow-violet-950/30" : "text-slate-400 hover:text-white"}`}>
                Login
              </button>
            </div>

            <Link
              href="/auth/login"
              className="group flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3.5 font-semibold text-slate-900 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-[#100d1d]"
            >
              <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 5)" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.66 5.94c4.47-4.13 7.11-10.2 7.11-17.59Z" />
                <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.88.93 7.55 2.56 10.78l7.97-6.19Z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.86l-7.66-5.94c-2.13 1.43-4.85 2.28-8.24 2.28-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
              </svg>
              {isRegister ? "Daftar dengan Google" : "Masuk dengan Google"}
              <span className="ml-auto text-slate-400 transition group-hover:translate-x-1">→</span>
            </Link>

            <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-slate-600">
              <span className="h-px flex-1 bg-white/10" />
              Login aman
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <p className="text-center text-xs leading-5 text-slate-500">{isRegister ? "Akun baru akan dibuat otomatis jika email Google belum terdaftar." : "Gunakan akun Google yang sebelumnya dipakai mendaftar."} Kata sandi Google tidak disimpan oleh NOKOS WEB.</p>
          </div>
          <p className="mt-5 text-center text-xs text-slate-600">© 2026 NOKOS WEB · Virtual Number Platform</p>
        </section>
      </div>
    </main>
  );
}
