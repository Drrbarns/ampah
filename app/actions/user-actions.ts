'use server'

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Database } from "@/lib/supabase/database.types"

type ProfileInsert = Database['public']['Tables']['profiles']['Insert']

export async function createUserAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("full_name") as string
  const role = formData.get("role") as "super_admin" | "branch_admin" | "staff"
  const phone = formData.get("phone") as string
  const branchIds = formData.getAll("branch_ids") as string[] // For multi-select

  if (!email || !password || !fullName || !role) {
    return { error: "Missing required fields" }
  }

  try {
    const supabaseAdmin = createAdminClient()
    
    // 1. Create Auth User
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    })

    if (authError) throw authError
    if (!authUser.user) throw new Error("Failed to create user")

    // 2. Create Profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authUser.user.id,
        full_name: fullName,
        role: role,
        phone: phone,
        is_active: true
      })

    if (profileError) {
        // Cleanup auth user if profile creation fails? 
        // Ideally yes, but for now just throw
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
        throw profileError
    }

    // 3. Assign to Branches (if any)
    if (branchIds.length > 0 && role !== 'super_admin') {
        const assignments = branchIds.map(bid => ({
            user_id: authUser.user!.id,
            branch_id: bid,
            is_primary: false // Logic for primary can be improved
        }))

        const { error: assignError } = await supabaseAdmin
            .from("user_branch_assignments")
            .insert(assignments)
        
        if (assignError) throw assignError
    }

    revalidatePath("/app/super/users")
    return { success: true }
  } catch (error: any) {
    console.error("Create User Error:", error)
    return { error: error.message || "Failed to create user" }
  }
}

export async function updateUserAction(userId: string, formData: FormData) {
    const fullName = formData.get("full_name") as string
    const role = formData.get("role") as "super_admin" | "branch_admin" | "staff"
    const phone = formData.get("phone") as string
    const isActive = formData.get("is_active") === "on"

    const supabaseAdmin = createAdminClient()

    try {
        // Update Profile
        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .update({
                full_name: fullName,
                role: role,
                phone: phone,
                is_active: isActive
            })
            .eq("id", userId)

        if (profileError) throw profileError

        // Update Auth Metadata (optional but good practice)
        await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: { full_name: fullName }
        })

        revalidatePath("/app/super/users")
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function deleteUserAction(userId: string) {
    const supabaseAdmin = createAdminClient()

    // Deleting from Auth automatically cascades to profiles if set up, 
    // but usually profile has FK to auth.users ON DELETE CASCADE.
    // Check schema: "id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE" -> Yes.
    
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) return { error: error.message }

    revalidatePath("/app/super/users")
    return { success: true }
}
