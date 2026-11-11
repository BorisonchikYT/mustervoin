import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { cycleId, virtueIndex, dayIndex } = await req.json();

  const own = await sql`SELECT id FROM cycles WHERE id = ${cycleId} AND user_id = ${uid}`;
  if (!own.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await sql`
    INSERT INTO marks (cycle_id, virtue_index, day_index, marked)
    VALUES (${cycleId}, ${virtueIndex}, ${dayIndex}, true)
    ON CONFLICT (cycle_id, virtue_index, day_index)
    DO UPDATE SET marked = NOT marks.marked, updated_at = now()
  `;
  return NextResponse.json({ ok: true });
}
