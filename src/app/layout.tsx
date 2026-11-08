import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "TELUSUR: Sistem Forensik On-Chain dan Penelusuran Titik Pencairan",
  description:
    "Dana yang dipecah ke ratusan dompet masih bermuara ke satu pintu keluar. TELUSUR menandai alirannya, menunjukkan alasannya, dan menyerahkan keputusan penahanan ke manusia.",
  openGraph: {
    title: "TELUSUR: Sistem Forensik On-Chain",
    description:
      "Menelusuri dana kripto yang dipecah ke banyak dompet, menandai titik pencairannya, dan menjelaskan alasan setiap penandaan.",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono:wght@400;600&family=Atkinson+Hyperlegible+Next:wght@400;500;600;700&family=Literata:opsz,wght@7..72,500;7..72,600;7..72,700&display=swap"
        />
      </head>
      <body>
        <a href="#konten-utama" className="skip-link">
          Lewati ke konten utama
        </a>
        <Navbar />
        <main id="konten-utama" style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
