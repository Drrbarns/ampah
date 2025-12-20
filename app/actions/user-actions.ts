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

export async function updateUserRoleAction(userId: string, role: "super_admin" | "branch_admin" | "staff") {
    const supabase = await createClient() // Use regular client to check permission first
    
    // Check if current user is super_admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }
    
    const { data: currentUserProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
        
    if (currentUserProfile?.role !== 'super_admin') {
        return { error: "Unauthorized" }
    }

    // Perform update
    const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId)

    if (error) return { error: error.message }
    
    revalidatePath("/app/super/users")
    return { success: true }
}

