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
    // @ts-ignore - Supabase type inference issue
    .insert({
        name,
        code,
        address: address || null,
        phone: phone || null,
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
        // @ts-ignore - Supabase type inference issue
        .update({ name, code, address: address || null, phone: phone || null })
        .eq("id", branchId)

    if (error) return { error: error.message }

    revalidatePath("/app/super/branches")
    return { success: true }
}

export async function deleteBranchAction(branchId: string) {
    const supabase = await createClient()
    
    const { error } = await supabase
        .from("branches")
        .delete()
        .eq("id", branchId)

    if (error) {
        if (error.code === '23503') {
            return { error: "Cannot delete branch with active cases or assigned users." }
        }
        return { error: error.message }
    }

    revalidatePath("/app/super/branches")
    return { success: true }
}

