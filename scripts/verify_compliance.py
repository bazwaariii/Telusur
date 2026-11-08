#!/usr/bin/env python3
"""
Verifikasi otomatis kepatuhan kode sumber TELUSUR terhadap standar produksi final.
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "src"
DATA_DIR = ROOT / "public" / "data"

FORBIDDEN_PHRASES = [
  "revolusioner",
  "canggih",
  "terdepan",
  "powered by ai",
  "seamless",
  "solusi menyeluruh",
  "mulai sekarang",
  "jelajahi solusi",
  "aktifkan ai",
  "berhasil!",
  "tidak ada data",
  "terjadi kesalahan",
  "pelaku pencucian uang",
  "coming soon",
  "text-transform: uppercase",
  "&middot;",
  " · ",
  "—",
  "&mdash;",
  "seno hackathon",
  "nur hidayat",
  "ricca rahma",
  "dalam penyusunan",
  "segera hadir",
  "dirancang, belum dievaluasi",
]

REQUIRED_PHRASES = [
  "Dana yang dipecah ke ratusan dompet masih bermuara ke satu pintu keluar.",
  "TELUSUR menandai alirannya, menunjukkan alasannya, dan menyerahkan keputusan penahanan ke manusia.",
  "Coba penjelajah demo",
  "Lacak aliran dana",
  "Data ilustrasi, bukan kasus nyata.",
  "Mode demo: data Elliptic (Bitcoin). Skor tidak berlaku untuk TRON/EVM.",
  "Tandai alarm palsu",
  "Ditandai sebagai alarm palsu. Ambang diperbarui pada pemrosesan berikutnya.",
  "Belum ada alert yang perlu ditinjau. Alert baru muncul di sini saat skor melewati ambang.",
  "Alamat tidak valid. Alamat TRON diawali T dan terdiri atas 34 karakter.",
  "Ditandai untuk ditinjau. Skor risiko bukan bukti bersalah.",
  "Muhammad Bazwa Arigusna",
]


def main():
  errors = []

  # 1. Periksa berkas JSON data demo dan ukuran total (< 1 MB)
  expected_json = [
    "clusters.json",
    "threshold.json",
    "meta.json",
    "graph-kluster-t43-23.json",
    "graph-kluster-t38-14.json",
    "graph-kluster-t46-09.json",
    "graph-kluster-t41-11.json",
  ]
  total_bytes = 0
  for fname in expected_json:
    fpath = DATA_DIR / fname
    if not fpath.exists():
      errors.append(f"Berkas data demo tidak ditemukan: {fpath}")
    else:
      total_bytes += fpath.stat().st_size

  if total_bytes >= 1_000_000:
    errors.append(f"Ukuran data demo melebihi 1 MB: {total_bytes} byte")

  # 2. Gabungkan seluruh berkas sumber di src/
  all_source_files = (
    list(SRC_DIR.rglob("*.tsx"))
    + list(SRC_DIR.rglob("*.ts"))
    + list(SRC_DIR.rglob("*.css"))
  )
  combined_text = ""
  for sf in all_source_files:
    text = sf.read_text(encoding="utf-8")
    combined_text += "\n" + text
    lower_text = text.lower()
    for bad in FORBIDDEN_PHRASES:
      if bad in lower_text:
        errors.append(
          f"Kata/pola terlarang '{bad}' ditemukan di {sf.relative_to(ROOT)}"
        )

  # 3. Pastikan semua kalimat wajib tersedia
  for req in REQUIRED_PHRASES:
    if req not in combined_text:
      errors.append(f"Kalimat wajib tidak ditemukan di src/: '{req}'")

  if errors:
    print("GAGAL VERIFIKASI:")
    for e in errors:
      print(" -", e)
    sys.exit(1)

  print(
    f"LULUS VERIFIKASI: {len(all_source_files)} berkas sumber diperiksa, ukuran data demo {total_bytes / 1024:.1f} KB (< 1 MB), 0 kata/simbol terlarang, seluruh fitur produksi dan atribusi Muhammad Bazwa Arigusna terpenuhi."
  )


if __name__ == "__main__":
  main()
