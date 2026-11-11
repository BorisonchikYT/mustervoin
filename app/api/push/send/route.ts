import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { sendPush } from "@/lib/push";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Берём все подписки, у которых сегодняшний день ещё не отмечен (хотя бы по одной дисциплине)
  const rows = await sql`
    SELECT DISTINCT s.id, s.endpoint, s.p256dh, s.auth, s.user_id
    FROM push_subscriptions s
    LEFT JOIN cycles c ON c.user_id = s.user_id AND c.completed = false
    WHERE c.id IS NOT NULL
  `;

  let sent = 0, gone = 0, errors = 0;
  for (const r of rows as any[]) {
    const res = await sendPush(
      { endpoint: r.endpoint, p256dh: r.p256dh, auth: r.auth },
      {
        title: "MusterVoin",
        body: "Вечер. Отметь сегодняшний день в книжке.",
        url: "/book",
      }
    );
    if (res === "ok") sent++;
    else if (res === "gone") {
      gone++;
      await sql`DELETE FROM push_subscriptions WHERE id = ${r.id}`;
    } else errors++;
  }

  return NextResponse.json({ ok: true, sent, gone, errors, total: rows.length });
}