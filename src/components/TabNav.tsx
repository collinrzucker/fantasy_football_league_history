"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Career Records" },
  { href: "/seasons", label: "Season History" },
  { href: "/draft", label: "Draft Order" },
  { href: "/keepers", label: "Keepers" },
  { href: "/head-to-head", label: "Head-to-Head" },
];

export function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border">
      <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-6">
        {TABS.map((tab) => {
          const isActive =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`shrink-0 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-seq-450 text-text-primary"
                  : "border-transparent text-text-muted hover:text-text-secondary"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
