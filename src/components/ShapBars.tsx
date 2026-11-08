"use client";

import React, { useState } from "react";
import { ShapFeature } from "@/lib/demo-data";

interface ShapBarsProps {
  features: ShapFeature[];
  maxAbs?: number;
}

export function ShapBars({ features, maxAbs = 0.32 }: ShapBarsProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTechIndex, setActiveTechIndex] = useState<number | null>(null);

  const visibleFeatures = expanded ? features : features.slice(0, 5);
  const hasMore = features.length > 5;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "var(--teks-kecil)",
          color: "var(--tinta-redup)",
          marginBottom: "8px",
          paddingBottom: "6px",
          borderBottom: "1px solid var(--garis)",
        }}
      >
        <span style={{ color: "var(--teal-tua)", fontWeight: 600 }}>
          Menurunkan skor (&minus;)
        </span>
        <span>0,00</span>
        <span style={{ color: "var(--sinyal-teks)", fontWeight: 600 }}>
          Menaikkan skor (+)
        </span>
      </div>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {visibleFeatures.map((feat, idx) => {
          const isPositive = feat.contribution >= 0;
          const pct = Math.min(100, (Math.abs(feat.contribution) / maxAbs) * 100);
          const signStr = isPositive ? "+" : "\u2212";
          const valStr = `${signStr}${Math.abs(feat.contribution)
            .toFixed(2)
            .replace(".", ",")}`;
          const isTooltipOpen = activeTechIndex === idx;

          return (
            <li
              key={feat.technical_name}
              style={{
                position: "relative",
                paddingBottom: "8px",
                borderBottom: "1px solid var(--garis)",
              }}
            >
              <div
                tabIndex={0}
                onMouseEnter={() => setActiveTechIndex(idx)}
                onMouseLeave={() => setActiveTechIndex(null)}
                onFocus={() => setActiveTechIndex(idx)}
                onBlur={() => setActiveTechIndex(null)}
                aria-describedby={`tech-feat-${idx}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "10px",
                  marginBottom: "6px",
                  cursor: "help",
                  borderRadius: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--teks-kecil)",
                    color: "var(--tinta)",
                    lineHeight: 1.35,
                  }}
                >
                  {feat.name}
                </span>
                <span
                  style={{
                    fontSize: "var(--teks-kecil)",
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                    color: isPositive ? "var(--sinyal-teks)" : "var(--teal-tua)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {valStr}
                </span>
              </div>

              {/* Tooltip nama teknis muncul saat hover maupun fokus keyboard */}
              {isTooltipOpen && (
                <div
                  id={`tech-feat-${idx}`}
                  role="tooltip"
                  className="elemen-apung"
                  style={{
                    padding: "6px 10px",
                    marginBottom: "6px",
                    fontSize: "12px",
                  }}
                >
                  <span style={{ color: "var(--tinta-redup)" }}>Fitur teknis: </span>
                  <code className="font-mono" style={{ color: "var(--tinta)" }}>
                    {feat.technical_name}
                  </code>
                </div>
              )}

              {/* Bar horizontal berpusat di nol (design.md Bagian 5.3) */}
              <div
                aria-hidden="true"
                style={{
                  position: "relative",
                  height: "10px",
                  backgroundColor: "var(--kertas)",
                  borderRadius: "3px",
                  overflow: "hidden",
                  border: "1px solid var(--garis)",
                }}
              >
                {/* Garis tengah nol */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: 0,
                    bottom: 0,
                    width: "1px",
                    backgroundColor: "var(--tinta)",
                    zIndex: 2,
                  }}
                />
                {isPositive ? (
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "1px",
                      bottom: "1px",
                      width: `${pct / 2}%`,
                      backgroundColor: "var(--sinyal-teks)",
                      borderTopRightRadius: "2px",
                      borderBottomRightRadius: "2px",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      right: "50%",
                      top: "1px",
                      bottom: "1px",
                      width: `${pct / 2}%`,
                      backgroundColor: "var(--teal-tua)",
                      borderTopLeftRadius: "2px",
                      borderBottomLeftRadius: "2px",
                    }}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <button
          type="button"
          className="tombol-sekunder"
          onClick={() => setExpanded((prev) => !prev)}
          style={{
            marginTop: "12px",
            width: "100%",
            minHeight: "40px",
            fontSize: "var(--teks-kecil)",
          }}
        >
          {expanded
            ? "Sembunyikan fitur tambahan"
            : `Lihat semua fitur (${features.length})`}
        </button>
      )}
    </div>
  );
}

