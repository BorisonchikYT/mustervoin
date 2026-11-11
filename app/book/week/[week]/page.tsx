import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { VIRTUES, computeCurrentWeek, todayDayIndex } from "@/lib/virtues";
import BookClient from "@/components/BookClient";
import WeekSwitcher from "@/components/WeekSwitcher";
import WeekHeader from "@/components/WeekHeader";
import ReminderBanner from "@/components/ReminderBanner";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
export const dynamic = "force-dynamic";

export default async function WeekPage(props: { params: Promise<{ week: string }> }) {
  const params = await props.params;
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

  const allMarks = await sql`
    SELECT week_index, virtue_index, day_index, marked
    FROM marks WHERE cycle_id = ${cycle.id}
  `;

  const currentWeek = computeCurrentWeek(allMarks as any, cycle.started_at);
  const today = todayDayIndex();
  const weekMarks = allMarks.filter((m: any) => m.week_index === weekNum);
  const virtue = VIRTUES[Math.min(weekNum, 12)];
  const isCurrent = weekNum === currentWeek;
  const isPast = weekNum < currentWeek;

  return (
    <main className="min-h-screen px-4 md:px-6 py-8 md:py-16 max-w-5xl mx-auto">
      <Link
        href="/dashboard"
        className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-neutral-500 hover:text-white transition-colors"
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

      <BookClient
        cycleId={cycle.id}
        weekIndex={weekNum}
        currentWeek={currentWeek}
        todayIndex={today}
        initialMarks={weekMarks as any}
        readonly={isPast}
        />

      <p className="mt-6 md:mt-8 text-[11px] md:text-xs text-neutral-600 leading-relaxed">
        Клик по клетке: пусто → ✓ (проверено, чисто) → ● (нарушил) → пусто.
        Строка считается чистой, когда все 7 дней явно отмечены ✓.
        Текущая неделя меняется, когда все 7 дней отмечены.
      </p>
      
      <ReminderBanner todayMarked={weekMarks.some((m: any) => m.day_index === today)} />
    </main>
  );
}