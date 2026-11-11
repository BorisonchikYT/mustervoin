import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import BookTable from "@/components/BookTable";

export const dynamic = "force-dynamic";

export default async function CyclePage({ params }: { params: { cycle: string } }) {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) redirect("/login");

  const cycle = (await sql`
    SELECT id, started_at, completed FROM cycles WHERE id = ${params.cycle} AND user_id = ${uid}
  `)[0];
  if (!cycle) notFound();

  const marks = await sql`
    SELECT virtue_index, day_index, marked FROM marks WHERE cycle_id = ${cycle.id}
  `;

  return (
    <main className="min-h-screen px-6 py-16 max-w-4xl mx-auto">
      <h1 className="font-[family-name:var(--font-cinzel)] text-3xl text-white mb-2">
        Цикл от {new Date(cycle.started_at).toLocaleDateString("ru-RU")}
      </h1>
      <p className="text-neutral-500 text-sm mb-10">{cycle.completed ? "Завершён" : "Активен"}</p>
      <BookTable
        cycleId={cycle.id}
        initialMarks={marks as { virtue_index: number; day_index: number; marked: boolean }[]}
        readonly={!!cycle.completed}
      />
    </main>
  );
}
