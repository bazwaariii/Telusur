import React from "react";
import Link from "next/link";
import { HeroGraph } from "@/components/HeroGraph";
import { AciThresholdChart } from "@/components/AciThresholdChart";
import { EarlyAccessForm } from "@/components/EarlyAccessForm";
import { META_DATA } from "@/lib/demo-data";

const TAHAP_CARA_KERJA = [
  {
    nomor: "1",
    judul: "Penyerapan aliran transaksi",
    uraian:
      "Membaca transaksi terarah secara berurutan per blok atau timestep untuk memetakan hubungan pengirim dan penerima.",
    status: "Berjalan pada data ekspor dan aliran langsung",
  },
  {
    nomor: "2",
    judul: "Fitur struktur graf dua lompatan",
    uraian:
      "Menghitung derajat pemecahan dana, waktu singgah antarblok, dan nisbah konvergensi pada tetangga satu hingga dua lompatan.",
    status: "Terbukti pada uji Elliptic",
  },
  {
    nomor: "3",
    judul: "Skor LightGBM, ambang menyesuaikan, dan SHAP",
    uraian:
      "Menghasilkan skor risiko (< 1 ms per transaksi di satu CPU), menyesuaikan ambang kuantil terhadap target FPR, dan menyajikan alasan SHAP.",
    status: "Menerima sinyal koreksi dari tahap 5",
  },
  {
    nomor: "4",
    judul: "Pemantau pergeseran distribusi (PSI dan KS)",
    uraian:
      "Memantau Population Stability Index (PSI) dan statistik KS untuk mendeteksi ketika pola transaksi berubah drastis seperti pada t43.",
    status: "Aktif: mendeteksi PSI 0,42 (> 0,25) pada t43",
  },
  {
    nomor: "5",
    judul: "Tinjauan manusia dan lembar kasus",
    uraian:
      "Analis memeriksa bukti graf, menandai alarm palsu, atau mengekspor lembar kasus satu halaman. Tidak ada pembekuan otomatis.",
    status: "Mengirim umpan balik ke tahap 3",
  },
];

const BARIS_PENGGUNA = [
  {
    peran: "Penyidik dan auditor forensik",
    segmen: "Penegak hukum, lembaga pengawas, dan auditor independen",
    lencana: null,
    tugas:
      "Menelusuri dana yang dipecah melewati puluhan dompet perantara hingga bermuara ke satu titik pencairan, memeriksa tiga hingga lima alasan kontribusi fitur teratas, lalu mengunduh lembar kasus satu halaman yang memuat versi model dan batas protokol sebagai lampiran laporan.",
  },
  {
    peran: "Tim kepatuhan bursa aset kripto",
    segmen: "Compliance officer pada pedagang fisik aset kripto dan institusi keuangan",
    lencana: null,
    tugas:
      "Memeriksa antrean transaksi masuk berisiko tinggi sebelum penarikan ke mata uang fiat diproses. Saat analis menandai sebuah transaksi sebagai alarm palsu, keputusan tersebut tercatat di log audit dan memperbarui ambang menyesuaikan diri pada siklus berikutnya.",
  },
  {
    peran: "Masyarakat umum dan perusahaan (inspeksi alamat dompet)",
    segmen: "Pengguna dan korporasi yang memeriksa dompet tujuan sebelum mengirim dana",
    lencana: null,
    tugas:
      "Menampilkan skor struktur graf 2-lompatan, band risiko, dan penjelasan bahasa biasa pada jaringan Bitcoin, TRON (USDT TRC-20), serta Ethereum (EVM) tanpa melabeli pemilik dompet sebagai pelaku bersalah.",
  },
];

const BATAS_BUKTI = [
  {
    butir: "Tolok ukur terkalibrasi berasal dari jaringan Bitcoin (Elliptic)",
    status: "203.769 node teruji",
    penjelasan:
      "Metrik benchmark terukur (F1 82,6% dan FPR 0,24%) dievaluasi pada dataset publik Elliptic di jaringan Bitcoin. Untuk jaringan TRON (USDT TRC-20) dan Ethereum (EVM), sistem menerapkan ekstraksi struktur graf 2-lompatan secara langsung.",
  },
  {
    butir: "Fitur konteks rezim memberi kontribusi terukur yang moderat di Elliptic",
    status: "82,6% berbanding 82,5% F1",
    penjelasan:
      "Penambahan fitur konteks rezim menyumbang selisih 0,1 poin F1 (sekitar 2,0% dari total gain) pada pengujian Elliptic dan digunakan bersama indeks PSI/KS sebagai sinyal pemantau perubahan rezim.",
  },
  {
    butir: "Pergeseran rezim t43 memerlukan pelatihan ulang berkala",
    status: "PSI 0,42 pada t43",
    penjelasan:
      "Setelah penutupan pasar gelap pada timestep t43, recall turun dari 85,9% menjadi 1,8%. Pemantau PSI (0,42 > batas 0,25) dan statistik KS (0,31) mendeteksi pergeseran ini sementara ACI menjaga tingkat alarm palsu (FPR) tetap terkendali.",
  },
  {
    butir: "Sekitar 1 dari 4 transaksi ilegal tidak tertangkap pada uji",
    status: "Recall uji 73,1%",
    penjelasan:
      "Pada titik operasi yang menjaga FPR tetap sangat rendah (0,24% agregat), recall berada di angka 73,1%. Artinya sistem ini adalah alat bantu penyaringan prioritas bagi analis, bukan pendeteksi sempurna.",
  },
];

export default function BerandaPage() {
  return (
    <div>
      {/* ================= 1. HERO ================= */}
      <section
        style={{
          paddingTop: "52px",
          paddingBottom: "48px",
          borderBottom: "1px solid var(--rute)",
        }}
      >
        <div className="wadah-konten">
          <div style={{ maxWidth: "740px", marginBottom: "32px" }}>
            <h1 style={{ marginBottom: "18px" }}>
              Dana yang dipecah ke ratusan dompet masih bermuara ke satu pintu keluar.
            </h1>
            <p className="teks-naratif teks-sekunder" style={{ marginBottom: "28px" }}>
              TELUSUR menandai alirannya, menunjukkan alasannya, dan menyerahkan keputusan penahanan ke manusia.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <Link href="/jelajah" className="tombol-utama">
                Coba penjelajah demo
              </Link>
              <a
                href="#belum-dibuktikan"
                style={{
                  fontWeight: 600,
                  fontSize: "var(--teks-ui)",
                  padding: "10px 4px",
                  minHeight: "44px",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                Baca batas klaim kami
              </a>
            </div>
          </div>
        </div>

        <div className="wadah-kanvas">
          <HeroGraph />
        </div>
      </section>

      {/* ================= 2. CARA KERJA (LIMA TAHAP BERURUTAN) ================= */}
      <section
        id="cara-kerja"
        style={{
          paddingTop: "72px",
          paddingBottom: "72px",
          borderBottom: "1px solid var(--rute)",
        }}
      >
        <div className="wadah-konten">
          <div style={{ maxWidth: "68ch", marginBottom: "32px" }}>
            <h2 style={{ marginBottom: "12px" }}>
              Lima tahap berurutan dari transaksi mentah hingga meja tinjauan analis.
            </h2>
            <p className="teks-naratif teks-sekunder" style={{ marginBottom: 0 }}>
              Penomoran di bawah ini mengikuti urutan pemrosesan data yang sebenarnya. Ketika analis meninjau alert di tahap 5, keputusan mereka dikirim kembali ke tahap 3 untuk memperbarui ambang skor.
            </p>
          </div>

          <ol
            className="grid-5-tahap"
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            {TAHAP_CARA_KERJA.map((tahap) => (
              <li key={tahap.nomor}>
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                      paddingBottom: "10px",
                      borderBottom: "1px solid var(--garis)",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "26px",
                        height: "26px",
                        borderRadius: "999px",
                        backgroundColor: "var(--tinta)",
                        color: "#FFFFFF",
                        fontWeight: 700,
                        fontSize: "13px",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {tahap.nomor}
                    </span>
                    <span className="teks-kecil">Tahap {tahap.nomor}</span>
                  </div>
                  <h3 style={{ fontSize: "17px", marginBottom: "8px" }}>{tahap.judul}</h3>
                  <p className="teks-kecil" style={{ color: "var(--tinta)", marginBottom: "16px" }}>
                    {tahap.uraian}
                  </p>
                </div>
                <div
                  className="teks-kecil"
                  style={{
                    paddingTop: "10px",
                    borderTop: "1px solid var(--garis)",
                    fontWeight: 600,
                    color:
                      tahap.nomor === "3" || tahap.nomor === "5"
                        ? "var(--teal-tua)"
                        : "var(--tinta-redup)",
                  }}
                >
                  {tahap.status}
                </div>
              </li>
            ))}
          </ol>

          {/* Diagram umpan balik terintegrasi tepat di bawah kolom 5 ke kolom 3 */}
          <div
            style={{
              backgroundColor: "var(--putih)",
              borderLeft: "1px solid var(--rute)",
              borderRight: "1px solid var(--rute)",
              borderBottom: "1px solid var(--rute)",
              padding: "12px 16px",
            }}
          >
            <svg
              viewBox="0 0 1000 52"
              role="img"
              aria-label="Alur umpan balik dari Tahap 5 kembali ke Tahap 3: umpan balik analis memperbarui ambang"
              style={{ width: "100%", height: "auto", display: "block" }}
            >
              <defs>
                <marker
                  id="feedback-arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="var(--teal-tua)" />
                </marker>
              </defs>
              {/* Kolom 5 berada di x=900, Kolom 3 berada di x=500 */}
              <path
                d="M 900 6 L 900 32 L 500 32 L 500 10"
                fill="none"
                stroke="var(--teal-tua)"
                strokeWidth="2"
                markerEnd="url(#feedback-arrow)"
              />
              <circle cx="900" cy="6" r="4" fill="var(--tinta)" />
              <rect
                x="565"
                y="19"
                width="270"
                height="24"
                rx="4"
                fill="var(--kertas)"
                stroke="var(--teal-tua)"
              />
              <text
                x="700"
                y="35"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="var(--teal-tua)"
              >
                Umpan balik analis memperbarui ambang
              </text>
            </svg>
          </div>
        </div>
      </section>

      {/* ================= 3. HASIL UJI ================= */}
      <section
        id="hasil-uji"
        style={{
          paddingTop: "72px",
          paddingBottom: "72px",
          borderBottom: "1px solid var(--rute)",
        }}
      >
        <div className="wadah-konten">
          <div style={{ maxWidth: "68ch", marginBottom: "32px" }}>
            <h2 style={{ marginBottom: "12px" }}>
              Hasil uji pada pembagian temporal Elliptic (Bitcoin).
            </h2>
            <p className="teks-naratif teks-sekunder" style={{ marginBottom: "8px" }}>
              Setiap angka di bawah ini diukur pada dataset Bitcoin (Elliptic), bukan TRON atau EVM. Keunggulan utama pendekatan ini terletak pada penekanan jumlah alarm palsu agar antrean tinjauan analis tetap terkendali.
            </p>
            <p className="teks-kecil" style={{ fontWeight: 600, color: "var(--tinta)", marginBottom: 0 }}>
              Protokol: Elliptic (Bitcoin), pembagian temporal t1 sampai t34 / t35 sampai t49, rata-rata 5 seed.
            </p>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <AciThresholdChart />
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              className="tabel-data"
              aria-label="Perbandingan metrik model pada dataset Elliptic (Bitcoin)"
            >
              <thead>
                <tr>
                  <th scope="col">Konfigurasi model</th>
                  <th scope="col">F1 (kelas ilegal)</th>
                  <th scope="col">FPR (alarm palsu)</th>
                  <th scope="col">Recall</th>
                  <th scope="col">Presisi</th>
                  <th scope="col">Catatan evaluasi</th>
                </tr>
              </thead>
              <tbody>
                {META_DATA.metrics_table_3.map((row) => (
                  <tr key={row.model}>
                    <td style={{ fontWeight: 600 }}>{row.model}</td>
                    <td style={{ fontWeight: 700 }}>{row.f1_pct}</td>
                    <td style={{ fontWeight: 700 }}>{row.fpr_pct}</td>
                    <td>{row.recall_pct}</td>
                    <td>{row.precision_pct}</td>
                    <td className="teks-kecil">{row.note}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan={6}
                    className="teks-kecil"
                    style={{
                      backgroundColor: "var(--kertas)",
                      borderTop: "1px solid var(--rute)",
                      fontWeight: 600,
                      color: "var(--tinta)",
                    }}
                  >
                    Protokol: Elliptic (Bitcoin), pembagian temporal t1 sampai t34 / t35 sampai t49, rata-rata 5 seed. Cakupan: Bitcoin (Elliptic), bukan TRON/EVM. Spesifikasi uji kecepatan ({META_DATA.benchmark_hardware}).
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* ================= 4. SIAPA YANG MEMAKAINYA (TIGA BARIS, DUA KOLOM) ================= */}
      <section
        id="pengguna"
        style={{
          paddingTop: "72px",
          paddingBottom: "72px",
          borderBottom: "1px solid var(--rute)",
        }}
      >
        <div className="wadah-konten">
          <div style={{ maxWidth: "68ch", marginBottom: "32px" }}>
            <h2 style={{ marginBottom: "12px" }}>
              Siapa yang memakainya dan untuk pekerjaan apa.
            </h2>
            <p className="teks-naratif teks-sekunder" style={{ marginBottom: 0 }}>
              Dirancang untuk meja kerja analis yang harus mempertanggungjawabkan alasan setiap penandaan di dalam laporan pemeriksaan.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "var(--putih)",
              borderTop: "1px solid var(--rute)",
              borderBottom: "1px solid var(--rute)",
            }}
          >
            {BARIS_PENGGUNA.map((baris) => (
              <div key={baris.peran} className="baris-dua-kolom">
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                      marginBottom: "6px",
                    }}
                  >
                    <h3 style={{ fontSize: "20px", marginBottom: 0 }}>
                      {baris.peran}
                    </h3>
                    {baris.lencana && (
                      <span
                        style={{
                          padding: "2px 10px",
                          borderRadius: "var(--r-chip)",
                          border: "1px solid var(--rute)",
                          backgroundColor: "var(--kertas)",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "var(--tinta-redup)",
                        }}
                      >
                        {baris.lencana}
                      </span>
                    )}
                  </div>
                  <p className="teks-kecil" style={{ marginBottom: 0 }}>
                    {baris.segmen}
                  </p>
                </div>

                <div>
                  <p style={{ marginBottom: 0, maxWidth: "65ch", color: "var(--tinta)" }}>
                    {baris.tugas}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 5. YANG BELUM KAMI BUKTIKAN ================= */}
      <section
        id="belum-dibuktikan"
        style={{
          paddingTop: "72px",
          paddingBottom: "72px",
          borderBottom: "1px solid var(--rute)",
        }}
      >
        <div className="wadah-konten">
          <div style={{ maxWidth: "68ch", marginBottom: "32px" }}>
            <h2 style={{ marginBottom: "12px" }}>
              Yang belum kami buktikan sampai hari ini.
            </h2>
            <p className="teks-naratif teks-sekunder" style={{ marginBottom: 0 }}>
              Dalam forensik keuangan, melebih-lebihkan kemampuan model justru membahayakan penyelidikan dan merugikan pemilik dompet yang tidak bersalah. Berikut adalah batas bukti eksperimen kami saat ini.
            </p>
          </div>

          <div style={{ overflowX: "auto", marginBottom: "20px" }}>
            <table
              className="tabel-data"
              aria-label="Daftar hal yang belum dibuktikan beserta statusnya"
            >
              <thead>
                <tr>
                  <th scope="col" style={{ width: "28%" }}>
                    Batas klaim
                  </th>
                  <th scope="col" style={{ width: "20%" }}>
                    Status saat ini
                  </th>
                  <th scope="col">Penjelasan jujur dan rencana validasi</th>
                </tr>
              </thead>
              <tbody>
                {BATAS_BUKTI.map((item) => (
                  <tr key={item.butir}>
                    <td style={{ fontWeight: 600 }}>{item.butir}</td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: "var(--r-chip)",
                          border: "1px solid var(--rute)",
                          backgroundColor: "var(--kertas)",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="teks-kecil" style={{ color: "var(--tinta)" }}>
                      {item.penjelasan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Link href="/metodologi" className="tombol-sekunder">
            Periksa protokol evaluasi dan register klaim lengkap
          </Link>
        </div>
      </section>

      {/* ================= 6. PENDAFTARAN INTEGRASI ORGANISASI ================= */}
      <section
        id="akses-awal"
        style={{
          paddingTop: "72px",
          paddingBottom: "96px",
        }}
      >
        <div className="wadah-konten">
          <div style={{ maxWidth: "68ch", marginBottom: "28px" }}>
            <h2 style={{ marginBottom: "12px" }}>
              Daftarkan organisasi Anda untuk integrasi API dan dasbor kepatuhan.
            </h2>
            <p className="teks-naratif teks-sekunder" style={{ marginBottom: 0 }}>
              Penyidik, auditor, compliance officer bursa aset kripto, dan institusi dapat menerbitkan kunci API organisasi secara langsung di bawah ini untuk mengintegrasikan endpoint penilaian ke alur kerja operasional.
            </p>
          </div>

          <EarlyAccessForm />
        </div>
      </section>
    </div>
  );
}
