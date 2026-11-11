import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { VIRTUES } from "@/lib/virtues";

export const dynamic = "force-dynamic";

const DAYS_RU: Record<number, string> = {
  0: "Воскресенье",
  1: "Понедельник",
  2: "Вторник",
  3: "Среда",
  4: "Четверг",
  5: "Пятница",
  6: "Суббота",
};

function fmtDate(d: string | Date): string {
  const date = new Date(d);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function escapeCell(value: string): string {
  // Если в значении есть ; " или перенос строки — оборачиваем в кавычки и удваиваем кавычки
  if (/[;"\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cycle = (await sql`
    SELECT id, started_at FROM cycles
    WHERE user_id = ${uid} AND completed = false
    ORDER BY started_at DESC LIMIT 1
  `)[0];

  const header = [
    "Начало цикла",
    "Неделя",
    "Дисциплина",
    "День",
    "Отметка",
    "Дата записи",
  ].join(";");

  let rows = "";

  if (cycle) {
    const marks = (await sql`
      SELECT week_index, virtue_index, day_index, marked, updated_at
      FROM marks
      WHERE cycle_id = ${cycle.id}
      ORDER BY week_index, virtue_index, day_index
    `) as any[];

    for (const r of marks) {
      const virtue = VIRTUES[r.virtue_index]?.name ?? "—";
      const day = DAYS_RU[r.day_index] ?? "—";
      const status = r.marked ? "нарушил" : "чисто";
      const cells = [
        fmtDate(cycle.started_at),
        String(r.week_index + 1),
        virtue,
        day,
        status,
        fmtDate(r.updated_at),
      ];
      rows += cells.map(escapeCell).join(";") + "\r\n";
    }
  }

  // BOM + CRLF — чтобы Excel (Windows, русская локаль) открыл как таблицу
  const csv = "\uFEFF" + header + "\r\n" + rows;

  const filename = `mustervoin-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}