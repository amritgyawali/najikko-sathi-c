import config from "@payload-config";
import { getPayload } from "payload";

/**
 * Handles dashboard sign-ups.
 *
 * The Users collection allows public creates, but locks the role and approval
 * fields to administrators, so an account created here is always an unapproved
 * author - except the very first one, which becomes the site's administrator.
 */

export const runtime = "nodejs";

const text = (value: unknown, max: number): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const looksLikeEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function POST(request: Request) {
  if (!process.env.DATABASE_URI || !process.env.PAYLOAD_SECRET) {
    return Response.json({ error: "The dashboard is not configured yet." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Could not read that request." }, { status: 400 });
  }

  // A hidden field real people never fill in.
  if (text(body.company, 100) !== "") return Response.json({ ok: true, pending: true });

  const name = text(body.name, 100);
  const email = text(body.email, 254).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";

  if (!name || !looksLikeEmail(email)) {
    return Response.json({ error: "Please enter your name and a valid email address." }, { status: 400 });
  }
  if (password.length < 10) {
    return Response.json({ error: "Please choose a password of at least 10 characters." }, { status: 400 });
  }

  try {
    const payload = await getPayload({ config });
    const existing = await payload.count({ collection: "users", overrideAccess: true });
    const isFirstAccount = existing.totalDocs === 0;

    await payload.create({
      collection: "users",
      // Always the lowest role. The collection's beforeChange hook promotes the
      // very first account to an approved administrator; every later one stays
      // an unapproved author until someone ticks Approved in the dashboard.
      // Nothing here is read from the request body except name, email, password.
      data: { name, email, password, role: "author", approved: false },
      overrideAccess: true,
    });

    return Response.json({
      ok: true,
      pending: !isFirstAccount,
      message: isFirstAccount
        ? "Your administrator account is ready. You can sign in now."
        : "Thanks. An administrator needs to approve your account before you can sign in.",
    });
  } catch (error) {
    const message = (error as Error).message ?? "";
    // Do not confirm whether an address is already registered.
    if (/duplicate|unique|already/i.test(message)) {
      return Response.json({
        ok: true,
        pending: true,
        message: "Thanks. If that address can be registered, an administrator will review it.",
      });
    }
    console.error("[signup] could not create account:", error);
    return Response.json({ error: "Something went wrong creating the account." }, { status: 500 });
  }
}
