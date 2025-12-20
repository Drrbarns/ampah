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

