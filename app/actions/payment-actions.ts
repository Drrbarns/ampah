'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deletePaymentAction(paymentId: string, branchId: string) {
  const supabase = await createClient()

  // Verify permission (RLS usually handles this, but server action should be defensive)
  // Check if user belongs to branch or is super_admin
  
  const { error } = await supabase
    .from("payments")
    .delete()
    .eq("id", paymentId)
    .eq("branch_id", branchId) // Extra safety

  if (error) {
      return { error: error.message }
  }

  revalidatePath(`/app/branch/${branchId}/payments`)
  // Also revalidate cases list as balances change
  revalidatePath(`/app/branch/${branchId}/cases`)
  
  return { success: true }
}

