"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function BranchNav({
  className,
  branchId,
  ...props
}: React.HTMLAttributes<HTMLElement> & { branchId: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

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
    </nav>
  )
}


