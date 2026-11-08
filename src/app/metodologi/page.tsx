import React from "react";
import Link from "next/link";
import { CLAIM_REGISTER, META_DATA } from "@/lib/demo-data";

export const metadata = {
  title: "Metodologi dan Register Klaim: TELUSUR",
  description:
    "Protokol evaluasi pembagian temporal Elliptic, tabel hasil lengkap Tabel 3 dan Tabel 4, formula pembaruan Adaptive Conformal Inference (ACI), dan register klaim publik.",
};

export default function MetodologiPage() {
  return (
    <div
      className="wadah-konten"
      style={{
        paddingTop: "48px",
        paddingBottom: "88px",
      }}
    >
      <div className="layout-metodologi">
        {/* Daftar isi tetap di kiri (design.md Bagian 6.4) */}
        <nav
          aria-label="Daftar isi metodologi"
          style={{
            position: "sticky",
            top: "88px",
            padding: "16px",
            backgroundColor: "var(--putih)",
            border: "1px solid var(--rute)",
            borderRadius: "var(--r-panel)",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: "14px",
              marginBottom: "12px",
              color: "var(--tinta)",
            }}
          >
            Daftar isi dokumen
          </div>
          <ol
            style={{
              margin: 0,
              paddingLeft: "18px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              fontSize: "var(--teks-kecil)",
            }}
          >
            <li>
              <a href="#protokol">Protokol evaluasi dan dataset</a>
            </li>
            <li>
              <a href="#tabel-hasil">Tabel hasil lengkap (Tabel 3 dan 4)</a>
            </li>
            <li>
              <a href="#formula-aci">Formula pembaruan ambang (ACI)</a>
            </li>
            <li>
              <a href="#batas-struktural">Batas struktural dan lisensi</a>
            </li>
            <li>
              <a href="#register-klaim">Register klaim publik</a>
            </li>
          </ol>

          <div
            className="teks-kecil"
            style={{
              marginTop: "16px",
              paddingTop: "12px",
              borderTop: "1px solid var(--garis)",
            }}
          >
            <div>Versi model:</div>
            <code className="font-mono" style={{ fontSize: "11.5px", color: "var(--tinta)" }}>
              {META_DATA.model_version}
            </code>
          </div>
        </nav>

        {/* Kolom utama dokumen */}
        <article style={{ minWidth: 0 }}>
          <header
            style={{
              borderBottom: "1px solid var(--rute)",
              paddingBottom: "24px",
              marginBottom: "40px",
              maxWidth: "68ch",
            }}
          >
            <h1 style={{ marginBottom: "16px" }}>
              Metodologi evaluasi dan register klaim.
            </h1>
            <p className="teks-naratif teks-sekunder" style={{ marginBottom: 0 }}>
              Dokumen ini memuat protokol eksperimen, tabel hasil lengkap dari proposal, persamaan pembaruan ambang menyesuaikan diri, serta daftar periksa klaim agar setiap angka di situs dapat diaudit.
            </p>
          </header>

          {/* 1. PROTOKOL EVALUASI */}
          <section id="protokol" style={{ marginBottom: "56px" }}>
            <h2 style={{ marginBottom: "16px", maxWidth: "68ch" }}>
              1. Protokol evaluasi dan cakupan dataset
            </h2>
            <div className="teks-naratif" style={{ marginBottom: "20px" }}>
              <p>
                Seluruh eksperimen pada Rilis 0 dievaluasi menggunakan dataset publik{" "}
                <strong>Elliptic (Bitcoin)</strong> yang terdiri atas 203.769 simpul transaksi dan 234.355 aliran terarah. Setiap simpul mewakili satu transaksi Bitcoin dengan ID teranonimkan dan 166 fitur bawaan (94 fitur transaksi lokal dan 72 fitur agregasi tetangga satu lompatan), yang kami perluas dengan fitur struktur graf dua lompatan.
              </p>
              <p>
                Untuk mencegah kebocoran informasi masa depan (<em>temporal leakage</em>), kami menerapkan pembagian temporal ketat:
              </p>
              <ul>
                <li>
                  <strong>Periode latih dan kalibrasi awal:</strong> timestep{" "}
                  <code className="font-mono">t1</code> sampai{" "}
                  <code className="font-mono">t34</code>.
                </li>
                <li>
                  <strong>Periode uji (evaluasi berurutan):</strong> timestep{" "}
                  <code className="font-mono">t35</code> sampai{" "}
                  <code className="font-mono">t49</code>, yang mencakup peristiwa penutupan pasar gelap AlphaBay pada <code className="font-mono">t43</code>.
                </li>
                <li>
                  <strong>Pengulangan eksperimen:</strong> setiap konfigurasi model dijalankan pada 5 <em>random seed</em> berbeda dan dilaporkan nilai rata-ratanya.
                </li>
                <li>
                  <strong>Lingkungan uji kecepatan inferensi:</strong> diukur pada satu prosesor CPU (<code className="font-mono">x86_64</code>, 1 vCPU lokal tanpa akselerator GPU), menghasilkan waktu inferensi pohon keputusan kurang dari 1 ms per transaksi (lebih dari 39.000 transaksi per detik).
                </li>
              </ul>
            </div>
          </section>

          {/* 2. TABEL HASIL LENGKAP */}
          <section id="tabel-hasil" style={{ marginBottom: "56px" }}>
            <h2 style={{ marginBottom: "16px", maxWidth: "68ch" }}>
              2. Tabel hasil lengkap (Tabel 3 dan Tabel 4 proposal)
            </h2>
            <p className="teks-naratif" style={{ marginBottom: "20px" }}>
              Tabel 3 membandingkan performa klasifikasi pada periode uji{" "}
              <code className="font-mono">t35</code> sampai{" "}
              <code className="font-mono">t49</code>. Perhatikan bahwa selisih F1 antara LightGBM dan pembanding hanya sekitar 1 poin persentase; keunggulan operasional utama terletak pada penekanan tingkat alarm palsu (FPR) menjadi 0,24%.
            </p>

            <div style={{ overflowX: "auto", marginBottom: "32px" }}>
              <table
                className="tabel-data"
                aria-label="Tabel 3: Perbandingan model klasifikasi pada pembagian temporal Elliptic"
              >
                <thead>
                  <tr>
                    <th scope="col">Tabel 3: Konfigurasi model</th>
                    <th scope="col">F1</th>
                    <th scope="col">FPR</th>
                    <th scope="col">Recall</th>
                    <th scope="col">Presisi</th>
                    <th scope="col">Temuan utama</th>
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
              </table>
            </div>

            <p className="teks-naratif" style={{ marginBottom: "20px" }}>
              Tabel 4 merangkum evaluasi mekanisme ambang menyesuaikan diri (
              <em>Adaptive Conformal Inference</em> / ACI) dibandingkan ambang statis ketika menghadapi pergeseran rezim pasca-<code className="font-mono">t43</code>.
            </p>

            <div style={{ overflowX: "auto" }}>
              <table
                className="tabel-data"
                aria-label="Tabel 4: Evaluasi ambang menyesuaikan diri berbanding ambang statis"
              >
                <thead>
                  <tr>
                    <th scope="col">Tabel 4: Strategi ambang</th>
                    <th scope="col">Rata-rata FPR (t35 sampai t49)</th>
                    <th scope="col">FPR tertinggi per timestep</th>
                    <th scope="col">Recall pra-t43</th>
                    <th scope="col">Recall pasca-t43</th>
                    <th scope="col">Keterangan perilaku</th>
                  </tr>
                </thead>
                <tbody>
                  {META_DATA.metrics_table_4_aci.map((row) => (
                    <tr key={row.strategy}>
                      <td style={{ fontWeight: 600 }}>{row.strategy}</td>
                      <td style={{ fontWeight: 700 }}>{row.mean_fpr_pct}</td>
                      <td>{row.max_fpr_pct}</td>
                      <td>{row.pre_t43_recall_pct}</td>
                      <td>{row.post_t43_recall_pct}</td>
                      <td className="teks-kecil">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 3. FORMULA PEMBARUAN ACI */}
          <section id="formula-aci" style={{ marginBottom: "56px" }}>
            <h2 style={{ marginBottom: "16px", maxWidth: "68ch" }}>
              3. Formula pembaruan ambang menyesuaikan diri (ACI)
            </h2>
            <div className="teks-naratif">
              <div
                style={{
                  padding: "20px 24px",
                  backgroundColor: "var(--putih)",
                  border: "1px solid var(--rute)",
                  borderRadius: "var(--r-kontrol)",
                  marginBottom: "16px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "17px",
                }}
              >
                &alpha;<sub>t+1</sub> = min(&alpha;<sub>maks</sub>, max(&alpha;<sub>min</sub>, &alpha;<sub>t</sub> + &gamma;(&alpha;* &minus; err<sub>t</sub>)))
              </div>
              <p>
                <strong>Penjelasan satu kalimat:</strong> Jika tingkat kesalahan (alarm palsu terverifikasi, <code className="font-mono">err_t</code>) pada langkah waktu <code className="font-mono">t</code> melampaui target <code className="font-mono">&alpha;*</code>, ambang skor dinaikkan sebesar laju belajar <code className="font-mono">&gamma;</code> agar langkah berikutnya lebih selektif, dan sebaliknya diturunkan bila alarm palsu berada di bawah target.
              </p>
              <p>
                Untuk mencegah manipulasi (misalnya pelaku sengaja membanjiri sistem agar ambang terus naik), nilai <code className="font-mono">err_t</code> hanya dihitung dari alert yang telah ditinjau oleh analis manusia, dan pergerakan ambang dibatasi oleh batas atas <code className="font-mono">&alpha;_maks</code>.
              </p>
            </div>
          </section>

          {/* 4. BATAS STRUKTURAL DAN LISENSI */}
          <section id="batas-struktural" style={{ marginBottom: "56px" }}>
            <h2 style={{ marginBottom: "16px", maxWidth: "68ch" }}>
              4. Batas struktural dataset dan etika pelabelan
            </h2>
            <div className="teks-naratif">
              <ul>
                <li>
                  <strong>ID transaksi teranonimkan:</strong> Dataset Elliptic standar memetakan simpul sebagai transaksi dengan ID angka teranonimkan, bukan string alamat dompet Bitcoin mentah. Oleh karena itu, kluster benchmark pada Penjelajah diindeks berdasarkan ID simpul transaksi atau kode kluster, sementara inspeksi alamat TRON dan EVM disediakan sebagai pemindai struktur 2-lompatan terpisah.
                </li>
                <li>
                  <strong>Prinsip verifikasi manusia:</strong> Setiap keluaran skor pada TELUSUR selalu disajikan dengan pernyataan bahwa skor risiko bukan bukti bersalah. Sistem tidak menyediakan fungsi pemblokiran atau pembekuan otomatis.
                </li>
                <li>
                  <strong>Kepatuhan lisensi dan pelindungan data:</strong> Penggunaan dataset benchmark Elliptic mengacu pada atribusi akademik standar, sementara pemindaian jaringan langsung hanya memproses data transaksi publik on-chain tanpa menyimpan informasi identitas pribadi sesuai UU PDP.
                </li>
              </ul>
            </div>
          </section>

          {/* 5. REGISTER KLAIM PUBLIK */}
          <section id="register-klaim">
            <h2 style={{ marginBottom: "16px", maxWidth: "68ch" }}>
              5. Register klaim versi publik
            </h2>
            <p className="teks-naratif" style={{ marginBottom: "20px" }}>
              Tidak ada angka atau klaim yang boleh tampil di seluruh halaman TELUSUR apabila belum terdaftar dan diverifikasi pada tabel di bawah ini.
            </p>

            <div style={{ overflowX: "auto", marginBottom: "28px" }}>
              <table
                className="tabel-data"
                aria-label="Register klaim publik TELUSUR"
              >
                <thead>
                  <tr>
                    <th scope="col">Kode</th>
                    <th scope="col">Klaim teknis</th>
                    <th scope="col">Status bukti</th>
                    <th scope="col">Cakupan dan protokol</th>
                    <th scope="col">Aturan penulisan di situs</th>
                  </tr>
                </thead>
                <tbody>
                  {CLAIM_REGISTER.map((item) => (
                    <tr key={item.id}>
                      <td className="font-mono" style={{ fontWeight: 700 }}>
                        {item.id}
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.claim}</td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: "var(--r-chip)",
                            border: "1px solid var(--rute)",
                            backgroundColor: "var(--kertas)",
                            fontSize: "12px",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.evidence_status}
                        </span>
                      </td>
                      <td className="teks-kecil">{item.scope_and_protocol}</td>
                      <td className="teks-kecil" style={{ color: "var(--tinta)" }}>
                        {item.public_phrasing}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Link href="/jelajah" className="tombol-utama">
              Uji langsung di Penjelajah demo
            </Link>
          </section>
        </article>
      </div>
    </div>
  );
}
