import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { VIRTUES } from "@/lib/virtues";
import CycleComplete from "@/components/CycleComplete";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
export const dynamic = "force-dynamic";

export default async function CompletePage() {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) redirect("/login");

  const cycle = (await sql`
    SELECT id, started_at FROM cycles
    WHERE user_id = ${uid} AND completed = false
    ORDER BY started_at DESC LIMIT 1
  `)[0];
  if (!cycle) redirect("/dashboard");

  const marks = (await sql`
    SELECT week_index, virtue_index, day_index, marked
    FROM marks WHERE cycle_id = ${cycle.id}
  `) as any[];

  const byWeek = Array.from({ length: 13 }, (_, w) => {
    const wm = marks.filter((m) => m.week_index === w);
    const violations = wm.filter((m) => m.marked).length;
    const checked = new Set(wm.map((m) => m.day_index)).size;
    return {
      week: w,
      virtue: VIRTUES[w].name,
      violations,
      checked,
      complete: checked === 7,
    };
  });

  return <CycleComplete startedAt={String(cycle.started_at)} weeks={byWeek} cycleId={cycle.id} />;
}
