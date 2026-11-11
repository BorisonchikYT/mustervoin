import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { VIRTUES, DAYS } from "@/lib/virtues";

export async function GET() {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cycle = (await sql`
    SELECT id, started_at FROM cycles
    WHERE user_id = ${uid} AND completed = false
    ORDER BY started_at DESC LIMIT 1
  `)[0];
  if (!cycle) {
    return new NextResponse("week,virtue,day,marked\n", {
      headers: { "Content-Type": "text/csv; charset=utf-8" },
    });
  }

  const rows = await sql`
    SELECT week_index, virtue_index, day_index, marked
    FROM marks WHERE cycle_id = ${cycle.id}
    ORDER BY week_index, virtue_index, day_index
  `;

  let csv = "cycle_start,week_index,week_number,virtue,day,marked\n";
  for (const r of rows as any[]) {
    const virtue = VIRTUES[r.virtue_index]?.name ?? "?";
    const day = DAYS[r.day_index] ?? "?";
    csv += `${cycle.started_at},${r.week_index},${r.week_index + 1},"${virtue}",${day},${r.marked}\n`;
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mustervoin-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
