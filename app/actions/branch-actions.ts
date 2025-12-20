'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createBranchAction(formData: FormData) {
  const name = formData.get("name") as string
  const code = formData.get("code") as string
  const address = formData.get("address") as string
  const phone = formData.get("phone") as string

  if (!name || !code) {
    return { error: "Name and Code are required" }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("branches")
    .insert({
        name,
        code,
        address,
        phone,
        is_active: true
    })

  if (error) {
      if (error.code === '23505') {
          return { error: "Branch code already exists" }
      }
      return { error: error.message }
  }

  revalidatePath("/app/super/branches")
  return { success: true }
}

export async function updateBranchAction(branchId: string, formData: FormData) {
    const name = formData.get("name") as string
    const code = formData.get("code") as string
    const address = formData.get("address") as string
    const phone = formData.get("phone") as string
    
    if (!name || !code) return { error: "Name and Code are required" }

    const supabase = await createClient()
    
    const { error } = await supabase
        .from("branches")
        .update({ name, code, address, phone })
        .eq("id", branchId)

    if (error) return { error: error.message }

    revalidatePath("/app/super/branches")
    return { success: true }
}

export async function deleteBranchAction(branchId: string) {
    const supabase = await createClient()
    
    // Check for dependencies (users, cases) before deleting?
    // FK constraints usually block delete if RESTRICT is set.
    // Assuming RESTRICT on cases.
    
    const { error } = await supabase
        .from("branches")
        .delete()
        .eq("id", branchId)

    if (error) {
        if (error.code === '23503') { // Foreign Key Violation
            return { error: "Cannot delete branch with active cases or assigned users." }
        }
        return { error: error.message }
    }

    revalidatePath("/app/super/branches")
    return { success: true }
}
