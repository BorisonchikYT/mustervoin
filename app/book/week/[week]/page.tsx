import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { VIRTUES, currentWeekIndex, todayDayIndex } from "@/lib/virtues";
import BookTable from "@/components/BookTable";
import WeekSwitcher from "@/components/WeekSwitcher";
import WeekHeader from "@/components/WeekHeader";

export const dynamic = "force-dynamic";

export default async function WeekPage({ params }: { params: { week: string } }) {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) redirect("/login");

  const weekNum = parseInt(params.week, 10);
  if (Number.isNaN(weekNum) || weekNum < 0 || weekNum > 12) notFound();

  let cycle = (await sql`
    SELECT id, started_at FROM cycles
    WHERE user_id = ${uid} AND completed = false
    ORDER BY started_at DESC LIMIT 1
  `)[0];

  if (!cycle) {
    cycle = (await sql`INSERT INTO cycles (user_id) VALUES (${uid}) RETURNING id, started_at`)[0];
  }

  const currentWeek = currentWeekIndex(cycle.started_at);
  const today = todayDayIndex();

  const marks = await sql`
    SELECT week_index, virtue_index, day_index, marked
    FROM marks
    WHERE cycle_id = ${cycle.id} AND week_index = ${weekNum}
  `;

  const virtue = VIRTUES[Math.min(weekNum, 12)];
  const isCurrent = weekNum === currentWeek;
  const isPast = weekNum < currentWeek;

  return (
    <main className="min-h-screen px-6 py-16 max-w-5xl mx-auto">
      <Link
        href="/dashboard"
        className="text-xs uppercase tracking-[0.2em] text-neutral-500 hover:text-white transition-colors"
      >
        ← Дашборд
      </Link>

      <WeekHeader
        weekNum={weekNum}
        isCurrent={isCurrent}
        isPast={isPast}
        virtueName={virtue.name}
        virtueRule={virtue.rule}
      />

      <WeekSwitcher currentWeek={currentWeek} shownWeek={weekNum} />

      <BookTable
        cycleId={cycle.id}
        weekIndex={weekNum}
        currentWeek={currentWeek}
        todayIndex={today}
        initialMarks={marks as { week_index: number; virtue_index: number; day_index: number; marked: boolean }[]}
        readonly={isPast}
      />

      <p className="mt-8 text-xs text-neutral-600 leading-relaxed">
        Точка ставится вечером, если за день ты нарушил правило. Строка «фокус недели» — та
        дисциплина, которую ты тренируешь эту неделю. Все строки выше — уже освоенные правила,
        они продолжают действовать.
      </p>
    </main>
  );
}
