import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import BookTable from "@/components/BookTable";

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) redirect("/login");

  let cycle = (await sql`
    SELECT id FROM cycles WHERE user_id = ${uid} AND completed = false
    ORDER BY started_at DESC LIMIT 1
  `)[0];

  if (!cycle) {
    cycle = (await sql`INSERT INTO cycles (user_id) VALUES (${uid}) RETURNING id`)[0];
  }

  const marks = await sql`
    SELECT virtue_index, day_index, marked FROM marks WHERE cycle_id = ${cycle.id}
  `;

  return (
    <main className="min-h-screen px-6 py-16 max-w-4xl mx-auto">
      <h1 className="font-[family-name:var(--font-cinzel)] text-3xl text-white mb-2">Книжка</h1>
      <p className="text-neutral-500 text-sm mb-10">Ставь точку вечером, если в этот день нарушил дисциплину.</p>
      <BookTable cycleId={cycle.id} initialMarks={marks as { virtue_index: number; day_index: number; marked: boolean }[]} />
    </main>
  );
}
