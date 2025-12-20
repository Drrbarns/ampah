'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Database } from "@/lib/supabase/database.types"

type ServiceInsert = Database['public']['Tables']['services_catalog']['Insert']

export async function upsertServiceAction(data: ServiceInsert) {
  const supabase = await createClient()

  // Basic validation
  if (!data.name || !data.unit_price) {
    return { error: "Missing required fields" }
  }

  // Check permission (RLS handles it, but good to be defensive if needed)
  
  const { error } = await supabase
    .from("services_catalog")
    .upsert(data)

  if (error) {
      console.error(error)
      return { error: error.message }
  }

  revalidatePath(`/app/branch/${data.branch_id}/settings`)
  return { success: true }
}

export async function deleteServiceAction(serviceId: string, branchId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("services_catalog")
        .delete()
        .eq("id", serviceId)
    
    if (error) return { error: error.message }

    revalidatePath(`/app/branch/${branchId}/settings`)
    return { success: true }
}

