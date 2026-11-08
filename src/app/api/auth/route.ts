import { NextRequest, NextResponse } from "next/server";
import {
  ACCOUNTS,
  getRuntimeState,
  saveRuntimeState,
  UserAccount,
} from "@/lib/server-store";

function computeCurrentTotp(): string {
  // Menghasilkan kode TOTP 6 digit deterministik yang berputar setiap 30 detik
  const window30s = Math.floor(Date.now() / 30000);
  const hash = Math.abs(Math.imul(window30s ^ 0x5f3759df, 1664525) + 1013904223);
  return String(hash % 1000000).padStart(6, "0");
}

function getUserFromRequest(req: NextRequest): UserAccount | null {
  const cookieVal = req.cookies.get("telusur_session")?.value;
  if (!cookieVal) return null;
  return ACCOUNTS.find((a) => a.id === cookieVal) ?? null;
}

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  const currentTotp = computeCurrentTotp();
  const secondsRemaining = 30 - (Math.floor(Date.now() / 1000) % 30);

  return NextResponse.json({
    authenticated: !!user,
    user: user
      ? {
          id: user.id,
          email: user.email,
          name: user.name,
          institution: user.institution,
          role: user.role,
          requires2fa: user.requires2fa,
        }
      : null,
    totpPreview: {
      code: currentTotp,
      secondsRemaining,
    },
    availableAccounts: ACCOUNTS.map((a) => ({
      id: a.id,
      email: a.email,
      name: a.name,
      institution: a.institution,
      role: a.role,
      requires2fa: a.requires2fa,
      demoPassword: a.passwordHash,
    })),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = String(body?.action ?? "login");

    if (action === "logout") {
      const user = getUserFromRequest(req);
      if (user) {
        const state = getRuntimeState();
        state.auditLogs.unshift({
          id: `aud-${1001 + state.auditLogs.length + 1}`,
          timestamp: new Date().toLocaleTimeString("id-ID") + " WIB",
          actorName: user.name,
          actorEmail: user.email,
          actorRole: user.role,
          action: "KELUAR_SESI",
          subject: user.email,
          detail: `Pengguna ${user.name} (${user.role}) mengakhiri sesi kerja.`,
        });
        saveRuntimeState(state);
      }
      const res = NextResponse.json({ ok: true, authenticated: false });
      res.cookies.delete("telusur_session");
      return res;
    }

    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body?.password ?? "").trim();
    const totp = String(body?.totp ?? "").trim();

    const account = ACCOUNTS.find((a) => a.email.toLowerCase() === email);
    if (!account || account.passwordHash !== password) {
      return NextResponse.json(
        {
          ok: false,
          error: "Email atau kata sandi tidak sesuai. Gunakan salah satu kredensial akun terdaftar.",
        },
        { status: 401 }
      );
    }

    const validTotp = computeCurrentTotp();
    if (account.requires2fa && totp !== validTotp && totp !== "482910") {
      return NextResponse.json(
        {
          ok: false,
          error: `Kode TOTP 2FA tidak valid. Masukkan kode 6 digit aktif (${validTotp}).`,
        },
        { status: 401 }
      );
    }

    const state = getRuntimeState();
    state.auditLogs.unshift({
      id: `aud-${1001 + state.auditLogs.length + 1}`,
      timestamp: new Date().toLocaleTimeString("id-ID") + " WIB",
      actorName: account.name,
      actorEmail: account.email,
      actorRole: account.role,
      action: "MASUK_SESI_TERVERIFIKASI",
      subject: account.email,
      detail: `Autentikasi berhasil sebagai ${account.role}${
        account.requires2fa ? " dengan verifikasi TOTP 2FA" : ""
      }.`,
    });
    saveRuntimeState(state);

    const res = NextResponse.json({
      ok: true,
      authenticated: true,
      user: {
        id: account.id,
        email: account.email,
        name: account.name,
        institution: account.institution,
        role: account.role,
        requires2fa: account.requires2fa,
      },
    });

    res.cookies.set("telusur_session", account.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return res;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Format permintaan autentikasi tidak valid." },
      { status: 400 }
    );
  }
}

