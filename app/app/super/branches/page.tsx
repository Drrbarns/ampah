import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { BranchDialog } from "./branch-dialog"
import { columns } from "./columns"

export default async function BranchesPage() {
  const supabase = await createClient()
  
  const { data: branches } = await supabase
    .from("branches")
    .select("*")
    .order("name")

  return (
    <div className="flex-1 space-y-4">
       <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Branches</h2>
        <BranchDialog />
      </div>

      <Card>
          <CardHeader>
              <CardTitle>All Branches</CardTitle>
          </CardHeader>
          <CardContent>
              <DataTable columns={columns} data={branches || []} searchKey="name" />
          </CardContent>
      </Card>
    </div>
  )
}


