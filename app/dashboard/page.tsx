import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { VIRTUES } from "@/lib/virtues";

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

  const marks = await sql`
    SELECT virtue_index, day_index, marked FROM marks WHERE cycle_id = ${cycle.id}
  `;

  const violationCount = (v: number) => marks.filter((m) => m.virtue_index === v && m.marked).length;
  let currentWeek = 0;
  for (let v = 0; v < 13; v++) {
    if (violationCount(v) > 0) { currentWeek = v; break; }
  }
  const virtue = VIRTUES[currentWeek];

  return (
    <main className="min-h-screen px-6 py-16 max-w-4xl mx-auto">
      <div className="flex items-baseline justify-between mb-12">
        <h1 className="font-[family-name:var(--font-cinzel)] text-4xl text-white">MusterVoin</h1>
        <Link href="/virtues" className="text-sm text-neutral-400 hover:text-white">Дисциплины →</Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Цикл</p>
          <p className="mt-2 text-white">{new Date(cycle.started_at).toLocaleDateString("ru-RU")}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Текущая неделя</p>
          <p className="mt-2 text-white">#{currentWeek + 1} — {virtue.name}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Освоено</p>
          <p className="mt-2 text-white">{currentWeek} / 13</p>
        </div>
      </div>

      <p className="text-neutral-400 mb-8 italic">«{virtue.rule}»</p>

      <Link href="/book" className="inline-block px-8 py-3 rounded-full bg-white text-black font-medium hover:bg-neutral-200 transition">
        Открыть книжку →
      </Link>
    </main>
  );
}
