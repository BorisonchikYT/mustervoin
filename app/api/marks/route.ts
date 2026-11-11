import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { cycleId, weekIndex, virtueIndex, dayIndex } = await req.json();

  if (
    typeof weekIndex !== "number" || weekIndex < 0 || weekIndex > 12 ||
    typeof virtueIndex !== "number" || virtueIndex < 0 || virtueIndex > 12 ||
    typeof dayIndex !== "number" || dayIndex < 0 || dayIndex > 6
  ) {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  const own = await sql`SELECT id FROM cycles WHERE id = ${cycleId} AND user_id = ${uid}`;
  if (!own.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await sql`
    INSERT INTO marks (cycle_id, week_index, virtue_index, day_index, marked)
    VALUES (${cycleId}, ${weekIndex}, ${virtueIndex}, ${dayIndex}, true)
    ON CONFLICT (cycle_id, week_index, virtue_index, day_index)
    DO UPDATE SET marked = NOT marks.marked, updated_at = now()
  `;
  return NextResponse.json({ ok: true });
}
