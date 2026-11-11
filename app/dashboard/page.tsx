import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { VIRTUES, currentWeekIndex } from "@/lib/virtues";
import DashboardHero from "@/components/DashboardHero";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) redirect("/login");

  let cycle = (await sql`
    SELECT id, started_at, completed FROM cycles
    WHERE user_id = ${uid} AND completed = false
    ORDER BY started_at DESC LIMIT 1
  `)[0];

  if (!cycle) {
    cycle = (await sql`INSERT INTO cycles (user_id) VALUES (${uid}) RETURNING id, started_at, completed`)[0];
  }

  const week = currentWeekIndex(cycle.started_at);

  const weekMarks = await sql`
    SELECT virtue_index, day_index, marked
    FROM marks
    WHERE cycle_id = ${cycle.id} AND week_index = ${week} AND marked = true
  `;

  const totalViolations = weekMarks.length;
  const virtue = VIRTUES[week];

  return (
    <DashboardHero
      startedAt={String(cycle.started_at)}
      week={week}
      totalWeeks={13}
      virtueIndex={virtue.index}
      virtueName={virtue.name}
      virtueRule={virtue.rule}
      weekViolations={totalViolations}
    />
  );
}
