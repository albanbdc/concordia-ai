// app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Concordia",
  description: "Concordia — registre de conformité vivant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Top bar (simple + SaaS) */}
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-slate-900" />
              <div className="leading-tight">
                <div className="text-sm font-black text-slate-900">Concordia</div>
                <div className="text-[11px] font-semibold text-slate-500">
                  registre de conformité vivant
                </div>
              </div>
            </Link>

            <nav className="flex items-center gap-2 flex-wrap">
              <Link
                href="/dashboard/audit"
                className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-slate-800"
              >
                + Nouvel audit
              </Link>

              <Link
                href="/dashboard/audits"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
              >
                Historique des audits
              </Link>

              {/* ✅ Bouton demandé */}
              <Link
                href="/dashboard/suivi"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
              >
                Suivi de conformité
              </Link>
            </nav>
          </div>
        </header>

        <main className="min-h-[calc(100vh-56px)]">{children}</main>
      </body>
    </html>
  );
}
