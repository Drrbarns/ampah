"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function SuperAdminNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/app/super/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/app/super/dashboard"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Dashboard
      </Link>
      <Link
        href="/app/super/branches"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.startsWith("/app/super/branches")
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Branches
      </Link>
      <Link
        href="/app/super/users"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.startsWith("/app/super/users")
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Users
      </Link>
      <Link
        href="/app/super/reports"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.startsWith("/app/super/reports")
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Global Reports
      </Link>
      <Link
        href="/app/super/audit"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.startsWith("/app/super/audit")
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Audit Logs
      </Link>
      <Button variant="ghost" onClick={handleSignOut} className="ml-auto">
        Sign Out
      </Button>
    </nav>
  )
}


