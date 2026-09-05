"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { business } from "../_data/site";
import { servicePortfolio } from "../_data/services";

export function ContactForm() {
  const searchParams = useSearchParams();
  const requested = searchParams.get("service") ?? "General inquiry";
  const options = ["General inquiry", "Production", "Training", "Right Sanchar", ...servicePortfolio.map((service) => service.title)];
  const initialService = options.includes(requested) ? requested : "General inquiry";
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = `${String(data.get("service"))} inquiry | ${String(data.get("name")).trim()}`;
    const body = `Name: ${String(data.get("name")).trim()}\nEmail: ${String(data.get("email")).trim()}\nService: ${String(data.get("service"))}\n\n${String(data.get("message")).trim()}`;
    window.location.href = `mailto:${business.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setMessage(`Your email app has been requested. Review and send the draft there. If it did not open, email ${business.email} directly.`);
  }

  return <form className="inquiry-form" onSubmit={handleSubmit}>
    <h2>Prepare your inquiry</h2><p>Use this form to open a draft in your email app. You review and send the message there.</p>
    <div className="form-row"><label>Your name<input name="name" autoComplete="name" required maxLength={100} /></label><label>Your email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label></div>
    <label>What can we help with?<select name="service" key={initialService} defaultValue={initialService}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>
    <label>Tell us about your project<textarea name="message" rows={6} required minLength={10} maxLength={1800} placeholder="Your idea, audience, preferred timing, and any details that will help us understand the scope." /></label>
    <button className="primary-button" type="submit">Open email draft <ArrowUpRight aria-hidden="true" /></button>
    <p className="form-note">This form does not send or store your information on this website.</p>
    <p className="form-status" role="status">{message}</p>
  </form>;
}
