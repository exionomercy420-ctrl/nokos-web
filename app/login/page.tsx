"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [mode, setMode] = useState<"register" | "login">("register");
  const isRegister = mode === "register";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] px-4 py-10 text-zinc-100 selection:bg-violet-500/30 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-22rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-violet-600/[0.13] blur-[100px]" />
        <div className="absolute bottom-[-24rem] right-[-10rem] h-[35rem] w-[35rem] rounded-full bg-indigo-500/[0.09] blur-[110px]" />
      </div>

      <div className="relative w-full max-w-[410px]">
        <header className="mb-10 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-black tracking-tight text-zinc-950 shadow-xl shadow-black/20">
            N.
          </div>
          <p className="mt-4 text-sm font-semibold tracking-[0.22em] text-white">NOKOS WEB</p>
          <p className="mt-2 text-sm text-zinc-500">Semua layanan, satu akun.</p>
        </header>

        <section className="rounded-3xl border border-white/[0.09] bg-zinc-900/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          <div className="mb-7">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-violet-300">{isRegister ? "Mulai sekarang" : "Senang melihatmu lagi"}</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">{isRegister ? "Buat akun baru" : "Masuk ke akunmu"}</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{isRegister ? "Daftar untuk mulai mengelola layanan nokos." : "Lanjutkan ke dashboard NOKOS WEB."}</p>
          </div>

          <div className="mb-5 grid grid-cols-2 rounded-xl border border-white/[0.08] bg-black/20 p-1">
            <button type="button" onClick={() => setMode("register")} className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${isRegister ? "bg-zinc-100 text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-white"}`}>
              Daftar
            </button>
            <button type="button" onClick={() => setMode("login")} className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${!isRegister ? "bg-zinc-100 text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-white"}`}>
              Login
            </button>
          </div>

          <Link href="/auth/login" className="group flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-zinc-900">
            <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 5)" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.66 5.94c4.47-4.13 7.11-10.2 7.11-17.59Z" />
              <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.88.93 7.55 2.56 10.78l7.97-6.19Z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.86l-7.66-5.94c-2.13 1.43-4.85 2.28-8.24 2.28-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
            </svg>
            {isRegister ? "Daftar dengan Google" : "Masuk dengan Google"}
            <span className="ml-auto text-zinc-400 transition group-hover:translate-x-0.5">↗</span>
          </Link>

          <p className="mt-4 text-center text-xs leading-5 text-zinc-500">
            {isRegister ? "Jika belum punya akun, akun akan dibuat saat pertama kali masuk dengan Google." : "Gunakan akun Google yang sama dengan saat mendaftar."}
          </p>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/[0.08]" />
            <span className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">Akses aman</span>
            <span className="h-px flex-1 bg-white/[0.08]" />
          </div>
          <p className="text-center text-xs text-zinc-500">Autentikasi ditangani oleh Google.</p>
        </section>

        <footer className="mt-6 text-center text-xs text-zinc-600">
          © 2026 NOKOS WEB
          <span className="mx-2 text-zinc-700">·</span>
          <Link href="/login" className="transition hover:text-zinc-400">Beranda</Link>
        </footer>
      </div>
    </main>
  );
}
