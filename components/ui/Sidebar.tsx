"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function Sidebar() {
  const pathname = usePathname()

  const links = [
    { href: "/dashboard", label: "Accueil" },
    { href: "/dashboard/audit", label: "Audit IA" },
    { href: "/dashboard/projects", label: "Projets IA" },
    { href: "/dashboard/reports", label: "Rapports" },
  ]

  return (
    <aside className="w-64 bg-white shadow-md p-6 flex flex-col gap-6">
      <h1 className="text-xl font-bold">Concordia AI</h1>

      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            <button
              className={`w-full text-left p-2 rounded-md ${
                pathname === link.href ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"
              }`}
            >
              {link.label}
            </button>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
