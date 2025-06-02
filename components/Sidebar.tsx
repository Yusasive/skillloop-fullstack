"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // optional utility to handle classnames

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Profile", href: "/profile/me" }, 
  { label: "Match", href: "/match" },
  { label: "Sessions", href: "/session" },
  { label: "Certificates", href: "/certificates" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-gray-100 p-4 border-r">
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "block px-4 py-2 rounded hover:bg-gray-200",
                pathname.startsWith(item.href)
                  ? "bg-gray-300 font-semibold"
                  : ""
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
