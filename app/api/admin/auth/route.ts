import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

function hashToken(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: Request) {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD not configured" },
      { status: 500 },
    );
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = hashToken(adminPassword + Date.now().toString());
  const jar = await cookies();
  jar.set("admin_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return NextResponse.json({ success: true });
}

export async function GET() {
  const jar = await cookies();
  const token = jar.get("admin_token");
  if (!token?.value) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete("admin_token");
  return NextResponse.json({ success: true });
}
