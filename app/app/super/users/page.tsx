import { createClient } from "@/lib/supabase/server"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserDialog } from "./user-form"
import { columns } from "./columns"

export default async function UsersPage() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name")

  const { data: branches } = await supabase
    .from("branches")
    .select("id, name")
    .order("name")

  return (
    <div className="flex-1 space-y-4">
       <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <UserDialog branches={branches || []} />
      </div>

      <Card>
          <CardHeader>
              <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
              <DataTable columns={columns} data={profiles || []} searchKey="full_name" />
          </CardContent>
      </Card>
    </div>
  )
}

