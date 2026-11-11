import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { cycleId, weekIndex, virtueIndex, dayIndex, mode } = body;

  if (
    typeof weekIndex !== "number" || weekIndex < 0 || weekIndex > 12 ||
    typeof virtueIndex !== "number" || virtueIndex < 0 || virtueIndex > 12 ||
    typeof dayIndex !== "number" || dayIndex < 0 || dayIndex > 6
  ) {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  const own = await sql`SELECT id FROM cycles WHERE id = ${cycleId} AND user_id = ${uid}`;
  if (!own.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (mode === "cycle") {
    const existing = await sql`
      SELECT marked FROM marks
      WHERE cycle_id = ${cycleId} AND week_index = ${weekIndex}
        AND virtue_index = ${virtueIndex} AND day_index = ${dayIndex}
    `;
    if (!existing.length) {
      await sql`
        INSERT INTO marks (cycle_id, week_index, virtue_index, day_index, marked)
        VALUES (${cycleId}, ${weekIndex}, ${virtueIndex}, ${dayIndex}, false)
      `;
    } else if (existing[0].marked === false) {
      await sql`
        UPDATE marks SET marked = true, updated_at = now()
        WHERE cycle_id = ${cycleId} AND week_index = ${weekIndex}
          AND virtue_index = ${virtueIndex} AND day_index = ${dayIndex}
      `;
    } else {
      await sql`
        DELETE FROM marks
        WHERE cycle_id = ${cycleId} AND week_index = ${weekIndex}
          AND virtue_index = ${virtueIndex} AND day_index = ${dayIndex}
      `;
    }
  } else {
    await sql`
      INSERT INTO marks (cycle_id, week_index, virtue_index, day_index, marked)
      VALUES (${cycleId}, ${weekIndex}, ${virtueIndex}, ${dayIndex}, true)
      ON CONFLICT (cycle_id, week_index, virtue_index, day_index)
      DO UPDATE SET marked = NOT marks.marked, updated_at = now()
    `;
  }
  return NextResponse.json({ ok: true });
}
