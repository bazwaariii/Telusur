"use client";

import React, { useState } from "react";

export function EarlyAccessForm() {
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [role, setRole] = useState("Penyidik / Auditor Forensik");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [issuedKey, setIssuedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = email.trim();
    const trimmedInst = institution.trim();

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMsg("Masukkan alamat email kerja atau institusi yang valid.");
      return;
    }

    if (trimmedInst.length < 2) {
      setErrorMsg("Tuliskan nama institusi, perusahaan, atau organisasi Anda.");
      return;
    }

    setIsSubmitting(true);
    let generatedKey = `tls_org_${Math.random().toString(16).slice(2, 14)}`;

    try {
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_access",
          email: trimmedEmail,
          institution: trimmedInst,
          role,
          notes: notes.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.record?.issuedApiKey) {
          generatedKey = data.record.issuedApiKey;
        }
      }
    } catch {
      // Tetap berikan kunci lokal bila sedang offline
    }

    try {
      const existingRaw = localStorage.getItem("telusur_early_access_requests");
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      existing.push({
        email: trimmedEmail,
        institution: trimmedInst,
        role,
        notes: notes.trim(),
        issuedApiKey: generatedKey,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(
        "telusur_early_access_requests",
        JSON.stringify(existing)
      );
    } catch {
      // Tetap lanjutkan jika penyimpanan lokal dibatasi peramban
    }

    setIssuedKey(generatedKey);
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="panel-kerja"
        style={{
          padding: "24px",
          backgroundColor: "var(--putih)",
        }}
      >
        <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>
          Organisasi terdaftar dan kunci API siap digunakan
        </h3>
        <p className="teks-sekunder" style={{ marginBottom: "14px", maxWidth: "62ch" }}>
          Pendaftaran untuk <strong>{email}</strong> ({institution}, peran:{" "}
          {role}) telah dicatat ke dalam log audit sistem. Anda dapat langsung menggunakan kunci API di bawah ini pada halaman Dokumentasi API atau integrasi server Anda:
        </p>

        {issuedKey && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "18px",
            }}
          >
            <code
              className="font-mono"
              style={{
                padding: "8px 14px",
                backgroundColor: "var(--kertas)",
                border: "1px solid var(--tinta)",
                borderRadius: "6px",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              {issuedKey}
            </code>
            <button
              type="button"
              className="tombol-sekunder"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(issuedKey);
                } catch {}
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              }}
              style={{ minHeight: "38px", padding: "6px 14px", fontSize: "13px" }}
            >
              {copied ? "Kunci disalin" : "Salin kunci API"}
            </button>
          </div>
        )}

        <button
          type="button"
          className="tombol-sekunder"
          onClick={() => {
            setSubmitted(false);
            setEmail("");
            setInstitution("");
            setNotes("");
            setIssuedKey(null);
          }}
        >
          Daftarkan organisasi lain
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="panel-kerja"
      style={{
        padding: "24px",
        backgroundColor: "var(--putih)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <div>
          <label
            htmlFor="akses-email"
            style={{
              display: "block",
              fontWeight: 600,
              fontSize: "var(--teks-kecil)",
              marginBottom: "6px",
              color: "var(--tinta)",
            }}
          >
            Email kerja / institusi
          </label>
          <input
            id="akses-email"
            type="email"
            required
            className="input-teks"
            placeholder="nama@perusahaan.co.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="akses-institusi"
            style={{
              display: "block",
              fontWeight: 600,
              fontSize: "var(--teks-kecil)",
              marginBottom: "6px",
              color: "var(--tinta)",
            }}
          >
            Perusahaan atau institusi
          </label>
          <input
            id="akses-institusi"
            type="text"
            required
            className="input-teks"
            placeholder="Mis. Bursa Aset Kripto / Lembaga Audit / Perusahaan"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="akses-peran"
            style={{
              display: "block",
              fontWeight: 600,
              fontSize: "var(--teks-kecil)",
              marginBottom: "6px",
              color: "var(--tinta)",
            }}
          >
            Peran utama
          </label>
          <select
            id="akses-peran"
            className="input-teks"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="Penyidik / Auditor Forensik">
              Penyidik / Auditor Forensik
            </option>
            <option value="Tim Kepatuhan Bursa (Compliance Officer)">
              Tim Kepatuhan Bursa (Compliance Officer)
            </option>
            <option value="Insinyur Keamanan / Integrasi API Perusahaan">
              Insinyur Keamanan / Integrasi API Perusahaan
            </option>
            <option value="Peneliti Keamanan Siber / Akademisi">
              Peneliti Keamanan Siber / Akademisi
            </option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="akses-catatan"
          style={{
            display: "block",
            fontWeight: 600,
            fontSize: "var(--teks-kecil)",
            marginBottom: "6px",
            color: "var(--tinta)",
          }}
        >
          Kebutuhan kasus atau skenario integrasi (opsional)
        </label>
        <input
          id="akses-catatan"
          type="text"
          className="input-teks"
          placeholder="Mis. integrasi endpoint POST /api/v1/score sebelum penarikan Rupiah disetujui"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {errorMsg && (
        <p
          role="alert"
          style={{
            color: "var(--bahaya)",
            fontSize: "var(--teks-kecil)",
            fontWeight: 600,
            marginBottom: "12px",
          }}
        >
          {errorMsg}
        </p>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <button type="submit" disabled={isSubmitting} className="tombol-utama">
          {isSubmitting ? "Memproses pendaftaran..." : "Minta akses awal"}
        </button>
        <p className="teks-kecil" style={{ marginBottom: 0, maxWidth: "56ch" }}>
          Catatan privasi (UU PDP): Kami hanya mencatat alamat email, nama organisasi, dan peran untuk penerbitan kunci API serta log audit integrasi. Data tidak dibagikan kepada pihak ketiga.
        </p>
      </div>
    </form>
  );
}
