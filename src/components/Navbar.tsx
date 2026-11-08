"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/jelajah", label: "Penjelajah" },
  { href: "/metodologi", label: "Metodologi" },
  { href: "/docs", label: "Dokumentasi" },
  { href: "/cek", label: "Cek dompet" },
  { href: "/akses", label: "Tim dan akses" },
];

interface SessionUser {
  id: string;
  email: string;
  name: string;
  institution: string;
  role: string;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  const fetchSession = async () => {
    try {
      const localRaw = localStorage.getItem("telusur_session_user");
      if (localRaw) {
        setUser(JSON.parse(localRaw));
      }
    } catch {
      // Abaikan bila penyimpanan lokal tidak tersedia
    }

    try {
      const res = await fetch("/api/auth", { cache: "no-store" });
      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          try {
            localStorage.setItem("telusur_session_user", JSON.stringify(data.user));
          } catch {}
        }
      }
    } catch {
      // Tetap gunakan sesi lokal bila di-hosting secara statis
    }
  };

  useEffect(() => {
    fetchSession();
    const handler = () => fetchSession();
    window.addEventListener("telusur-auth-changed", handler);
    return () => window.removeEventListener("telusur-auth-changed", handler);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("telusur_session_user");
    } catch {}
    setUser(null);
    window.dispatchEvent(new Event("telusur-auth-changed"));
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch {
      // Abaikan bila di-hosting secara statis
    }
    if (pathname === "/app" || pathname?.startsWith("/app")) {
      router.push("/masuk");
    }
  };

  return (
    <header
      className="sembunyikan-saat-cetak"
      style={{
        backgroundColor: "var(--putih)",
        borderBottom: "1px solid var(--rute)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        className="wadah-kanvas"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: "64px",
          gap: "16px",
          flexWrap: "wrap",
          paddingTop: "8px",
          paddingBottom: "8px",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
            color: "var(--tinta)",
            minHeight: "44px",
          }}
          aria-label="TELUSUR - Kembali ke beranda"
        >
          {/* Logo sesuai design.md Bagian 11.3: satu garis terpecah lalu menyatu kembali pada satu titik oranye */}
          <svg
            width="36"
            height="24"
            viewBox="0 0 36 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="4" cy="12" r="2.5" fill="var(--tinta)" />
            <path
              d="M6.5 12 C 12 12, 13 4, 18 4 C 23 4, 24 12, 29.5 12"
              stroke="var(--tinta)"
              strokeWidth="1.6"
              fill="none"
            />
            <path
              d="M6.5 12 L 29.5 12"
              stroke="var(--tinta)"
              strokeWidth="1.6"
              strokeDasharray="2.5 2"
            />
            <path
              d="M6.5 12 C 12 12, 13 20, 18 20 C 23 20, 24 12, 29.5 12"
              stroke="var(--tinta)"
              strokeWidth="1.6"
              fill="none"
            />
            <polygon points="31,8.5 34.5,12 31,15.5 27.5,12" fill="var(--sinyal)" />
          </svg>
          <span
            style={{
              fontFamily: "var(--font-judul)",
              fontWeight: 600,
              fontSize: "20px",
              letterSpacing: "0.01em",
              color: "var(--tinta)",
            }}
          >
            TELUSUR
          </span>
        </Link>

        <nav
          aria-label="Navigasi utama"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexWrap: "wrap",
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  minHeight: "42px",
                  padding: "8px 12px",
                  borderRadius: "var(--r-kontrol)",
                  fontSize: "var(--teks-ui)",
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--tinta)" : "var(--tinta-redup)",
                  backgroundColor: active ? "var(--kertas)" : "transparent",
                  textDecoration: active ? "underline" : "none",
                  textUnderlineOffset: "6px",
                }}
              >
                {item.label}
              </Link>
            );
          })}

          {user ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                marginLeft: "6px",
                paddingLeft: "10px",
                borderLeft: "1px solid var(--garis)",
              }}
            >
              <Link
                href="/app"
                className={pathname === "/app" ? "tombol-utama" : "tombol-sekunder"}
                style={{
                  minHeight: "38px",
                  padding: "6px 12px",
                  fontSize: "13px",
                }}
              >
                Dasbor ({user.role})
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="tombol-sekunder"
                style={{
                  minHeight: "38px",
                  padding: "6px 12px",
                  fontSize: "13px",
                }}
              >
                Keluar
              </button>
            </div>
          ) : (
            <Link
              href="/masuk"
              className={pathname === "/masuk" ? "tombol-utama" : "tombol-sekunder"}
              style={{
                marginLeft: "4px",
                minHeight: "40px",
                padding: "8px 14px",
              }}
            >
              Masuk
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
