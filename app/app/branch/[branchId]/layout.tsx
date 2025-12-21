import { BranchNav } from "@/components/branch/nav"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default async function BranchLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ branchId: string }>
}) {
  const { branchId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verify access to this branch
  // @ts-ignore - Supabase type inference issue
  const { data: hasAccess } = await supabase.rpc('auth_user_has_branch', {
    branch_id_param: branchId
  })

  if (!hasAccess) {
    // If they don't have access, redirect to their assigned branch or logout
     return <div className="p-8">Access Denied to this branch.</div>
  }

  // Get Branch Name
  const { data: branch } = await supabase
    .from('branches')
    .select('name')
    .eq('id', branchId)
    .single()

  return (
    <div className="flex-col md:flex">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <h2 className="text-lg font-bold mr-6 truncate max-w-[200px]" title={branch?.name}>
            {branch?.name || 'Branch'}
          </h2>
          <BranchNav className="mx-6 flex-1 overflow-auto" />
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Breadcrumbs />
        {children}
      </div>
    </div>
  )
}


