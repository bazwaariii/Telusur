"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DemoAccount {
  id: string;
  email: string;
  name: string;
  institution: string;
  role: string;
  requires2fa: boolean;
  demoPassword: string;
}

const DEFAULT_ACCOUNTS: DemoAccount[] = [
  {
    id: "usr-analis-01",
    email: "analis@telusur.id",
    name: "Muhammad Bazwa Arigusna",
    institution: "Arsitek Utama & Analis Forensik On-Chain TELUSUR",
    role: "analis",
    requires2fa: true,
    demoPassword: "telusur2026",
  },
  {
    id: "usr-admin-01",
    email: "admin@telusur.id",
    name: "Muhammad Bazwa Arigusna",
    institution: "Administrasi Keamanan & Infrastruktur TELUSUR",
    role: "admin",
    requires2fa: true,
    demoPassword: "admin2026",
  },
  {
    id: "usr-mitra-01",
    email: "kepatuhan@bursa-mitra.id",
    name: "Divisi Kepatuhan Mitra Bursa",
    institution: "Pedagang Fisik Aset Kripto Terdaftar",
    role: "mitra-api",
    requires2fa: false,
    demoPassword: "mitra2026",
  },
  {
    id: "usr-pembaca-01",
    email: "auditor@pengawas.go.id",
    name: "Tim Pemeriksa Independen",
    institution: "Lembaga Audit dan Pengawasan",
    role: "pembaca",
    requires2fa: false,
    demoPassword: "audit2026",
  },
];

export default function MasukPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<DemoAccount[]>(DEFAULT_ACCOUNTS);
  const [email, setEmail] = useState("analis@telusur.id");
  const [password, setPassword] = useState("telusur2026");
  const [totp, setTotp] = useState("482910");
  const [liveTotpCode, setLiveTotpCode] = useState("482910");
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const computeClientTotp = () => {
    const windowIdx = Math.floor(Date.now() / 30000);
    const num = Math.abs(Math.imul(windowIdx ^ 0x5f3759df, 1664525) + 1013904223) % 900000;
    const code = String(100000 + num);
    const rem = 30 - (Math.floor(Date.now() / 1000) % 30);
    return { code, rem };
  };

  const fetchAuthMeta = async () => {
    const localTotp = computeClientTotp();
    setLiveTotpCode(localTotp.code);
    setSecondsLeft(localTotp.rem);
    try {
      const res = await fetch("/api/auth", { cache: "no-store" });
      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        if (data.totpPreview?.code) {
          setLiveTotpCode(data.totpPreview.code);
          setSecondsLeft(data.totpPreview.secondsRemaining ?? localTotp.rem);
        }
        if (Array.isArray(data.availableAccounts) && data.availableAccounts.length > 0) {
          setAccounts(data.availableAccounts);
        }
      }
    } catch {
      // Tetap berjalan dengan akun dan generator TOTP lokal bila di-hosting secara statis
    }
  };

  useEffect(() => {
    fetchAuthMeta();
    const timer = setInterval(() => {
      fetchAuthMeta();
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectAccount = (acc: DemoAccount) => {
    setEmail(acc.email);
    setPassword(acc.demoPassword);
    setTotp(acc.requires2fa ? liveTotpCode : "");
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const matchedAccount = accounts.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase()
    );

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email,
          password,
          totp: totp || liveTotpCode,
        }),
      });

      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        if (!data.ok) {
          setErrorMsg(data.error ?? "Gagal masuk. Periksa kembali kredensial Anda.");
          setIsLoading(false);
          return;
        }
        try {
          localStorage.setItem("telusur_session_user", JSON.stringify(data.user));
        } catch {}
        window.dispatchEvent(new Event("telusur-auth-changed"));
        router.push("/app");
        return;
      }
    } catch {
      // Lanjutkan ke verifikasi lokal bila di-hosting secara statis (Netlify Drop)
    }

    // Fallback autentikasi sisi klien untuk penayangan statis (Netlify Drop)
    if (!matchedAccount || matchedAccount.demoPassword !== password) {
      setErrorMsg("Email atau kata sandi tidak sesuai dengan akun terdaftar.");
      setIsLoading(false);
      return;
    }

    const sessionUser = {
      id: matchedAccount.id,
      email: matchedAccount.email,
      name: matchedAccount.name,
      institution: matchedAccount.institution,
      role: matchedAccount.role,
    };

    try {
      localStorage.setItem("telusur_session_user", JSON.stringify(sessionUser));
    } catch {}
    window.dispatchEvent(new Event("telusur-auth-changed"));
    router.push("/app");
  };

  const selectedAccount = accounts.find(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase()
  );

  return (
    <div
      className="wadah-konten"
      style={{
        paddingTop: "48px",
        paddingBottom: "88px",
      }}
    >
      <div style={{ maxWidth: "68ch", marginBottom: "36px" }}>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.65rem)", marginBottom: "12px" }}>
          Masuk ke meja kerja analis dan pengelola sistem.
        </h1>
        <p className="teks-naratif teks-sekunder" style={{ marginBottom: 0 }}>
          Setiap tindakan peninjauan alert, pembaruan ambang, dan ekspor lembar kasus memerlukan sesi terautentikasi agar tercatat pada log audit append-only sesuai peran.
        </p>
      </div>

      <div className="layout-2-kolom">
        {/* Kolom Kiri: Daftar Akun Terdaftar */}
        <div>
          <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>
            Pilih akun uji berdasarkan peran
          </h2>
          <p className="teks-kecil" style={{ marginBottom: "14px" }}>
            Klik tombol <strong>Isi kredensial</strong> pada salah satu baris di bawah untuk menguji hak akses peran tersebut di dasbor.
          </p>

          <div style={{ overflowX: "auto", marginBottom: "20px" }}>
            <table className="tabel-data" aria-label="Daftar akun uji TELUSUR">
              <thead>
                <tr>
                  <th scope="col">Pengguna dan email</th>
                  <th scope="col">Peran</th>
                  <th scope="col">2FA</th>
                  <th scope="col">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc) => {
                  const isCurrent = acc.email.toLowerCase() === email.toLowerCase();
                  return (
                    <tr
                      key={acc.id}
                      style={{
                        backgroundColor: isCurrent ? "var(--kertas)" : "var(--putih)",
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: 700, fontSize: "14px" }}>
                          {acc.name}
                        </div>
                        <div className="font-mono teks-kecil">{acc.email}</div>
                        <div className="teks-kecil">
                          Sandi: <code className="font-mono">{acc.demoPassword}</code>
                        </div>
                      </td>
                      <td>
                        <code
                          className="font-mono"
                          style={{
                            padding: "2px 8px",
                            backgroundColor: "var(--kertas)",
                            border: "1px solid var(--rute)",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {acc.role}
                        </code>
                      </td>
                      <td className="teks-kecil">
                        {acc.requires2fa ? "Wajib TOTP" : "Opsional"}
                      </td>
                      <td>
                        <button
                          type="button"
                          className={isCurrent ? "tombol-utama" : "tombol-sekunder"}
                          onClick={() => handleSelectAccount(acc)}
                          style={{
                            minHeight: "34px",
                            padding: "4px 10px",
                            fontSize: "12px",
                          }}
                        >
                          {isCurrent ? "Terpilih" : "Isi kredensial"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Generator TOTP 2FA Langsung */}
          <div className="panel-kerja" style={{ padding: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px" }}>
                  Generator TOTP 2FA (Sinkronisasi Server)
                </div>
                <div className="teks-kecil">
                  Berlaku untuk peran <code className="font-mono">analis</code> dan{" "}
                  <code className="font-mono">admin</code> (berputar tiap {secondsLeft} detik):
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <code
                  className="font-mono"
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    padding: "6px 12px",
                    backgroundColor: "var(--kertas)",
                    border: "1px solid var(--tinta)",
                    borderRadius: "6px",
                    letterSpacing: "0.08em",
                  }}
                >
                  {liveTotpCode}
                </code>
                <button
                  type="button"
                  className="tombol-sekunder"
                  onClick={() => setTotp(liveTotpCode)}
                  style={{ minHeight: "36px", padding: "6px 12px", fontSize: "12px" }}
                >
                  Pakai kode
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Formulir Masuk */}
        <form onSubmit={handleSubmit} className="panel-kerja" style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>
            Autentikasi sesi kerja
          </h2>

          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="masuk-email"
              style={{
                display: "block",
                fontWeight: 600,
                fontSize: "var(--teks-kecil)",
                marginBottom: "6px",
              }}
            >
              Email institusi
            </label>
            <input
              id="masuk-email"
              type="email"
              required
              className="input-teks"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="masuk-sandi"
              style={{
                display: "block",
                fontWeight: 600,
                fontSize: "var(--teks-kecil)",
                marginBottom: "6px",
              }}
            >
              Kata sandi
            </label>
            <input
              id="masuk-sandi"
              type="password"
              required
              className="input-teks font-mono"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="masuk-totp"
              style={{
                display: "block",
                fontWeight: 600,
                fontSize: "var(--teks-kecil)",
                marginBottom: "6px",
              }}
            >
              Kode autentikator TOTP 2FA (6 digit)
            </label>
            <input
              id="masuk-totp"
              type="text"
              className="input-teks font-mono"
              placeholder={
                selectedAccount?.requires2fa
                  ? `Masukkan ${liveTotpCode}`
                  : "Tidak diwajibkan untuk peran ini"
              }
              value={totp}
              onChange={(e) => setTotp(e.target.value)}
            />
          </div>

          {errorMsg && (
            <div
              role="alert"
              style={{
                marginBottom: "16px",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid var(--bahaya)",
                backgroundColor: "rgba(194, 59, 46, 0.06)",
                color: "var(--bahaya)",
                fontSize: "var(--teks-kecil)",
                fontWeight: 600,
              }}
            >
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="tombol-utama"
            style={{ width: "100%" }}
          >
            {isLoading ? "Memverifikasi sesi..." : "Masuk ke dasbor"}
          </button>

          <p className="teks-kecil" style={{ marginTop: "16px", marginBottom: 0 }}>
            Butuh akun untuk organisasi baru?{" "}
            <Link href="/akses">Ajukan permintaan akses awal</Link>.
          </p>
        </form>
      </div>
    </div>
  );
}
