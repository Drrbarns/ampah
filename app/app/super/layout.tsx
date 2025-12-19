import { SuperAdminNav } from "@/components/super-admin/nav"
import { UserNav } from "@/components/user-nav" // We need to create this or just use a simple logout button in nav for now.
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Double check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "super_admin") {
    redirect("/app")
  }

  return (
    <div className="flex-col md:flex">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <h2 className="text-lg font-bold mr-6">Mortuary Sys (Super)</h2>
          <SuperAdminNav className="mx-6" />
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">
        {children}
      </div>
    </div>
  )
}
