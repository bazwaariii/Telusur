import React from "react";
import { EarlyAccessForm } from "@/components/EarlyAccessForm";

export const metadata = {
  title: "Pengembang dan Integrasi Organisasi | TELUSUR",
  description:
    "Profil pengembang utama Muhammad Bazwa Arigusna, protokol validasi alur kerja analis, dan pendaftaran integrasi organisasi.",
};

const CAKUPAN_KEPEMILIKAN = [
  {
    bidang: "Pemodelan Machine Learning, Fitur Graf 2-Lompatan, dan Kalibrasi ACI",
    uraian:
      "Perancangan ekstraksi fitur topologi graf dua lompatan (derajat pemecahan, waktu singgah antarblok, dan nisbah konvergensi pencairan), pelatihan model LightGBM berpresisi tinggi, kalibrasi berurutan Adaptive Conformal Inference (ACI) berbatas atas, pemantau pergeseran distribusi PSI/KS, serta atribusi alasan SHAP per transaksi.",
  },
  {
    bidang: "Arsitektur Aplikasi Web, Mesin Streaming Multi-Chain, dan Keamanan API",
    uraian:
      "Implementasi ruang kerja kanvas graf forensik interaktif, pemantau aliran transaksi waktu nyata lintas jaringan (Bitcoin, TRON USDT TRC-20, dan Ethereum EVM), autentikasi sesi berbasis peran dengan verifikasi TOTP 2FA, tanda tangan webhook HMAC-SHA256, serta log audit append-only.",
  },
  {
    bidang: "Sistem Desain Meja Kasus, Lembar Bukti Siap Audit, dan Kepatuhan",
    uraian:
      "Penyusunan antarmuka meja kerja bebas klaim berlebihan, ekspor lembar kasus cetak satu halaman siap lampiran pemeriksaan, tata kelola register klaim yang dapat diaudit, serta kepatuhan pelindungan data pribadi (UU PDP) dan prinsip keputusan di tangan manusia.",
  },
];

const PERTANYAAN_VALIDASI = [
  "Bagaimana organisasi Anda saat ini menelusuri satu kasus dana kripto mencurigakan, berapa lama waktunya, dan menggunakan perangkat apa?",
  "Informasi apa yang membuat analis Anda percaya atau meragukan skor risiko dari sistem penyaringan otomatis?",
  "Komponen apa yang wajib tercantum pada lembar kasus satu halaman agar sah digunakan sebagai lampiran laporan pemeriksaan atau kepatuhan?",
  "Berapa batas maksimum alarm palsu harian yang masih dapat ditangani tim operasional Anda tanpa menghambat penarikan nasabah yang sah?",
  "Bagaimana alur integrasi webhook atau REST API yang paling sesuai dengan arsitektur antrean tinjauan di perusahaan Anda?",
];

export default function AksesDanTimPage() {
  return (
    <div
      className="wadah-konten"
      style={{
        paddingTop: "48px",
        paddingBottom: "88px",
      }}
    >
      <div style={{ maxWidth: "68ch", marginBottom: "48px" }}>
        <h1 style={{ marginBottom: "16px" }}>
          Pengembang utama dan pendaftaran integrasi organisasi.
        </h1>
        <p className="teks-naratif teks-sekunder" style={{ marginBottom: 0 }}>
          TELUSUR dirancang dan dikembangkan secara menyeluruh oleh{" "}
          <strong>Muhammad Bazwa Arigusna</strong> untuk membantu tim kepatuhan bursa aset kripto, penyidik forensik, lembaga pengawas, serta masyarakat umum dalam menelusuri aliran dana on-chain secara transparan dan dapat dipertanggungjawabkan.
        </p>
      </div>

      {/* Profil Pengembang Utama */}
      <section style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "26px", marginBottom: "16px" }}>
          Arsitek dan Pengembang Utama: Muhammad Bazwa Arigusna
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table
            className="tabel-data"
            aria-label="Cakupan rekayasa sistem oleh Muhammad Bazwa Arigusna"
          >
            <thead>
              <tr>
                <th scope="col" style={{ width: "24%" }}>
                  Pengembang Utama
                </th>
                <th scope="col" style={{ width: "30%" }}>
                  Bidang Rekayasa
                </th>
                <th scope="col">Cakupan Implementasi pada Sistem</th>
              </tr>
            </thead>
            <tbody>
              {CAKUPAN_KEPEMILIKAN.map((item) => (
                <tr key={item.bidang}>
                  <td style={{ fontWeight: 700 }}>Muhammad Bazwa Arigusna</td>
                  <td style={{ fontWeight: 600, color: "var(--tinta-redup)" }}>
                    {item.bidang}
                  </td>
                  <td className="teks-kecil" style={{ color: "var(--tinta)" }}>
                    {item.uraian}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Protokol Validasi Operasional */}
      <section style={{ marginBottom: "64px" }}>
        <div style={{ maxWidth: "68ch", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "26px", marginBottom: "10px" }}>
            Protokol penyelarasan alur kerja organisasi
          </h2>
          <p className="teks-naratif teks-sekunder" style={{ marginBottom: 0 }}>
            Saat mengintegrasikan TELUSUR ke meja kepatuhan perusahaan atau unit penyidikan, lima pertanyaan operasional berikut digunakan untuk menyelaraskan ambang kuantil ACI dan format lembar kasus:
          </p>
        </div>

        <div className="panel-kerja" style={{ padding: "24px" }}>
          <ol
            style={{
              margin: 0,
              paddingLeft: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              maxWidth: "68ch",
            }}
          >
            {PERTANYAAN_VALIDASI.map((q) => (
              <li key={q} style={{ fontWeight: 500, color: "var(--tinta)" }}>
                {q}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Formulir Pendaftaran Integrasi & Kunci API Organisasi */}
      <section id="form-akses">
        <div style={{ maxWidth: "68ch", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "26px", marginBottom: "10px" }}>
            Daftarkan organisasi Anda dan dapatkan kunci API integrasi
          </h2>
          <p className="teks-naratif teks-sekunder" style={{ marginBottom: 0 }}>
            Isi formulir di bawah ini untuk menerbitkan kunci API organisasi secara langsung dan mencatat pendaftaran integrasi Anda ke dalam sistem.
          </p>
        </div>

        <EarlyAccessForm />
      </section>
    </div>
  );
}
