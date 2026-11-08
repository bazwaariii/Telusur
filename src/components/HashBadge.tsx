"use client";

import React, { useState } from "react";
import { truncateMiddle } from "@/lib/demo-data";

interface HashBadgeProps {
  value: string;
  startChars?: number;
  endChars?: number;
  showFull?: boolean;
}

export function HashBadge({
  value,
  startChars = 7,
  endChars = 4,
  showFull = false,
}: HashBadgeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const display = showFull ? value : truncateMiddle(value, startChars, endChars);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        position: "relative",
      }}
    >
      <code
        className="font-mono"
        title={value}
        style={{
          fontSize: "var(--teks-kecil)",
          backgroundColor: "var(--kertas)",
          padding: "2px 6px",
          borderRadius: "4px",
          border: "1px solid var(--garis)",
          color: "var(--tinta)",
        }}
      >
        {display}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Salin ID ${value}`}
        style={{
          minHeight: "28px",
          minWidth: "28px",
          padding: "2px 8px",
          fontSize: "12px",
          fontFamily: "var(--font-ui)",
          backgroundColor: "var(--putih)",
          color: "var(--tinta-redup)",
          border: "1px solid var(--rute)",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        {copied ? "Hash disalin" : "Salin"}
      </button>
    </span>
  );
}

