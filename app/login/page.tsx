
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050b18] px-5 text-white">
      <section className="w-full max-w-md rounded-2xl border border-blue-500/20 bg-[#0b1428] p-8 shadow-2xl shadow-blue-950/40">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-black shadow-lg shadow-blue-600/30">
            N
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Nokos Web
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Masuk untuk melanjutkan ke dashboard.
          </p>
        </div>

        <Link
          href="/auth/login"
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-slate-900 transition hover:bg-slate-200"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 48 48"
            className="h-5 w-5"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
              transform="translate(0 5)"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.66 5.94c4.47-4.13 7.11-10.2 7.11-17.59Z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.88.93 7.55 2.56 10.78l7.97-6.19Z"
              transform="translate(0 0)"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.9-5.86l-7.66-5.94c-2.13 1.43-4.85 2.28-8.24 2.28-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
            />
          </svg>
          Masuk dengan Google
        </Link>

        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          Dengan masuk, kamu menyetujui ketentuan penggunaan
          layanan Nokos Web.
        </p>
      </section>
    </main>
  );
}
