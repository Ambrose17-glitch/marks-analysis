"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { School } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <School className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">BGLC Marks System</span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/"
          className={cn(
            "transition-colors hover:text-primary",
            pathname === "/" ? "text-primary" : "text-muted-foreground",
          )}
        >
          Dashboard
        </Link>
        <Link
          href="/pupils"
          className={cn(
            "transition-colors hover:text-primary",
            pathname?.startsWith("/pupils") ? "text-primary" : "text-muted-foreground",
          )}
        >
          Pupils
        </Link>
        <Link
          href="/marks"
          className={cn(
            "transition-colors hover:text-primary",
            pathname?.startsWith("/marks") ? "text-primary" : "text-muted-foreground",
          )}
        >
          Marks Entry
        </Link>
        <Link
          href="/reports"
          className={cn(
            "transition-colors hover:text-primary",
            pathname?.startsWith("/reports") ? "text-primary" : "text-muted-foreground",
          )}
        >
          Reports
        </Link>
      </nav>
    </div>
  )
}
