# TELUSUR Web: Panduan Desain

Draf 1, 7 November 2026. Pasangan dari `pengerjaan.md`. Bahasa antarmuka: Indonesia.

---

## 1. Ringkasan arah

**Subjek.** Sistem forensik on-chain: menelusuri dana kripto yang dipecah ke banyak dompet, menandai titik pencairannya, dan menjelaskan alasan setiap penandaan.

**Pengguna utama.** Penyidik, auditor, dan compliance officer yang membaca graf berjam-jam dan harus bisa mempertanggungjawabkan temuan di laporan atau pengadilan. Sekunder: juri hackathon dan calon mitra yang menilai dalam hitungan menit.

**Tugas utama desain.** Membuat orang paham dalam beberapa detik bahwa dana yang tampak tersebar ternyata bermuara ke satu titik, lalu memberi mereka alat untuk memeriksanya sendiri.

**Kesan yang dituju.** Tenang, presisi, bisa dipercaya. Seperti meja kerja penyidik yang rapi, bukan pusat komando fiksi ilmiah.

**Bukan yang dituju.** Estetika "crypto" (neon di atas hitam, gradien ungu, hologram), maskot, ilustrasi 3D, dan kata-kata seperti revolusioner atau canggih.

**Prinsip.**

1. Satu hal yang berkesan: graf penelusuran yang bisa dioperasikan. Sisanya tenang.
2. Struktur visual membawa informasi (garis, nomor, label hanya jika punya arti).
3. Kejujuran adalah gaya: batas klaim tampil sebagai bagian desain, bukan catatan kaki.
4. Warna bermakna. Oranye hanya untuk "yang ditandai". Tidak ada oranye dekoratif.
5. Setiap hal yang dapat diklik di graf punya padanan yang bisa dijangkau keyboard dan pembaca layar.

---

## 2. Referensi

Saya memeriksa dua referensi pertama pada sesi ini lewat dokumentasi dan sumber publik. Sisanya berasal dari pengetahuan umum saya dan belum saya buka ulang sekarang. Buka dan screenshot semuanya sebelum Ricca memakainya sebagai acuan. Kita mengambil prinsipnya, bukan menyalin tampilannya.

| Referensi | Yang diambil | Yang dihindari | Status |
|---|---|---|---|
| Arkham Visualizer | Manipulasi langsung (geser node, perluas node), filter waktu di bagian bawah layar dengan volume transaksi, garis berwarna untuk arah aliran, hover pada garis menampilkan nilai | Graf yang menjadi sesak dan membingungkan pada aktivitas tinggi, jadi kita membatasi jumlah node dan membuka bertahap | Diperiksa (dokumentasi dan ulasan) |
| Chainalysis Reactor | Alur kerja dari lead sampai tindakan, anotasi di dalam graf, keluaran "siap pengadilan" yang bisa diekspor | Antarmuka padat yang butuh pelatihan. Kita ingin bisa dipakai tanpa pelatihan | Diperiksa (deskripsi produk) |
| Linear (situs produk) | Produk nyata sebagai hero, tipografi yang tertib, keputusan tata letak yang tegas | Tema gelap dengan gradien sebagai default | Dari pengetahuan umum |
| Stripe Docs | Dokumentasi dua kolom dengan contoh kode yang bisa disalin, alur API key yang jelas | Animasi gradien dekoratif | Dari pengetahuan umum |
| The Pudding dan Our World in Data | Narasi data bergulir (scrollytelling), label langsung pada garis (tanpa legenda terpisah), anotasi pada titik penting | Efek bergulir yang menyembunyikan konten | Dari pengetahuan umum |
| Etherscan / Tronscan | Konvensi tampilan hash: potong di tengah, tombol salin, tab yang akrab bagi analis | Kepadatan tampilan dan banner iklan | Dari pengetahuan umum |

---

## 3. Konsep

**"Meja kasus."** Latar kertas dingin yang terang, tinta navy, satu warna sinyal. Ruang kerja digambarkan sebagai lembar kasus: bersih, bisa dicetak, bisa diekspor. Pilihan terang disengaja. Audiensnya membaca dokumen, dan hasil ekspornya berupa lembar kasus putih yang harus terlihat sama dengan layarnya. Mode gelap menyusul untuk dasbor (Rilis 2) karena sesi analis panjang.

Kita menghindari kombinasi yang sudah menjadi kebiasaan desain buatan AI: krem dengan serif kontras tinggi dan aksen terakota, hitam dengan satu aksen hijau asam, tata letak koran dengan garis rambut, dan kumpulan kartu bulat identik dengan bayangan abu-abu yang sama.

---

## 4. Token desain

### 4.1 Warna

| Nama | Hex | Peran | Kontras terhadap `kertas` |
|---|---|---|---|
| kertas | `#F4F6F8` | Latar halaman | (dasar) |
| putih | `#FFFFFF` | Permukaan panel dan tabel | |
| tinta | `#10233F` | Teks utama, node sumber dan perantara, tombol utama | 14,5:1 |
| tinta-redup | `#4A5A70` | Teks sekunder | 6,5:1 |
| rute | `#7A8799` | Garis aliran, batas komponen yang penting | 3,4:1 (untuk grafik non-teks) |
| garis | `#D5DBE3` | Pemisah dekoratif (bukan batas yang wajib terlihat) | 1,3:1 |
| teal | `#0F7C86` | Aliran yang terpetakan, tautan, fokus. Teks kecil pakai `teal-tua` | 4,6:1 |
| teal-tua | `#0B646D` | Teks tautan, teks pada latar terang | 6,3:1 |
| sinyal | `#E8761E` | Hanya untuk yang ditandai: titik pencairan, node terpilih, ambang | 2,8:1 (hanya grafik berlabel, jangan untuk teks) |
| sinyal-teks | `#B5500A` | Teks yang perlu berwarna sinyal | 4,7:1 |
| bahaya | `#C23B2E` | Skor sangat tinggi, aksi destruktif | 4,9:1 |

Rasio kontras dihitung dari nilai hex di atas. Teks di atas isian `tinta`, `teal`, dan `sinyal-teks` memakai putih (15,7 / 4,9 / 5,1). Teks di atas isian `sinyal` memakai `tinta` (5,3).

Aturan pemakaian:

- Latar halaman `kertas`, permukaan kerja `putih`. Hindari lapisan abu-abu bertingkat.
- `sinyal` tidak pernah dipakai sebagai hiasan, tombol, atau garis bawah. Kalau oranye muncul, pengguna belajar bahwa itu berarti "perhatikan ini".
- Warna tidak pernah menjadi satu-satunya pembeda. Pasangkan dengan bentuk dan label (bagian 5.2).

### 4.2 Tipografi

| Peran | Keluarga | Alasan |
|---|---|---|
| Judul dan teks naratif panjang | **Literata** (variabel, sumbu opsikal) | Serif untuk keterbacaan dengan kesan dokumen resmi, tidak sama dengan serif yang sering dipakai pada desain generik. Dipakai pada bobot 500 sampai 600 |
| Antarmuka, tabel, badan teks pendek | **Atkinson Hyperlegible Next** | Dirancang agar huruf yang mirip mudah dibedakan. Relevan di produk yang pekerjaannya membaca hash dan alamat |
| Hash dan alamat dompet | **Atkinson Hyperlegible Mono** | Mono hanya dipakai di tempat monospasi memang berfungsi: membandingkan karakter demi karakter |

Verifikasi ketersediaan kedua keluarga Atkinson di Google Fonts sebelum dipakai. Cadangan: Public Sans untuk antarmuka dan Source Code Pro untuk hash.

Skala (basis 16 px, rasio sekitar 1,25):

| Token | Ukuran | Pemakaian |
|---|---|---|
| teks-kecil | 13 px | Keterangan, catatan sumber |
| teks-ui | 15 px | Antarmuka, tabel |
| teks-isi | 18 px | Paragraf naratif (Literata) |
| judul-4 | 22 px | Subjudul |
| judul-3 | 28 px | |
| judul-2 | `clamp(32px, 4vw, 44px)` | Judul bagian |
| judul-1 | `clamp(40px, 6vw, 64px)` | Hero |

Aturan:

- Panjang baris maksimal 68 karakter untuk teks naratif. Tinggi baris: 1,6 untuk Literata, 1,5 untuk Atkinson.
- Rata kiri di semua tempat. Tidak ada paragraf rata tengah.
- Angka pada tabel memakai `font-variant-numeric: tabular-nums`.
- Hindari tiga kebiasaan generik: satu kata di judul diberi warna atau miring, label HURUF KAPITAL di atas setiap judul, dan label kecil yang tidak perlu. Judul ditulis sebagai kalimat utuh.
- Spasi huruf sedikit merapat (-0,01em) hanya pada judul besar.

### 4.3 Jarak, radius, elevasi

- Skala jarak 4 px: 4, 8, 12, 16, 24, 32, 48, 72, 112.
- Radius mengikuti peran, bukan satu nilai untuk semuanya: input dan tombol 6 px, panel samping 12 px, chip 999 px, node graf lingkaran penuh, tabel tanpa radius dengan garis antarbaris.
- Tanpa bayangan pada panel dan blok konten. Pemisahan lewat jarak dan batas `rute` yang tipis. Bayangan hanya untuk elemen yang melayang (tooltip, menu): `0 4px 16px rgba(16,35,63,0.12)`.
- Grid 12 kolom, lebar konten maksimal 1200 px. Kanvas graf boleh melebar sampai 1440 px.

---

## 5. Elemen yang berkesan: graf penelusuran

Satu-satunya tempat kita berani. Ini adalah Gambar 1 proposal yang bisa dioperasikan.

### 5.1 Perilaku di hero

Susunan kiri ke kanan: sumber (S), pemecahan ke perantara (M1 sampai M4), rantai pengelupasan (P1 sampai P4), titik pencairan (AGG). Satu node normal (P5) bercabang keluar tanpa terseret.

1. Saat halaman dimuat, hanya node S yang terlihat. Satu tombol di dekatnya: **Lacak aliran dana**.
2. Saat ditekan, garis tumbuh dari S ke M, ke P, lalu bermuara ke AGG. Total sekitar 2,4 detik, sekali saja.
3. AGG berubah menjadi oranye (`sinyal`) dan label muncul: "Titik pencairan, skor 0,94".
4. Setelah itu graf diam dan sepenuhnya bisa dioperasikan: geser node, arahkan kursor ke node untuk melihat skor dan tiga alasan teratas, klik AGG untuk membuka panel detail.
5. Node P5 menunjukkan skor 0,12 dan tidak ikut diwarnai. Ini menunjukkan bahwa transaksi normal tidak ikut dicurigai.

Label tetap di dekat graf: "Data ilustrasi, bukan kasus nyata." Data nyata ada di Penjelajah.

Pengguna yang memilih mengurangi animasi langsung melihat keadaan akhir tanpa animasi.

### 5.2 Penyandian visual node dan garis

Setiap status dibedakan oleh warna, bentuk, dan label, agar terbaca oleh pengguna buta warna dan saat dicetak hitam-putih.

| Status | Warna | Bentuk | Label |
|---|---|---|---|
| Sumber | `tinta` | Lingkaran isi | "Sumber" |
| Perantara dan rantai | `teal` | Lingkaran isi | |
| Normal (skor rendah) | `putih` dengan batas `rute` | Lingkaran kosong | |
| Titik pencairan | `sinyal` | Belah ketupat | "Titik pencairan" |
| Terpilih | Cincin luar `sinyal` | Cincin | |
| Skor sangat tinggi | `bahaya` | Segi enam | "Sangat tinggi" |
| Alarm palsu (sudah ditinjau) | `rute` | Lingkaran dengan garis diagonal | "Alarm palsu" |

Garis aliran inti: lurus tebal berwarna `tinta`. Garis penyamaran berlapis: putus-putus berwarna `rute`, sesuai Gambar 1.

### 5.3 Penjelasan alasan (SHAP) di panel detail

Bar horizontal berpusat di nol. Fitur yang menaikkan skor ke kanan (`sinyal-teks`), yang menurunkan ke kiri (`teal-tua`). Nama fitur ditulis dengan bahasa biasa ("Dana langsung diteruskan ke banyak dompet"), dengan nama teknis tampil saat kursor diarahkan. Maksimal lima baris, tombol "Lihat semua fitur" untuk selebihnya.

### 5.4 Penggeser waktu (Penjelajah)

Mengikuti pola Arkham: bilah di bagian bawah kanvas dengan histogram volume per timestep (t35 sampai t49). Dua garis ambang: ambang statis (putus-putus `rute`) dan ambang yang menyesuaikan diri (`sinyal`). Penanda vertikal pada t43 dengan label "Penutupan dark market". Menggeser penanda memperbarui graf dengan transisi posisi 240 ms.

### 5.5 Tampilan daftar (setara aksesibel)

Tombol di pojok kanan atas kanvas: **Graf** dan **Daftar**. Tampilan daftar adalah tabel node dan hubungan dengan kolom yang sama, bisa diurutkan, dan dapat dinavigasi keyboard. Ini juga tampilan utama di ponsel (bagian 9).

---

## 6. Tata letak per halaman

### 6.1 Beranda

```
┌──────────────────────────────────────────────────────────────┐
│ TELUSUR            Penjelajah  Metodologi  Dokumentasi  Masuk│
├──────────────────────────────────────────────────────────────┤
│  Dana yang dipecah ke ratusan dompet                         │
│  masih bermuara ke satu pintu keluar.                        │
│                                                              │
│  TELUSUR menandai alirannya, menunjukkan alasannya,          │
│  dan menyerahkan keputusan penahanan ke manusia.             │
│  [Coba penjelajah demo]   Baca batas klaim kami              │
│                                                              │
│ ┌────────────────── kanvas graf (lebar penuh) ─────────────┐ │
│ │  (S)──▶(M1)┄┄▶(P1)──▶                                    │ │
│ │     ──▶(M2)┄┄▶(P2)──▶  ◆ Titik pencairan, skor 0,94      │ │
│ │     ──▶(M3)┄┄▶(P3)──▶                                    │ │
│ │     ──▶(M4)┄┄▶(P4)──▶                                    │ │
│ │          [Lacak aliran dana]     Data ilustrasi          │ │
│ └──────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│ Cara kerja: lima tahap berurutan (bernomor, karena memang    │
│ urutan), dengan panah umpan balik dari tahap 5 ke tahap 3    │
├──────────────────────────────────────────────────────────────┤
│ Hasil uji: bagan ambang (Gambar 5) + tabel metrik biasa      │
├──────────────────────────────────────────────────────────────┤
│ Siapa yang memakainya: tiga baris, satu per peran            │
├──────────────────────────────────────────────────────────────┤
│ Yang belum kami buktikan: daftar jujur dengan status         │
├──────────────────────────────────────────────────────────────┤
│ Minta akses awal: email, institusi, peran                    │
└──────────────────────────────────────────────────────────────┘
```

Perataan: semua rata kiri. Judul hero di sisi kiri dengan lebar sekitar 7 kolom. Kanvas graf melebar penuh di bawahnya.

Detail bagian:

- **Cara kerja.** Lima tahap sebagai garis horizontal. Penomoran 1 sampai 5 dipakai karena isinya memang urutan. Panah melengkung dari tahap 5 kembali ke tahap 3, diberi label "umpan balik analis memperbarui ambang".
- **Hasil uji.** Bagan Gambar 5 yang dirancang ulang (bagian 7): dua panel, ambang di atas dan FPR di bawah, penanda pergeseran rezim di t43, label langsung pada garis. Di bawahnya tabel biasa untuk metrik, tanpa blok angka raksasa, dengan baris protokol: "Elliptic (Bitcoin), pembagian temporal t1 sampai t34 / t35 sampai t49, rata-rata 5 seed."
- **Siapa yang memakainya.** Tiga baris dengan tata letak dua kolom (peran di kiri, tugasnya di kanan), bukan tiga kartu identik: penyidik dan auditor, tim kepatuhan bursa, masyarakat umum (yang terakhir diberi lencana "Segera" sampai gerbang validasi lulus).
- **Yang belum kami buktikan.** Daftar sederhana dengan status: belum diuji pada TRON/EVM, fitur konteks rezim belum terbukti di Elliptic, pemantau drift belum dievaluasi, sekitar 1 dari 4 transaksi ilegal tidak tertangkap pada uji. Ini bagian pembeda, bukan formalitas.

### 6.2 Penjelajah (`/jelajah`)

```
┌───────────────────────────────────────────────────────────────────┐
│ TELUSUR   Penjelajah  Metodologi  Dokumentasi              Masuk  │
├──────────────┬─────────────────────────────────────┬──────────────┤
│ Kluster      │ [Cari ID node]       [Graf | Daftar]│ Detail node  │
│ ditandai     │                                     │ Skor 0,94    │
│              │        kanvas graf                  │ Sangat tinggi│
│ 1  t38  14   │                                     │ Himpunan     │
│ 2  t43  23   │                                     │ prediksi: ...│
│ 3  t46   9   │                                     │              │
│ (urut skor)  │                                     │ Alasan       │
│              │                                     │ ▕███ ▏ ...   │
│              │                                     │              │
│              │                                     │ [Tandai      │
│              │                                     │  alarm palsu]│
│              │                                     │ [Tambah ke   │
│              │                                     │  kasus]      │
│              │                                     │ [Unduh lembar│
│              │                                     │  kasus (PDF)]│
├──────────────┴─────────────────────────────────────┴──────────────┤
│ t35 ▁▂▂▃▃▄▃▃▂▅▇▅▃▂▂ t49   ambang ─ ─ statis   ─── menyesuaikan    │
│                     ▲ t43 Penutupan dark market                   │
└───────────────────────────────────────────────────────────────────┘
```

- Lebar kolom: rel kiri 280 px, panel kanan 340 px, kanvas mengisi sisanya.
- Spanduk tetap di atas kanvas: "Mode demo: data Elliptic (Bitcoin). Skor tidak berlaku untuk TRON/EVM."
- Di Rilis 0, tombol "Tandai alarm palsu" bekerja secara lokal di sesi (untuk memperagakan alurnya) dan teksnya menyatakan itu. Di Rilis 2 tombol ini menulis ke sistem dan memperbarui ambang.
- Lembar kasus PDF: putih, satu halaman, memuat graf, skor, alasan, protokol model, `model_version`, tanggal, dan pernyataan "skor bukan bukti bersalah".

### 6.3 Dasbor (`/app`, Rilis 2)

Tabel antrean tinjauan sebagai pusat. Satu kalimat ringkasan di atasnya (bukan deretan kartu angka): "12 alert belum ditinjau. Ambang saat ini 0,34."

Kolom: waktu, hash dompet (mono, dipotong di tengah, tombol salin), band risiko, alasan utama, status, aksi. Status: Belum ditinjau, Alarm palsu, Terkonfirmasi. Baris dapat dibuka ke graf. Pengaturan (webhook, Telegram, API key dengan kuota, audit log) berada di navigasi samping yang tenang. Mode gelap tersedia di sini.

### 6.4 Metodologi (`/metodologi`)

Halaman dokumen: Literata, satu kolom 68 karakter, daftar isi tetap di kiri. Memuat protokol evaluasi, tabel hasil lengkap (Tabel 3 dan 4 proposal), formula pembaruan ACI dengan penjelasan satu kalimat, dan versi publik register klaim. Tidak ada animasi.

### 6.5 Dokumentasi API (`/docs`, Rilis 2)

Dua kolom a la dokumentasi: penjelasan di kiri, contoh permintaan dan respons di kanan dengan tombol salin. Awali dengan "Dapatkan API key" dan satu contoh `POST /v1/score` yang bisa dijalankan.

### 6.6 Cek dompet (`/cek`, Rilis 3, bersyarat)

Satu kolom input alamat dan hasil. Hasil memuat band risiko, alasan, dan keterangan yang tegas bahwa ini skor bukan vonis. Dirancang hanya jika gerbang validasi lulus.

---

## 7. Visualisasi data

- Label langsung pada garis dan batang, tanpa legenda terpisah bila memungkinkan.
- Satu warna sinyal per bagan, dipakai untuk hal yang jadi pokok cerita.
- Sumbu bernama jelas dengan satuan. Skala logaritmik diberi label tegas (FPR pada Gambar 3 proposal).
- **Bagan ambang ACI (Gambar 5) dirancang ulang.** Latar oranye penuh pada proposal diganti pita tipis dengan label "Pergeseran rezim (penutupan dark market)". Titik FPR yang melewati 2% (t44, t49) diberi penanda dan anotasi, karena kendali ACI berlaku sebagai rata-rata jangka panjang, bukan jaminan per timestep.
- Setiap bagan diberi teks alternatif yang menyatakan temuan utamanya, dan tersedia tabel datanya.
- Tidak memakai Chart.js bawaan. Pakai Observable Plot atau visx dengan token di atas.

---

## 8. Komponen dan gerak

### 8.1 Komponen

- **Tombol utama:** isi `tinta`, teks putih, radius 6 px, tinggi minimal 44 px. **Tombol sekunder:** batas `rute`, isi transparan. Tidak ada tombol berwarna `sinyal`.
- **Tombol aksi di graf** ("Tandai alarm palsu") berupa tombol sekunder, bukan merah. Tidak ada tombol "Bekukan". Tindakan lanjutan hanya "Tambah ke kasus", sesuai prinsip verifikasi manusia.
- **Chip band risiko:** Rendah, Sedang, Tinggi, Sangat tinggi, masing-masing dengan ikon bentuk dan teks, bukan hanya warna.
- **Tampilan hash:** `TXyz4…9aF2` (potong di tengah), mono, tombol salin dengan konfirmasi "Hash disalin".
- **Input alamat:** menampilkan format yang diterima sebagai petunjuk. Contoh galat: "Alamat tidak valid. Alamat TRON diawali T dan terdiri atas 34 karakter."
- **Tooltip:** muncul saat fokus keyboard juga, bukan hanya hover.
- Hindari kumpulan kartu identik. Gunakan baris, tabel, dan kolom sesuai isi.

### 8.2 Gerak

Satu momen terorkestrasi: pembentukan graf di hero (bagian 5.1). Selebihnya gerak hanya sebagai respons terhadap tindakan pengguna: panel samping muncul 180 ms, node membesar tipis saat disorot 120 ms, graf berpindah posisi 240 ms saat penggeser digeser, toast muncul setelah aksi.

Tidak ada: animasi geser-naik pada tiap bagian saat bergulir, efek hover pada setiap kartu, paralaks, partikel latar.

`prefers-reduced-motion`: lewati animasi hero dan tampilkan keadaan akhir, ganti transisi menjadi perubahan langsung.

---

## 9. Aksesibilitas dan responsif

- Kontras teks minimal 4,5:1 dan elemen non-teks 3:1 (lihat tabel warna). Oranye `sinyal` tidak dipakai untuk teks.
- Fokus keyboard selalu terlihat: cincin 2 px `teal-tua` dengan jarak 2 px.
- Graf: setiap node dapat difokuskan, dapat dijelajahi dengan panah, dan punya nama aksesibel ("Node M2, skor 0,41, rendah"). Tampilan daftar adalah jalur setara untuk semua tugas.
- Target sentuh minimal 44 px.
- Ponsel: hero menampilkan graf yang disederhanakan (susunan vertikal, tetap bisa disentuh). Penjelajah di ponsel mengutamakan tampilan Daftar dengan panel detail sebagai laci bawah. Penggeser waktu di atas daftar.
- Semua bagan punya teks alternatif dan tabel data.
- Bahasa dokumen `lang="id"`.

---

## 10. Copy dan nada

Aturan: kalimat biasa, kata kerja aktif, huruf kapital hanya di awal kalimat. Menamai hal dengan istilah yang dipahami pengguna, bukan istilah sistem. Tombol menyebut persis apa yang terjadi dan nama aksinya konsisten di seluruh alur.

| Konteks | Tulis | Hindari |
|---|---|---|
| Tombol utama beranda | Coba penjelajah demo | Mulai sekarang, Jelajahi solusi |
| Tombol hero | Lacak aliran dana | Aktifkan AI |
| Aksi tinjauan | Tandai alarm palsu | Kirim |
| Toast setelah aksi | Ditandai sebagai alarm palsu. Ambang diperbarui pada pemrosesan berikutnya. | Berhasil! |
| Status kosong | Belum ada alert yang perlu ditinjau. Alert baru muncul di sini saat skor melewati ambang. | Tidak ada data |
| Galat input | Alamat tidak valid. Alamat TRON diawali T dan terdiri atas 34 karakter. | Terjadi kesalahan |
| Hasil skor | Ditandai untuk ditinjau. Skor risiko bukan bukti bersalah. | Pelaku pencucian uang |
| Istilah teknis | "Ambang menyesuaikan diri" dengan tooltip "Adaptive Conformal Inference" | ACI di tubuh antarmuka tanpa penjelasan |
| Jaringan belum didukung | TRON dan EVM segera hadir. Skor saat ini hanya untuk data demo Bitcoin. | Coming soon |

Kata yang tidak dipakai: revolusioner, canggih, terdepan, powered by AI, seamless, solusi menyeluruh.

Judul hero diambil dari temuan nyata di Gambar 1 proposal, bukan slogan umum.

---

## 11. Implementasi

### 11.1 Token CSS

```css
:root {
  --kertas: #F4F6F8;
  --putih: #FFFFFF;
  --tinta: #10233F;
  --tinta-redup: #4A5A70;
  --rute: #7A8799;
  --garis: #D5DBE3;
  --teal: #0F7C86;
  --teal-tua: #0B646D;
  --sinyal: #E8761E;
  --sinyal-teks: #B5500A;
  --bahaya: #C23B2E;

  --font-judul: "Literata", Georgia, serif;
  --font-ui: "Atkinson Hyperlegible Next", "Public Sans", system-ui, sans-serif;
  --font-mono: "Atkinson Hyperlegible Mono", "Source Code Pro", ui-monospace, monospace;

  --r-kontrol: 6px;
  --r-panel: 12px;
  --r-chip: 999px;
}

:focus-visible { outline: 2px solid var(--teal-tua); outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

### 11.2 Catatan teknis

- Muat font dengan `font-display: swap` dan subset Latin. Pratinjau `preload` untuk Literata judul dan Atkinson reguler.
- Hero: SVG dengan koordinat manual, dianimasikan memakai `stroke-dashoffset` dan WAAPI. Tidak perlu pustaka animasi besar.
- Penjelajah: Sigma.js dengan graphology, batasi node per kluster, muat kluster saat dipilih.
- Ekspor lembar kasus: render sisi klien (mis. dari SVG dan HTML cetak) agar tetap jalan offline di Rilis 0.
- Gambar sosial (OG): satu tangkapan hero graf, bukan ilustrasi.

### 11.3 Logo

Wordmark "TELUSUR" dalam Literata semibold, tanpa efek. Tanda kecil opsional: satu garis yang terpecah menjadi beberapa lalu menyatu kembali pada satu titik oranye, mengulang bentuk graf. Tampil monokrom `tinta` di semua tempat kecuali titik oranye.

---

## 12. Catatan revisi dan daftar periksa anti-klise

Draf pertama saya ditinjau terhadap brief sebelum ditulis ulang. Yang berubah:

1. **Tema gelap bernuansa siber dengan aksen neon teal** diganti kertas dingin yang terang. Alasannya: audiens membaca dokumen, ekspor kasus berupa lembar putih, dan hitam dengan aksen terang adalah bawaan umum situs kripto.
2. **Tiga kartu fitur identik** diganti baris dua kolom, tabel, dan alur bernomor hanya di tempat yang memang urutan.
3. **Blok angka besar (F1, FPR) dengan gradien** diganti tabel biasa dengan baris protokol, karena angka tanpa protokol justru membuka celah overclaim. Hero dibuka dengan graf yang bisa dioperasikan.
4. **Serif display yang sering dipakai** (mis. Playfair, Fraunces) diganti Literata, dipasangkan dengan Atkinson yang dipilih karena keterbedaan hurufnya pada hash.
5. **Label huruf kapital di atas judul dan mono di label kecil** dihapus. Mono hanya untuk hash dan alamat.

Daftar periksa sebelum rilis:

- [ ] Oranye hanya muncul pada hal yang ditandai.
- [ ] Tidak ada tiga kartu atau lebih dengan radius dan bayangan yang sama.
- [ ] Tidak ada label huruf kapital di atas judul, tidak ada tanda panah di akhir tombol, tidak ada teks "A · B · C" dengan titik tengah.
- [ ] Judul tidak memberi aksen pada satu kata saja.
- [ ] Hanya satu animasi yang berjalan sendiri (hero), dan ia dimatikan oleh `prefers-reduced-motion`.
- [ ] Setiap angka ada di register klaim di `pengerjaan.md`.
- [ ] Data ilustrasi dan data nyata diberi label berbeda.
- [ ] Graf bisa dipakai lewat keyboard, dan tampilan daftar setara.
- [ ] Kontras dan fokus diperiksa. Semua teks lulus 4,5:1.
- [ ] Tidak ada kata dari daftar kata terlarang.
- [ ] Dicoba di ponsel nyata dan jaringan lambat.
