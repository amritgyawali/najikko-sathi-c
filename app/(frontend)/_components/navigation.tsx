"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
/** Nav links are resolved on the server (CMS, or the static fallback). */
type NavItem = { label: string; href: string; newTab?: boolean };

export function Navigation({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [openForPath, setOpenForPath] = useState<string | null>(null);
  const open = openForPath === pathname;

  return (
    <>
      <button className="menu-toggle" type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpenForPath(open ? null : pathname)}>
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      <nav id="primary-navigation" className={`primary-nav${open ? " is-open" : ""}`} aria-label="Primary navigation" onKeyDown={(event) => { if (event.key === "Escape") { setOpenForPath(null); document.querySelector<HTMLButtonElement>(".menu-toggle")?.focus(); } }}>
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
          return <Link key={`${item.label}-${item.href}`} href={item.href} target={item.newTab ? "_blank" : undefined} rel={item.newTab ? "noreferrer" : undefined} className={active ? "active" : undefined} aria-current={active ? "page" : undefined} onClick={() => setOpenForPath(null)}>{item.label}</Link>;
        })}
      </nav>
    </>
  );
}
