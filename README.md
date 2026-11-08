# TELUSUR Web

Aplikasi web forensik on-chain **TELUSUR** untuk menelusuri pemecahan dana kripto ke titik pencairan, menyajikan alasan kontribusi fitur SHAP, memantau pergeseran distribusi (PSI dan KS), mengkalibrasi ambang menyesuaikan diri (Adaptive Conformal Inference / ACI), dan menyerahkan keputusan penahanan kepada manusia.

**Pengembang dan Arsitek Utama:** Muhammad Bazwa Arigusna

## Ringkasan Arsitektur dan Permukaan Sistem

| Rute | Permukaan | Deskripsi |
|---|---|---|
| `/` | Beranda | Hero graf penelusuran interaktif (`S -> M1..M4 -> P1..P4 -> AGG` dan cabang normal `P5`), alur 5 tahap berurutan dengan umpan balik dari tahap 5 ke tahap 3, bagan dua panel ambang menyesuaikan diri (ACI) dan FPR, tabel metrik protokol Elliptic, tiga baris peran pengguna, daftar batas bukti, serta pendaftaran integrasi organisasi. |
| `/jelajah` | Penjelajah Graf dan Pemantau Jaringan Langsung | Ruang kerja forensik 3 kolom (`280px` kluster ditandai, kanvas graf interaktif berbasis `graphology` + tampilan `Daftar` setara aksesibel + pemantau aliran transaksi langsung lintas jaringan Bitcoin, TRON USDT TRC-20, dan Ethereum EVM + penggeser waktu `t35` sampai `t49`, serta panel detail `340px` dengan kontribusi alasan SHAP berpusat di nol, tombol `Tandai alarm palsu`, `Tambah ke kasus`, dan cetak satu halaman `Unduh lembar kasus (PDF)`). |
| `/metodologi` | Metodologi dan Register Klaim | Halaman dokumen satu kolom (`68ch`, Literata) dengan daftar isi tetap di kiri, protokol pembagian temporal Elliptic (`t1 sampai t34` / `t35 sampai t49`, 5 seed), Tabel 3 dan Tabel 4 lengkap, formula pembaruan ACI dengan penjelasan satu kalimat, dan register klaim publik. |
| `/akses` (`/tim`) | Pengembang dan Integrasi Organisasi | Profil pengembang utama Muhammad Bazwa Arigusna, protokol penyelarasan alur kerja organisasi, serta formulir pendaftaran integrasi yang menerbitkan kunci API organisasi secara langsung. |
| `/masuk` & `/app` | Dasbor Analis dan Kepatuhan | Sistem autentikasi sesi berbasis peran (`analis`, `admin`, `mitra-api`, `pembaca`) dengan generator TOTP 2FA yang berputar setiap 30 detik, antrean tinjauan alert waktu nyata, pemantau drift PSI dan KS, pembaruan ambang ACI berbatas atas (`cap = 0,85`), pengujian webhook bertanda tangan HMAC-SHA256, dan ekspor log audit *append-only* (CSV). |
| `/docs` | Dokumentasi Kontrak REST API | Dokumentasi dua kolom dengan penguji interaktif `POST /api/v1/score` untuk Bitcoin, TRON, dan EVM, contoh `POST /api/v1/feedback`, `GET /api/v1/alerts`, `GET /api/v1/usage`, dan spesifikasi webhook bertanda tangan HMAC. |
| `/cek` | Inspeksi Risiko Dompet Multi-Chain | Pemindaian struktur graf 2-lompatan, skor risiko, himpunan prediksi konformal, dan alasan SHAP untuk alamat dompet maupun hash transaksi TRON (`T...`), Ethereum (`0x...`), dan Bitcoin (`bc1q...` / `tx_...`). |

## Menjalankan Proyek

1. **Instalasi dependensi:**
   ```bash
   npm install
   ```

2. **Ekspor ulang data benchmark (`/public/data/*.json`):**
   ```bash
   python scripts/export_demo_data.py
   ```

3. **Verifikasi kepatuhan desain dan kode sumber:**
   ```bash
   python scripts/verify_compliance.py
   ```

4. **Menjalankan server pengembangan:**
   ```bash
   npm run dev
   ```

5. **Membangun versi produksi:**
   ```bash
   npm run build
   npm run start
   ```
