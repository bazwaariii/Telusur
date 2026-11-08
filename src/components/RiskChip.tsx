import React from "react";
import { NodeStatus, RiskBand } from "@/lib/demo-data";

interface RiskChipProps {
  band: RiskBand;
  status?: NodeStatus;
}

export function RiskChip({ band, status }: RiskChipProps) {
  if (status === "alarm_palsu") {
    return (
      <span className="chip-risiko rendah" title="Sudah ditinjau analis sebagai alarm palsu">
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="2.8" y1="9.2" x2="9.2" y2="2.8" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span>Alarm palsu</span>
      </span>
    );
  }

  if (band === "Sangat tinggi" || status === "sangat_tinggi") {
    return (
      <span className="chip-risiko sangat-tinggi">
        {/* Segi enam untuk Sangat tinggi sesuai design.md Bagian 5.2 */}
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <polygon
            points="6,1 10.5,3.5 10.5,8.5 6,11 1.5,8.5 1.5,3.5"
            fill="currentColor"
          />
        </svg>
        <span>Sangat tinggi</span>
      </span>
    );
  }

  if (band === "Tinggi" || status === "titik_pencairan") {
    return (
      <span className="chip-risiko tinggi">
        {/* Belah ketupat untuk Tinggi / Titik pencairan sesuai design.md Bagian 5.2 */}
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <polygon points="6,1 11,6 6,11 1,6" fill="currentColor" />
        </svg>
        <span>{status === "titik_pencairan" ? "Titik pencairan" : "Tinggi"}</span>
      </span>
    );
  }

  if (band === "Sedang") {
    return (
      <span className="chip-risiko sedang">
        {/* Lingkaran isi untuk perantara / sedang */}
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <circle cx="6" cy="6" r="4.5" fill="currentColor" />
        </svg>
        <span>Sedang</span>
      </span>
    );
  }

  return (
    <span className="chip-risiko rendah">
      {/* Lingkaran kosong untuk normal / rendah */}
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        <circle cx="6" cy="6" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <span>Rendah</span>
    </span>
  );
}

