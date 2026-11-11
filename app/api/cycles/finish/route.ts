import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST() {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await sql`UPDATE cycles SET completed = true WHERE user_id = ${uid} AND completed = false`;
  const rows = await sql`INSERT INTO cycles (user_id) VALUES (${uid}) RETURNING id`;
  return NextResponse.json({ id: rows[0].id });
}
