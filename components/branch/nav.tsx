"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function BranchNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const branchId = params.branchId as string

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
        href={`/app/branch/${branchId}/dashboard`}
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.endsWith("/dashboard")
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Dashboard
      </Link>
      <Link
        href={`/app/branch/${branchId}/cases`}
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.includes("/cases")
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Cases
      </Link>
      <Link
        href={`/app/branch/${branchId}/payments`}
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.includes("/payments")
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Payments
      </Link>
      <Link
        href={`/app/branch/${branchId}/reports`}
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.includes("/reports")
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Reports
      </Link>
      <Link
        href={`/app/branch/${branchId}/settings`}
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.includes("/settings")
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Settings
      </Link>
      <Button variant="ghost" onClick={handleSignOut} className="ml-auto">
        Sign Out
      </Button>
    </nav>
  )
}

