"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function RealtimeCasesListener({ branchId }: { branchId: string }) {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('realtime-cases')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deceased_cases',
          filter: `branch_id=eq.${branchId}`,
        },
        () => {
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [branchId, router, supabase])

  return null
}



