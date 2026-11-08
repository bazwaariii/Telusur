import React from "react";
import Link from "next/link";
import { META_DATA } from "@/lib/demo-data";

export function Footer() {
  return (
    <footer
      className="sembunyikan-saat-cetak"
      style={{
        marginTop: "auto",
        backgroundColor: "var(--putih)",
        borderTop: "1px solid var(--rute)",
        paddingTop: "48px",
        paddingBottom: "48px",
      }}
    >
      <div className="wadah-konten">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "32px",
            paddingBottom: "32px",
            borderBottom: "1px solid var(--garis)",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-judul)",
                fontWeight: 600,
                fontSize: "18px",
                marginBottom: "8px",
                color: "var(--tinta)",
              }}
            >
              TELUSUR
            </div>
            <p className="teks-kecil" style={{ maxWidth: "46ch", marginBottom: "12px" }}>
              Sistem forensik on-chain untuk menelusuri pemecahan dana kripto ke titik pencairan, menyajikan alasan tiap penandaan, dan menyerahkan keputusan penahanan kepada manusia.
            </p>
            <p className="teks-kecil" style={{ marginBottom: 0 }}>
              Versi model:{" "}
              <code className="font-mono" style={{ color: "var(--tinta)" }}>
                {META_DATA.model_version}
              </code>
            </p>
          </div>

          <div>
            <div
              style={{
                fontWeight: 600,
                fontSize: "var(--teks-ui)",
                marginBottom: "12px",
                color: "var(--tinta)",
              }}
            >
              Permukaan sistem
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <li>
                <Link href="/jelajah">Penjelajah graf dan pemantau langsung</Link>
              </li>
              <li>
                <Link href="/metodologi">Metodologi dan register klaim</Link>
              </li>
              <li>
                <Link href="/akses">Pengembang dan integrasi organisasi</Link>
              </li>
              <li>
                <Link href="/app">Dasbor tinjauan analis dan kepatuhan</Link>
              </li>
              <li>
                <Link href="/docs">Dokumentasi kontrak REST API</Link>
              </li>
              <li>
                <Link href="/cek">Inspeksi risiko dompet multi-chain</Link>
              </li>
            </ul>
          </div>

          <div>
            <div
              style={{
                fontWeight: 600,
                fontSize: "var(--teks-ui)",
                marginBottom: "12px",
                color: "var(--tinta)",
              }}
            >
              Batas klaim dan kepatuhan
            </div>
            <p className="teks-kecil" style={{ marginBottom: "8px" }}>
              Ditandai untuk ditinjau. Skor risiko bukan bukti bersalah. Tidak ada tindakan pembekuan otomatis di seluruh alur sistem.
            </p>
            <p className="teks-kecil" style={{ marginBottom: 0 }}>
              Protokol benchmark dasar: {META_DATA.protocol} Pemindaian struktur graf 2-lompatan aktif untuk Bitcoin, TRON (USDT TRC-20), dan Ethereum (EVM).
            </p>
          </div>
        </div>

        <div
          style={{
            paddingTop: "24px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <p className="teks-kecil" style={{ marginBottom: 0 }}>
            Dikembangkan oleh <strong>Muhammad Bazwa Arigusna</strong> | Arsitek dan Pengembang Utama Sistem Forensik On-Chain TELUSUR.
          </p>
          <p className="teks-kecil" style={{ marginBottom: 0 }}>
            Berjalan mandiri dengan mesin analitik lokal maupun koneksi API jaringan blockchain langsung.
          </p>
        </div>
      </div>
    </footer>
  );
}
