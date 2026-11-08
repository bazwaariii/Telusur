# TELUSUR Web: Rencana Pengerjaan

Draf 1, disusun 7 November 2026 dari `Proposal_TELUSUR_SENO_Hackathon_2026_final.pdf`.
Pasangan dokumen ini: `design.md` (arah visual dan interaksi).

---

## 1. Tujuan

Mengubah TELUSUR dari proposal menjadi website yang benar-benar bisa dipakai orang lain, dibangun bertahap. Setiap rilis harus bisa didemokan sendiri, dan tidak boleh mengklaim lebih dari yang sudah dibuktikan eksperimen di proposal.

"Website" di sini terdiri dari empat permukaan dengan kesiapan berbeda:

| Permukaan | Untuk siapa | Isi | Rilis |
|---|---|---|---|
| A. Situs publik | Juri, calon mitra, pengunjung | Beranda, metodologi dan batas klaim, tim, form minta akses awal | Rilis 0 |
| B. Penjelajah demo | Siapa pun yang ingin mencoba | Graf forensik interaktif di atas keluaran model pada data Elliptic (mode demo) | Rilis 0 |
| C. Dasbor dan API | Analis, auditor, compliance officer, mitra bursa | Login, antrean alert, umpan balik alarm palsu, kasus dan ekspor, API key, webhook, Telegram | Rilis 2 |
| D. Cek dompet publik (B2C) | Masyarakat umum | Cek keamanan alamat dompet | Rilis 3, hanya jika gerbang validasi lulus |

Gerbang validasi untuk D: (1) model sudah divalidasi pada data TRON/EVM nyata dengan FPR terukur, (2) ada tinjauan hukum soal pelabelan alamat, (3) keluaran berupa skor risiko dengan penjelasan, bukan label "pelaku".

---

## 2. Hasil analisis PDF yang menentukan keputusan website

### 2.1 Modal yang kuat

- Arsitektur lima komponen sudah jelas (ingestion, fitur graf, inferensi plus ACI plus SHAP, drift monitor, dasbor dan alert). Ini langsung jadi peta modul website.
- Alur umpan balik analis (alarm palsu terverifikasi menjadi sinyal untuk ACI) adalah fitur produk yang khas. Dasbor harus dirancang di sekitarnya.
- Proposal sudah jujur soal banyak keterbatasan. Itu aset: website bisa menjadikan kejujuran sebagai pembeda, bukan menyembunyikannya.
- Tiga segmen pengguna (B2G, B2B, B2C) dan peran tim sudah terdefinisi.

### 2.2 Register klaim: apa yang boleh tampil di situs

Aturan: tidak ada angka atau klaim di situs yang tidak ada di tabel ini. Kalau ada klaim baru, tambahkan dulu ke sini.

| Klaim di proposal | Status bukti | Cara menuliskannya di situs |
|---|---|---|
| F1 82,6% dan FPR 0,24% (LightGBM, Elliptic, split temporal, 5 seed) | Terbukti, hanya Bitcoin/Elliptic | Tampilkan selalu bersama protokol dan label "Bitcoin (Elliptic), bukan TRON/EVM" |
| LightGBM mengalahkan RF dan XGBoost | Selisih F1 hanya sekitar 1 poin; keunggulan nyata ada di FPR | "Alarm palsu lebih sedikit", jangan "jauh lebih akurat" |
| Fitur rezim (regime-aware) meningkatkan performa | Belum terbukti: 82,5 vs 82,6, hanya 2,0% dari gain | Jangan jadikan kata utama di hero. Tulis sebagai rancangan yang diuji di Fase 3 |
| ACI menjaga FPR mendekati target | Terbukti sebagai rata-rata jangka panjang (1,05% vs 1,54%); per timestep sempat di atas 2% (t44, t49) | Tampilkan grafik apa adanya, termasuk titik yang melewati 2% |
| Recall sekitar 73% | Terbukti | Tampilkan sebagai batas: pada uji ini sekitar 1 dari 4 transaksi ilegal tidak tertangkap |
| Concept drift: recall 85,9% turun ke 1,8% setelah t43 | Terbukti sebagai masalah | Tampilkan sebagai motivasi |
| Pemantau PSI/KS dan retraining menyelesaikan drift | Belum dievaluasi di proposal. ACI hanya mengendalikan FPR, bukan recall | Tulis "dirancang, belum dievaluasi". Jangan menyiratkan masalah recall sudah teratasi |
| Inferensi kurang dari 1 ms, lebih dari 39.000 transaksi per detik | Terukur di satu CPU | Cantumkan spesifikasi CPU sebelum dipublikasikan |
| Analisis manual 2 sampai 4 minggu menjadi hitungan menit | Asumsi tim, belum divalidasi | Jangan jadi klaim. Validasi dulu lewat wawancara di Fase 2 |
| Harga Basic Rp5 juta, Pro Rp25 juta per bulan | Rencana, belum divalidasi | Tidak ada halaman harga publik di Rilis 0 sampai 2. Pakai "Minta akses awal" |
| Pesaing mulai USD 50.000 per tahun | Perkiraan tim | Tidak dipublikasikan |
| Data residency dalam negeri, integrasi format PPATK | Belum ada | Tidak diklaim sampai infrastrukturnya ada |
| Dukungan TRON (USDT TRC-20) dan EVM | Belum divalidasi (Fase 3) | Lencana "Segera" pada pemilih jaringan, bukan fitur aktif |
| Statistik OJK dan PPATK | Bersumber | Boleh, cantumkan tautan sumber dan periksa ulang angkanya sebelum rilis |

### 2.3 Celah struktural yang memengaruhi desain sistem

1. **Elliptic bukan data alamat.** Setahu saya node Elliptic adalah transaksi dengan ID teranonimkan, jadi pencarian alamat Bitcoin nyata tidak bisa dilakukan di sana (cek untuk Elliptic++, yang memuat data alamat). Penjelajah demo mencari lewat ID node atau kluster, bukan alamat.
2. **Lisensi data.** Periksa syarat penggunaan Elliptic/Elliptic++, IBM AML, dan dataset Kaggle Ethereum sebelum menampilkan data turunan di situs publik, terlebih jika nanti komersial.
3. **Risiko salah tuduh.** Proposal sendiri mencatatnya. Di situs: bahasa "ditandai untuk ditinjau", tidak ada tombol pembekuan otomatis, setiap tindakan lanjutan melalui verifikasi manusia.
4. **Skenario demo harus tahan gangguan.** Jaringan venue hackathon tidak bisa diandalkan. Demo tidak boleh bergantung pada backend live atau RPC eksternal.

---

## 3. Keputusan scope

**Prinsip:** demo yang jujur dan solid lebih dulu, produk berikutnya. Jangan membangun fitur yang tidak bisa dipertanggungjawabkan di depan juri.

- Rilis 0 tidak butuh backend. Data demo diekspor sekali dari notebook ke JSON statis. Ini mengurangi titik gagal dan memungkinkan demo offline.
- Ilustrasi (graf hero, mengikuti Gambar 1 proposal) dan data nyata (Penjelajah, keluaran model pada Elliptic) harus dibedakan secara visual dan diberi label.
- Tidak ada skor untuk alamat TRON/EVM nyata sebelum validasi Fase 3.
- Tidak dibangun sebelum Februari 2027: billing dan pembayaran, perluasan lintas jembatan (cross-chain bridge), dukungan Solana, aplikasi mobile.
- Situs berbahasa Indonesia dulu. Versi Inggris ditunda sampai ada kebutuhan nyata (mis. Demo Day atau mitra asing).

---

## 4. Pengguna dan alur utama

| Peran | Tujuan | Alur inti |
|---|---|---|
| Pengunjung/juri | Paham masalah dan solusi dalam kurang dari 2 menit | Beranda, mainkan graf hero, buka Penjelajah, baca Batas klaim |
| Analis/auditor | Menelusuri dan menjelaskan satu kasus | Antrean alert, buka graf, baca alasan SHAP, tandai alarm palsu atau konfirmasi, tambah ke kasus, ekspor lembar kasus |
| Compliance officer bursa | Memasang pengecekan sebelum penarikan Rupiah | Daftar, ambil API key, uji endpoint, atur webhook, pantau kuota |
| Admin organisasi | Mengelola akses | Undang pengguna, atur peran, lihat audit log |
| Publik (Rilis 3) | Cek alamat sebelum mengirim dana | Tempel alamat, baca skor dan penjelasan, pelajari batasnya |

Peran akses: `admin`, `analis`, `pembaca`, `mitra-api`. Analis memakai 2FA.

---

## 5. Sitemap dan fitur per rilis

| Halaman | Rilis | Catatan |
|---|---|---|
| `/` Beranda (hero graf interaktif, cara kerja, hasil uji, siapa yang memakai, yang belum kami buktikan, minta akses) | 0 | Detail di design.md |
| `/jelajah` Penjelajah demo | 0 | Graf, penggeser timestep t35 sampai t49, panel detail dengan alasan SHAP, tampilan daftar sebagai alternatif graf |
| `/metodologi` Metodologi dan batas klaim | 0 | Protokol evaluasi, tabel hasil lengkap, register klaim versi publik |
| `/tim` dan `/akses` | 0 | Form minta akses awal (email, institusi, peran) |
| `/masuk`, `/app` Dasbor (antrean alert, kasus, API key, pengaturan, audit log) | 2 | |
| `/docs` Dokumentasi API | 2 | |
| `/cek` Cek dompet publik | 3 (bersyarat) | Lihat gerbang validasi di bagian 1 |
| `/harga` | Setelah validasi | Hanya jika wawancara mendukung asumsi harga |

Prioritas (MoSCoW) untuk Rilis 0:

- **Harus:** hero graf, Penjelajah dengan data nyata, halaman Metodologi, responsif, aksesibel (navigasi keyboard, tampilan daftar), terdeploy dengan HTTPS.
- **Sebaiknya:** penggeser timestep dengan garis ambang ACI, ekspor lembar kasus (PDF) dari Penjelajah, form minta akses.
- **Bisa:** mode gelap, pencarian ID node.
- **Tidak sekarang:** login, backend live, pembayaran.

---

## 6. Arsitektur dan stack

Selaras dengan proposal (Next.js dan FastAPI), disederhanakan per rilis.

```
Rilis 0                         Rilis 2 dan seterusnya
-------                         ----------------------
Next.js (statis/SSG)            Next.js  --->  FastAPI  --->  PostgreSQL
   |                                              |  \-->  Redis (rate limit, antrean)
   +-- /public/data/*.json                        +-- model LightGBM + SHAP + ACI (versi bertanda)
        ^                                         +-- worker: ingestion, drift monitor (terjadwal)
        |                                         +-- webhook (HMAC) dan Bot Telegram
   scripts/export_demo_data.py
   (dari notebook, dijalankan Ari)
```

**Stack yang disarankan**

- Frontend: Next.js (App Router, TypeScript), CSS variables untuk token desain.
- Graf: Sigma.js dengan graphology (WebGL, kuat untuk ribuan node) di Penjelajah. Hero memakai SVG dengan koordinat yang ditempatkan manual, bukan layout otomatis, agar deterministik.
- Grafik: Observable Plot atau visx, bukan Chart.js bawaan.
- Backend (Rilis 2): FastAPI, PostgreSQL, Redis. Setiap respons memuat `model_version`.
- Hosting: Rilis 0 di Vercel. Pilihan hosting produksi (termasuk lokasi data) diputuskan sebelum ada klaim data residency.
- Auth (Rilis 2): Auth.js atau Supabase Auth, keduanya cukup. Pilih yang paling cepat dikuasai Nur. TOTP 2FA untuk analis.

**Kontrak data demo (Rilis 0), `/public/data/`**

```
clusters.json    daftar kluster ditandai: id, timestep, jumlah node, skor tertinggi
graph-<id>.json  nodes: {id, timestep, score, band, features_top[{name, contribution}], pred_set}
                 edges: {source, target}
threshold.json   per timestep 35-49: ambang ACI, ambang statis, FPR ACI, FPR statis
meta.json        model_version, protokol evaluasi, tanggal ekspor
```

Ukuran total sebaiknya di bawah 1 MB agar demo cepat. Pilih 3 sampai 5 kluster yang bagus: satu menunjukkan pola pemecahan dana, satu sebelum dan sesudah t43, satu contoh alarm palsu.

**Draf kontrak API (Rilis 2)**

```
POST /v1/score      { chain, subject }  ->
                    { score, band, prediction_set, threshold, model_version, as_of,
                      explanation: [{feature, contribution}] }
POST /v1/feedback   { alert_id, verdict: "false_positive" | "confirmed" }
GET  /v1/alerts     ?status=unreviewed&since=...
GET  /v1/usage      kuota dan pemakaian
Webhook             ditandatangani HMAC, berisi hash dompet dan band, tanpa data sensitif
```

Catatan desain penting: sinyal `err_t` untuk ACI hanya datang dari alert yang sudah ditinjau, jadi skema data harus mencatat status tinjauan. Ambang ACI diberi batas atas (cap), seperti mitigasi manipulasi di proposal.

---

## 7. Jadwal

Hari ini Sabtu, 7 November 2026. Karena tes TOEFL jatuh pada 10 November, hari itu dianggap hanya buffer.

### Rilis 0: Situs pitch (7 sampai 10 November)

| Hari | Fokus | Ari (data/model) | Nur Hidayat (web/keamanan) | Ricca (UX/produk) |
|---|---|---|---|---|
| Sab 7 | Kunci keputusan dan fondasi | Ekspor data demo (clusters, graph, threshold, meta) dengan skrip yang bisa diulang | Repo, scaffold Next.js, CI, deploy awal, token desain dari design.md | Moodboard dari referensi, wireframe Beranda dan Penjelajah, draf copy |
| Min 8 | Bangun | Cek hasil ekspor, siapkan teks metodologi dan tabel hasil | Beranda: hero graf, bagian cara kerja | Review visual harian, finalisasi copy Beranda |
| Sen 9 | Bangun dan rapikan | Validasi angka di situs terhadap register klaim | Penjelajah (graf, penggeser, panel detail, tampilan daftar), halaman Metodologi | Uji alur dengan 2 sampai 3 orang di luar tim, catat kebingungan |
| Sel 10 | Buffer (TOEFL) | Hanya perbaikan kecil | Deploy final, header keamanan | Hanya perbaikan kecil |

**Feature freeze: Senin 9 November pukul 21.00.** Setelah itu hanya perbaikan bug dan konten. Fitur setengah jadi disembunyikan, bukan dipaksakan tampil.

Artefak cadangan wajib sebelum 11 November: rekaman layar demo 90 detik, ekspor situs statis yang bisa dibuka offline, dan salinan PDF proposal.

### Rilis 1: Hackathon (11 sampai 13 November)

Proposal menyebut tiga tahap (Explore & Define, Validate & Build, Pitch & Award). Saya asumsikan berurutan per hari. Sesuaikan dengan rundown resmi.

- Fokus: validasi dengan calon pengguna (bagian 9), bukan fitur baru. Perubahan hanya yang didorong temuan validasi.
- Siapkan skrip demo 3 menit: mulai dari hero, ke Penjelajah, buka kluster sebelum dan sesudah t43, jelaskan satu alasan SHAP, tandai satu alarm palsu, lalu tutup dengan Batas klaim.
- Siapkan jawaban untuk pertanyaan yang hampir pasti muncul: "Hasilnya dari Bitcoin, bagaimana dengan TRON?", "Apa buktinya fitur rezim berguna?", "Dari mana angka 2 sampai 4 minggu?". Jawaban jujur sudah tertulis di register klaim.

### Rilis 2: Alpha tertutup (14 November sampai sekitar 15 Desember)

| Minggu | Target |
|---|---|
| 14 sampai 22 Nov | Skeleton FastAPI, skema database, auth dan peran, layanan model dengan `model_version` |
| 23 sampai 29 Nov | Antrean alert, tombol tinjau (alarm palsu / terkonfirmasi) yang memperbarui keadaan ACI dengan cap, audit log append-only |
| 30 Nov sampai 6 Des | Kasus dan ekspor lembar kasus PDF, API key dan kuota, webhook HMAC, Bot Telegram non-sensitif |
| 7 sampai 15 Des | Halaman drift monitor (PSI/KS pada aliran demo), tinjauan keamanan, uji dengan 2 sampai 3 penguji undangan |

Sisakan minggu cadangan untuk ujian atau tugas kuliah. Sesuaikan dengan kalender akademik kalian.

### Rilis 3: Data nyata dan Demo Day (Desember 2026 sampai Januari 2027)

Ingestion TRON (USDT TRC-20) dan EVM, validasi pada data on-chain nyata dengan FPR dan recall terukur, uji integrasi API dengan mitra bursa, persiapan Demo Day dan Business Matching. Keputusan soal `/cek` publik diambil setelah validasi, bukan sebelumnya.

### Rilis 4: Inkubasi (Februari 2027 dan seterusnya)

Beta API untuk early adopter, penetapan harga berdasarkan hasil wawancara, keputusan hosting produksi dan klaim data residency.

---

## 8. Pembagian peran

Mengikuti Tabel 6 di proposal.

| Anggota | Tanggung jawab di proyek web |
|---|---|
| Muhammad Bazwa Arigusna | Ekspor data demo, layanan model (LightGBM, SHAP, ACI), skema alert dan umpan balik, integrasi ingestion, penjaga register klaim |
| Nur Hidayat Surya Pamungkas | Next.js, graf Penjelajah, FastAPI endpoint, auth, API key, webhook, keamanan dan tinjauan keamanan |
| Ricca Rahma Maulida | Sistem desain, wireframe, copy, wawancara pengguna, validasi bisnis dan kepatuhan |

Aturan kerja: satu pemilik per halaman, review desain singkat setiap hari saat Rilis 0, dan semua angka di situs diperiksa Ari terhadap register klaim sebelum deploy.

---

## 9. Validasi dengan calon pengguna (Fase 2)

Target: 5 wawancara singkat (15 menit) dengan compliance officer, analis, atau mahasiswa/dosen hukum dan keamanan siber jika akses ke praktisi terbatas.

Pertanyaan inti:

1. Bagaimana Anda saat ini menelusuri satu kasus dana kripto mencurigakan? Berapa lama dan dengan alat apa?
2. Apa yang membuat Anda percaya atau tidak percaya pada skor risiko dari sistem otomatis?
3. Apa yang harus ada pada lembar kasus agar bisa dipakai sebagai lampiran laporan?
4. Seberapa tinggi alarm palsu yang masih bisa Anda terima per hari?
5. Siapa yang memutuskan membeli alat seperti ini, dan apa yang mereka lihat pertama kali?

Hasil wawancara dipakai untuk memperbarui register klaim (terutama angka "2 sampai 4 minggu") dan menyusun ulang prioritas Rilis 2.

---

## 10. Keamanan dan kepatuhan

Ini produk keamanan siber, jadi situsnya sendiri harus bisa diperiksa juri.

- HTTPS, header keamanan (CSP, HSTS, X-Content-Type-Options, Referrer-Policy), tanpa skrip pihak ketiga yang tidak perlu.
- Validasi masukan alamat (format TRON: huruf T dan 34 karakter; EVM: 0x dan 40 heksadesimal) di sisi server.
- Rate limiting per API key dan per IP, kuota sesuai paket.
- Rahasia di variabel lingkungan, pemindaian dependensi, tidak ada kunci di repo.
- Audit log append-only untuk setiap tinjauan, ekspor, dan perubahan peran.
- Rilis 0 sampai 2 tidak menyimpan data pribadi selain email form akses. Beri catatan privasi singkat sesuai UU PDP.
- Alamat on-chain bersifat publik, tetapi pelabelannya tetap bisa merugikan orang. Setiap tampilan skor memuat keterangan bahwa skor bukan bukti bersalah.

---

## 11. Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Waktu 3 hari sebelum hackathon sangat sempit | Situs setengah jadi | Scope Rilis 0 dikunci, feature freeze 9 Nov, tanpa backend |
| Overclaim di depan juri | Kehilangan kredibilitas | Register klaim, halaman Batas klaim, jawaban pertanyaan sulit disiapkan |
| Jaringan venue buruk | Demo gagal | Data statis, versi offline, rekaman layar cadangan |
| Graf berat atau berantakan | Demo lambat, sulit dibaca | Batasi node per kluster, tampilkan bertahap, tampilan daftar |
| Lisensi data membatasi publikasi | Harus menarik data dari situs | Cek lisensi di hari pertama, siapkan opsi data sintetis |
| Satu orang menjadi hambatan (data atau web) | Terlambat | Kontrak JSON disepakati di hari pertama agar web dan data berjalan paralel |
| Beban kuliah dan tes saat Rilis 2 | Jadwal mundur | Minggu cadangan, potong fitur dari bawah (urutan potong: Telegram, drift page, ekspor PDF) |

---

## 12. Definition of done

**Rilis 0 dianggap selesai jika:**

- Situs terdeploy dengan HTTPS dan bisa dibuka di ponsel dan laptop.
- Hero dan Penjelajah bisa dipakai tanpa penjelasan dari kami.
- Setiap angka di situs ada di register klaim dan konsisten dengan PDF.
- Graf bisa dioperasikan lewat keyboard, dan tersedia tampilan daftar yang setara.
- Halaman Metodologi memuat protokol, tabel hasil, dan daftar yang belum terbukti.
- Versi offline dan rekaman cadangan sudah ada.
- Pengujian dengan minimal 2 orang di luar tim tidak menemukan kebingungan besar.

**Rilis 2 dianggap selesai jika:** alur "alert, tinjau, ambang diperbarui, tercatat di audit log" berjalan penuh dengan dua pengguna berbeda, API key dengan kuota berfungsi, dan tinjauan keamanan dasar sudah dilakukan.

---

## 13. Keputusan terbuka (perlu jawaban tim)

1. Domain dan nama proyek di repositori. Apakah memakai "TELUSUR" apa adanya?
2. Pilihan auth (Auth.js atau Supabase) untuk Rilis 2.
3. Apakah ada rundown resmi per hari untuk 11 sampai 13 November? Jadwal Rilis 1 menunggu itu.
4. Siapa yang menulis copy final dan memeriksa angkanya terhadap register klaim.
5. Hasil pengecekan lisensi Elliptic/Elliptic++, IBM AML, dan dataset Kaggle Ethereum.
6. Apakah Elliptic++ memuat alamat yang bisa dicari. Jawabannya menentukan apakah Penjelajah bisa mendukung pencarian alamat.
