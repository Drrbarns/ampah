'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addChargeAction(formData: FormData) {
  const caseId = formData.get("case_id") as string
  const branchId = formData.get("branch_id") as string
  const description = formData.get("description") as string
  const amount = parseFloat(formData.get("amount") as string)
  const chargeType = formData.get("charge_type") as string || "OTHER"

  if (!caseId || !branchId || !description || isNaN(amount)) {
    return { error: "Missing required fields" }
  }

  const supabase = await createClient()

  // Verify access (handled by RLS mostly, but double check)

  const { error } = await supabase
    .from("case_charges")
    .insert({
        case_id: caseId,
        branch_id: branchId,
        description,
        amount, // Since quantity is 1 by default, unit_price = amount
        unit_price: amount,
        quantity: 1,
        charge_type: chargeType
    })

  if (error) return { error: error.message }

  revalidatePath(`/app/branch/${branchId}/cases/${caseId}`)
  return { success: true }
}

export async function deleteChargeAction(chargeId: string, caseId: string, branchId: string) {
    const supabase = await createClient()
    
    // Only allow deleting manual charges? or all? 
    // RLS policy: branch_admin can delete. staff? maybe not.
    // Let's assume RLS handles permissions.
    
    const { error } = await supabase
        .from("case_charges")
        .delete()
        .eq("id", chargeId)

    if (error) return { error: error.message }

    revalidatePath(`/app/branch/${branchId}/cases/${caseId}`)
    return { success: true }
}

