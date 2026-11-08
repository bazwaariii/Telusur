"use client";

import React, { useState } from "react";
import { THRESHOLD_DATA, TimestepRow } from "@/lib/demo-data";

export function AciThresholdChart() {
  const [showDataTable, setShowDataTable] = useState(false);
  const [activeStep, setActiveStep] = useState<TimestepRow | null>(null);
  const [showAciTooltip, setShowAciTooltip] = useState(false);

  const rows = THRESHOLD_DATA.timesteps;
  const width = 940;
  const padLeft = 64;
  const padRight = 210;
  const plotW = width - padLeft - padRight;

  // Panel 1: Ambang (y: 44 .. 190, nilai 0.35 .. 0.68)
  const p1Top = 44;
  const p1Bottom = 190;
  const p1H = p1Bottom - p1Top;
  const scaleY1 = (val: number) => p1Bottom - ((val - 0.35) / (0.68 - 0.35)) * p1H;

  // Panel 2: FPR % (y: 260 .. 430, nilai 0.0 .. 3.0)
  const p2Top = 260;
  const p2Bottom = 430;
  const p2H = p2Bottom - p2Top;
  const scaleY2 = (val: number) => p2Bottom - (val / 3.0) * p2H;

  const scaleX = (t: number) => padLeft + ((t - 35) / (49 - 35)) * plotW;

  const pathStaticThresh = rows
    .map(
      (r, i) =>
        `${i === 0 ? "M" : "L"}${scaleX(r.timestep).toFixed(1)},${scaleY1(
          r.threshold_static
        ).toFixed(1)}`
    )
    .join(" ");

  const pathAciThresh = rows
    .map(
      (r, i) =>
        `${i === 0 ? "M" : "L"}${scaleX(r.timestep).toFixed(1)},${scaleY1(
          r.threshold_aci
        ).toFixed(1)}`
    )
    .join(" ");

  const pathStaticFpr = rows
    .map(
      (r, i) =>
        `${i === 0 ? "M" : "L"}${scaleX(r.timestep).toFixed(1)},${scaleY2(
          r.fpr_static
        ).toFixed(1)}`
    )
    .join(" ");

  const pathAciFpr = rows
    .map(
      (r, i) =>
        `${i === 0 ? "M" : "L"}${scaleX(r.timestep).toFixed(1)},${scaleY2(
          r.fpr_aci
        ).toFixed(1)}`
    )
    .join(" ");

  const xT43 = scaleX(43);
  const xT44 = scaleX(44);
  const xT49 = scaleX(49);
  const lastRow = rows[rows.length - 1];

  return (
    <div className="panel-kerja" style={{ padding: "24px", backgroundColor: "var(--putih)" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div>
          <h3 style={{ fontSize: "20px", marginBottom: "6px" }}>
            Perilaku{" "}
            <span
              tabIndex={0}
              onMouseEnter={() => setShowAciTooltip(true)}
              onMouseLeave={() => setShowAciTooltip(false)}
              onFocus={() => setShowAciTooltip(true)}
              onBlur={() => setShowAciTooltip(false)}
              style={{
                textDecoration: "underline",
                textDecorationStyle: "dotted",
                textUnderlineOffset: "4px",
                cursor: "help",
                position: "relative",
              }}
            >
              ambang menyesuaikan diri
              {showAciTooltip && (
                <span
                  role="tooltip"
                  className="elemen-apung"
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "100%",
                    marginTop: "6px",
                    padding: "6px 10px",
                    fontSize: "12px",
                    fontFamily: "var(--font-ui)",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    zIndex: 20,
                  }}
                >
                  Adaptive Conformal Inference (ACI): kalibrasi ambang kuantil skor secara berurutan.
                </span>
              )}
            </span>{" "}
            dan tingkat alarm palsu (t35 sampai t49)
          </h3>
          <p className="teks-kecil" style={{ marginBottom: 0 }}>
            Protokol: {THRESHOLD_DATA.protocol}
          </p>
        </div>

        <button
          type="button"
          className="tombol-sekunder"
          aria-expanded={showDataTable}
          onClick={() => setShowDataTable((prev) => !prev)}
          style={{ minHeight: "36px", padding: "6px 12px", fontSize: "var(--teks-kecil)" }}
        >
          {showDataTable
            ? "Sembunyikan tabel data per timestep"
            : "Tampilkan tabel data per timestep"}
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${width} 480`}
          role="img"
          aria-label="Bagan dua panel yang menunjukkan bahwa ambang menyesuaikan diri menjaga rata-rata FPR jangka panjang pada 1,05% dibanding 1,54% pada ambang statis, namun sempat melewati batas 2% pada timestep t44 (2,31%) dan t49 (2,14%) setelah pergeseran rezim penutupan dark market di t43."
          style={{ width: "100%", height: "auto", minWidth: "680px", display: "block" }}
        >
          {/* Pita tipis pergeseran rezim di t43 */}
          <rect
            x={xT43 - 10}
            y={p1Top}
            width="20"
            height={p2Bottom - p1Top}
            fill="rgba(16, 35, 63, 0.06)"
          />
          <line
            x1={xT43}
            y1={p1Top - 8}
            x2={xT43}
            y2={p2Bottom}
            stroke="var(--tinta)"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />
          <text
            x={xT43 + 6}
            y={p1Top - 12}
            fontSize="11.5"
            fontWeight="600"
            fill="var(--tinta)"
          >
            t43: Pergeseran rezim (penutupan dark market)
          </text>

          {/* ================= PANEL 1: AMBANG ================= */}
          <text
            x={padLeft}
            y={p1Top - 12}
            fontSize="12"
            fontWeight="600"
            fill="var(--tinta-redup)"
          >
            Panel A: Ambang keputusan skor risiko (kuantil)
          </text>

          {[0.4, 0.5, 0.6].map((tick) => {
            const y = scaleY1(tick);
            return (
              <g key={`p1-${tick}`}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + plotW}
                  y2={y}
                  stroke="var(--garis)"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="var(--tinta-redup)"
                >
                  {tick.toFixed(2).replace(".", ",")}
                </text>
              </g>
            );
          })}

          <path
            d={pathStaticThresh}
            fill="none"
            stroke="var(--rute)"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
          <text
            x={scaleX(49) + 10}
            y={scaleY1(lastRow.threshold_static) + 5}
            fontSize="11.5"
            fontWeight="600"
            fill="var(--tinta-redup)"
          >
            Ambang statis (0,50)
          </text>

          <path d={pathAciThresh} fill="none" stroke="var(--sinyal)" strokeWidth="2.5" />
          <text
            x={scaleX(49) + 10}
            y={scaleY1(lastRow.threshold_aci) + 4}
            fontSize="11.5"
            fontWeight="700"
            fill="var(--sinyal-teks)"
          >
            Ambang menyesuaikan ({lastRow.threshold_aci.toFixed(2).replace(".", ",")})
          </text>

          {/* ================= PANEL 2: FPR (%) ================= */}
          <text
            x={padLeft}
            y={p2Top - 14}
            fontSize="12"
            fontWeight="600"
            fill="var(--tinta-redup)"
          >
            Panel B: Tingkat alarm palsu / FPR (%) per timestep
          </text>

          {[0.0, 1.0, 2.0, 3.0].map((tick) => {
            const y = scaleY2(tick);
            const isTwoPct = tick === 2.0;
            return (
              <g key={`p2-${tick}`}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + plotW}
                  y2={y}
                  stroke={isTwoPct ? "var(--rute)" : "var(--garis)"}
                  strokeWidth={isTwoPct ? "1.2" : "1"}
                  strokeDasharray={isTwoPct ? "3 3" : undefined}
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="var(--tinta-redup)"
                >
                  {tick.toFixed(1).replace(".", ",")}%
                </text>
              </g>
            );
          })}

          <text
            x={padLeft + 6}
            y={scaleY2(2.0) - 5}
            fontSize="10.5"
            fill="var(--tinta-redup)"
          >
            Batas perhatian 2,0% per timestep
          </text>

          <path
            d={pathStaticFpr}
            fill="none"
            stroke="var(--rute)"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
          <text
            x={scaleX(49) + 10}
            y={scaleY2(lastRow.fpr_static) + 18}
            fontSize="11.5"
            fontWeight="600"
            fill="var(--tinta-redup)"
          >
            FPR statis (rata-rata 1,54%)
          </text>

          <path d={pathAciFpr} fill="none" stroke="var(--sinyal)" strokeWidth="2.5" />
          <text
            x={scaleX(49) + 10}
            y={scaleY2(lastRow.fpr_aci) - 8}
            fontSize="11.5"
            fontWeight="700"
            fill="var(--sinyal-teks)"
          >
            FPR menyesuaikan (rata-rata 1,05%)
          </text>

          {/* Penanda titik FPR > 2% pada t44 dan t49 dengan jarak bersih tanpa bertumpuk */}
          <g>
            <circle
              cx={xT44}
              cy={scaleY2(2.31)}
              r="5.5"
              fill="var(--putih)"
              stroke="var(--bahaya)"
              strokeWidth="2.2"
            />
            <text
              x={xT44 + 8}
              y={scaleY2(2.31) - 8}
              fontSize="11"
              fontWeight="700"
              fill="var(--bahaya)"
            >
              t44: 2,31% (&gt;2%)
            </text>

            <circle
              cx={xT49}
              cy={scaleY2(2.14)}
              r="5.5"
              fill="var(--putih)"
              stroke="var(--bahaya)"
              strokeWidth="2.2"
            />
            <text
              x={xT49 - 10}
              y={scaleY2(2.14) - 12}
              textAnchor="end"
              fontSize="11"
              fontWeight="700"
              fill="var(--bahaya)"
            >
              t49: 2,14% (&gt;2%)
            </text>
          </g>

          {rows.map((r) => {
            const cx = scaleX(r.timestep);
            const isSelected = activeStep?.timestep === r.timestep;
            return (
              <g
                key={r.timestep}
                tabIndex={0}
                role="button"
                aria-label={`Timestep ${r.label}: ambang menyesuaikan ${r.threshold_aci
                  .toFixed(2)
                  .replace(".", ",")}, FPR menyesuaikan ${r.fpr_aci
                  .toFixed(2)
                  .replace(".", "%, ")}FPR statis ${r.fpr_static
                  .toFixed(2)
                  .replace(".", "%")}`}
                onMouseEnter={() => setActiveStep(r)}
                onFocus={() => setActiveStep(r)}
                onMouseLeave={() => setActiveStep(null)}
                onBlur={() => setActiveStep(null)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={cx - 14}
                  y={p1Top}
                  width="28"
                  height={p2Bottom - p1Top}
                  fill={isSelected ? "rgba(15, 124, 134, 0.07)" : "transparent"}
                />
                <circle
                  cx={cx}
                  cy={scaleY1(r.threshold_aci)}
                  r={isSelected ? 4.5 : 3}
                  fill="var(--sinyal)"
                />
                <circle
                  cx={cx}
                  cy={scaleY2(r.fpr_aci)}
                  r={isSelected ? 4.5 : 3}
                  fill="var(--sinyal)"
                />
                <text
                  x={cx}
                  y={p2Bottom + 20}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={
                    r.timestep === 43 || r.timestep === 44 || r.timestep === 49
                      ? "700"
                      : "400"
                  }
                  fill="var(--tinta)"
                >
                  {r.label}
                </text>
              </g>
            );
          })}

          <text
            x={padLeft + plotW / 2}
            y={p2Bottom + 42}
            textAnchor="middle"
            fontSize="12"
            fill="var(--tinta-redup)"
          >
            Periode waktu pengujian Elliptic (timestep t35 sampai t49, jeda sekitar 2 minggu per langkah)
          </text>
        </svg>
      </div>

      <div
        style={{
          marginTop: "12px",
          padding: "12px 16px",
          backgroundColor: "var(--kertas)",
          borderRadius: "6px",
          border: "1px solid var(--garis)",
          fontSize: "var(--teks-kecil)",
          color: "var(--tinta)",
        }}
      >
        {activeStep ? (
          <div>
            <strong>Detail {activeStep.label}:</strong> Volume{" "}
            {activeStep.volume.toLocaleString("id-ID")} transaksi | Ambang menyesuaikan{" "}
            <strong>{activeStep.threshold_aci.toFixed(2).replace(".", ",")}</strong> (statis{" "}
            {activeStep.threshold_static.toFixed(2).replace(".", ",")}) | FPR menyesuaikan{" "}
            <strong>{activeStep.fpr_aci.toFixed(2).replace(".", ",")}%</strong> (statis{" "}
            {activeStep.fpr_static.toFixed(2).replace(".", ",")}%)
            {activeStep.event ? `. Catatan: ${activeStep.event}.` : "."}
          </div>
        ) : (
          <div>
            <strong>Catatan pembacaan:</strong> Kendali ambang menyesuaikan diri berlaku sebagai rata-rata jangka panjang (1,05% berbanding 1,54% pada ambang statis), bukan jaminan di setiap timestep. Saat terjadi guncangan distribusi di t43, FPR sempat melewati 2% pada{" "}
            <strong>t44 (2,31%)</strong> dan <strong>t49 (2,14%)</strong> sebelum ambang selesai beradaptasi.
          </div>
        )}
      </div>

      {showDataTable && (
        <div style={{ marginTop: "16px", overflowX: "auto" }}>
          <table
            className="tabel-data"
            aria-label="Data lengkap ambang dan FPR per timestep t35 sampai t49"
          >
            <thead>
              <tr>
                <th scope="col">Timestep</th>
                <th scope="col">Volume transaksi</th>
                <th scope="col">Ambang statis</th>
                <th scope="col">Ambang menyesuaikan</th>
                <th scope="col">FPR statis</th>
                <th scope="col">FPR menyesuaikan</th>
                <th scope="col">Keterangan rezim</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.timestep}>
                  <td style={{ fontWeight: 600 }}>{r.label}</td>
                  <td>{r.volume.toLocaleString("id-ID")}</td>
                  <td>{r.threshold_static.toFixed(2).replace(".", ",")}</td>
                  <td style={{ fontWeight: 600 }}>
                    {r.threshold_aci.toFixed(2).replace(".", ",")}
                  </td>
                  <td>{r.fpr_static.toFixed(2).replace(".", ",")}%</td>
                  <td
                    style={{
                      fontWeight: 600,
                      color: r.fpr_aci > 2.0 ? "var(--bahaya)" : "var(--tinta)",
                    }}
                  >
                    {r.fpr_aci.toFixed(2).replace(".", ",")}%
                  </td>
                  <td className="teks-kecil">{r.event ?? r.regime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
