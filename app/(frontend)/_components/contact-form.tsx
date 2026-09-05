"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

type Status = { kind: "idle" | "sending" | "sent" | "error"; message: string };

/**
 * Sends the enquiry to the website, where it appears in the dashboard inbox.
 * The service list is passed in from the server so it always matches the
 * services currently published.
 */
export function ContactForm({ services, email }: { services: string[]; email: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const requested = searchParams.get("service") ?? "General inquiry";
  const options = ["General inquiry", "Production", "Training", "Right Sanchar", ...services];
  const initialService = options.includes(requested) ? requested : "General inquiry";
  const [status, setStatus] = useState<Status>({ kind: "idle", message: "" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus({ kind: "sending", message: "Sending your message…" });

    try {
      const response = await fetch("/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          service: data.get("service"),
          message: data.get("message"),
          company: data.get("company"),
          sourcePath: pathname,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setStatus({
          kind: "error",
          message: result.error ?? `Your message could not be sent. Please email ${email} directly.`,
        });
        return;
      }
      form.reset();
      setStatus({
        kind: "sent",
        message: "Thank you. Your message has reached our team and we will reply by email.",
      });
    } catch {
      setStatus({
        kind: "error",
        message: `Your message could not be sent. Please email ${email} directly.`,
      });
    }
  }

  return <form className="inquiry-form" onSubmit={handleSubmit}>
    <h2>Send your inquiry</h2><p>Tell us about your project and our team will reply by email.</p>
    <div className="form-row"><label>Your name<input name="name" autoComplete="name" required maxLength={100} /></label><label>Your email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label></div>
    <label>Your phone (optional)<input name="phone" type="tel" autoComplete="tel" maxLength={40} /></label>
    <label>What can we help with?<select name="service" key={initialService} defaultValue={initialService}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>
    <label>Tell us about your project<textarea name="message" rows={6} required minLength={10} maxLength={1800} placeholder="Your idea, audience, preferred timing, and any details that will help us understand the scope." /></label>
    {/* Spam trap: hidden from people, tempting to bots. */}
    <input name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="form-trap" />
    <button className="primary-button" type="submit" disabled={status.kind === "sending"}>
      {status.kind === "sending" ? "Sending…" : "Send inquiry"} <ArrowUpRight aria-hidden="true" />
    </button>
    <p className="form-note">Your name, email, phone, and message are stored securely so our team can reply. They are never shared with anyone else.</p>
    <p className="form-status" role="status">{status.message}</p>
  </form>;
}
