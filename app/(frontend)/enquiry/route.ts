import config from "@payload-config";
import { getPayload } from "payload";

/**
 * Receives the contact form. Messages land in the Enquiries collection so the
 * team can triage them in the dashboard instead of relying on an email client.
 */

export const runtime = "nodejs";

const text = (value: unknown, max: number): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const looksLikeEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function POST(request: Request) {
  if (!process.env.DATABASE_URI || !process.env.PAYLOAD_SECRET) {
    return Response.json(
      { error: "The enquiry service is not configured yet. Please email us directly." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Could not read that request." }, { status: 400 });
  }

  // A hidden field real people never fill in. Bots do, and we drop those.
  if (text(body.company, 100) !== "") {
    return Response.json({ ok: true });
  }

  const name = text(body.name, 100);
  const email = text(body.email, 254);
  const message = text(body.message, 2000);

  if (!name || !looksLikeEmail(email) || message.length < 10) {
    return Response.json(
      { error: "Please provide your name, a valid email address, and a short message." },
      { status: 400 },
    );
  }

  try {
    const payload = await getPayload({ config });
    await payload.create({
      collection: "enquiries",
      data: {
        name,
        email,
        phone: text(body.phone, 40) || undefined,
        service: text(body.service, 160) || undefined,
        message,
        sourcePath: text(body.sourcePath, 512) || undefined,
        state: "new",
      },
      // The visitor is not signed in, and `state` is staff-only, so this
      // endpoint writes the row on their behalf.
      overrideAccess: true,
    });
  } catch (error) {
    console.error("[enquiry] could not save:", error);
    return Response.json(
      { error: "Something went wrong saving your message. Please email us directly." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
