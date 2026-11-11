import * as webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_CONTACT_EMAIL || "mailto:admin@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendPush(sub: { endpoint: string; p256dh: string; auth: string }, payload: Record<string, unknown>) {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload)
    );
    return "ok" as const;
  } catch (err: any) {
    if (err?.statusCode === 404 || err?.statusCode === 410) return "gone" as const;
    return "error" as const;
  }
}