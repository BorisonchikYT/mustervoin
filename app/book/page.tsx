import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { currentWeekIndex } from "@/lib/virtues";

export const dynamic = "force-dynamic";

export default async function BookRedirect() {
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

  const week = currentWeekIndex(cycle.started_at);
  redirect(`/book/week/${week}`);
}
