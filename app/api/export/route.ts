import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { VIRTUES } from "@/lib/virtues";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

const DAYS_RU: Record<number, string> = {
  0: "Воскресенье", 1: "Понедельник", 2: "Вторник", 3: "Среда",
  4: "Четверг", 5: "Пятница", 6: "Суббота",
};

export async function GET() {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cycle = (await sql`
    SELECT id, started_at FROM cycles
    WHERE user_id = ${uid} AND completed = false
    ORDER BY started_at DESC LIMIT 1
  `)[0];

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("MusterVoin", {
    views: [{ state: "frozen", ySplit: 1 }], // Закрепляем шапку
  });

  // 1. Заголовки (жирные, с фоном)
  const headers = ["Начало цикла", "Неделя", "Дисциплина", "День", "Отметка", "Дата записи"];
  sheet.addRow(headers);
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F1F1F" } }; // Темный фон
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height = 24;

  // 2. Данные
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
      
      // Форматируем даты как объекты Date для Excel
      const startDate = new Date(cycle.started_at);
      const recordDate = new Date(r.updated_at);

      const row = sheet.addRow([
        startDate,
        r.week_index + 1,
        virtue,
        day,
        status,
        recordDate,
      ]);

      // Выравнивание по центру для всех, кроме Дисциплины
      row.getCell(1).alignment = { horizontal: "center" };
      row.getCell(2).alignment = { horizontal: "center" };
      row.getCell(4).alignment = { horizontal: "center" };
      row.getCell(5).alignment = { horizontal: "center" };
      row.getCell(6).alignment = { horizontal: "center" };

      // Красим статус: нарушил = красный, чисто = зеленый
      const statusCell = row.getCell(5);
      if (r.marked) {
        statusCell.font = { color: { argb: "FFEF4444" }, bold: true };
      } else {
        statusCell.font = { color: { argb: "FF22C55E" }, bold: true };
      }

      // Формат дат
      row.getCell(1).numFmt = "dd.mm.yyyy";
      row.getCell(6).numFmt = "dd.mm.yyyy";
    }
  }

  // 3. Ширина колонок и границы
  sheet.columns = [
    { width: 14 }, // Начало
    { width: 8 },  // Неделя
    { width: 22 }, // Дисциплина
    { width: 16 }, // День
    { width: 12 }, // Отметка
    { width: 14 }, // Дата записи
  ];

  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FF333333" } },
        left: { style: "thin", color: { argb: "FF333333" } },
        bottom: { style: "thin", color: { argb: "FF333333" } },
        right: { style: "thin", color: { argb: "FF333333" } },
      };
    });
  });

  // 4. Автофильтр
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 6 },
  };

  // 5. Генерация и ответ
  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `mustervoin-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}