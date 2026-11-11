import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { VIRTUES, computeCurrentWeek } from "@/lib/virtues";
import { computeStreak, weekViolations, isCycleComplete } from "@/lib/stats";
import DashboardHero from "@/components/DashboardHero";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) redirect("/login");

  let cycle = (await sql`
    SELECT id, started_at FROM cycles
    WHERE user_id = ${uid} AND completed = false
    ORDER BY started_at DESC LIMIT 1
  `)[0];

  if (!cycle) {
    cycle = (await sql`INSERT INTO cycles (user_id) VALUES (${uid}) RETURNING id, started_at`)[0];
  }

  const allMarks = (await sql`
    SELECT week_index, virtue_index, day_index, marked
    FROM marks WHERE cycle_id = ${cycle.id}
  `) as any[];

  const week = computeCurrentWeek(allMarks, cycle.started_at);
  const virtue = VIRTUES[Math.min(week, 12)];
  const violations = weekViolations(allMarks, week);
  const streak = computeStreak(allMarks);
  const complete = isCycleComplete(allMarks);

  return (
    <DashboardHero
      startedAt={String(cycle.started_at)}
      week={week}
      totalWeeks={13}
      virtueName={virtue.name}
      virtueRule={virtue.rule}
      weekViolations={violations}
      streak={streak}
      cycleComplete={complete}
    />
  );
}
