"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

type Status = { kind: "idle" | "sending" | "done" | "error"; message: string };

/** Registration form for dashboard access. */
export function SignupForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle", message: "" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus({ kind: "sending", message: "Creating your account…" });

    try {
      const response = await fetch("/signup/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          password: data.get("password"),
          company: data.get("company"),
        }),
      });
      const result = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        setStatus({ kind: "error", message: result.error ?? "Could not create the account." });
        return;
      }
      form.reset();
      setStatus({ kind: "done", message: result.message ?? "Account created." });
    } catch {
      setStatus({ kind: "error", message: "Could not reach the server. Please try again." });
    }
  }

  return (
    <form className="inquiry-form" onSubmit={handleSubmit}>
      <h2>Create a dashboard account</h2>
      <p>
        The first account becomes the site administrator. After that, an administrator
        approves each new account before it can sign in.
      </p>
      <div className="form-row">
        <label>Your name<input name="name" autoComplete="name" required maxLength={100} /></label>
        <label>Your email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      </div>
      <label>
        Choose a password
        <input name="password" type="password" autoComplete="new-password" required minLength={10} maxLength={200} />
      </label>
      <p className="form-note">Use at least 10 characters.</p>
      {/* Spam trap: hidden from people, tempting to bots. */}
      <input name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="form-trap" />
      <button className="primary-button" type="submit" disabled={status.kind === "sending"}>
        {status.kind === "sending" ? "Creating…" : "Create account"} <ArrowRight aria-hidden="true" />
      </button>
      <p className="form-status" role="status">{status.message}</p>
      <p className="form-note">
        Already have an account? <Link className="text-link" href="/admin/login">Sign in to the dashboard</Link>
      </p>
    </form>
  );
}
