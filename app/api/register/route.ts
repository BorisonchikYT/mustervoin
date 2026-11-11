import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  if (!username || !password || password.length < 6) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }
  const existing = await sql`SELECT id FROM users WHERE username = ${username}`;
  if (existing.length) {
    return NextResponse.json({ error: "Пользователь уже существует" }, { status: 409 });
  }
  const hash = await bcrypt.hash(password, 10);
  await sql`INSERT INTO users (username, password_hash) VALUES (${username}, ${hash})`;
  return NextResponse.json({ ok: true });
}
