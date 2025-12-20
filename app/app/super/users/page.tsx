import { createClient } from "@/lib/supabase/server"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { CreateUserDialog } from "./user-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Profile = {
    id: string
    full_name: string
    role: string
    phone: string | null
    is_active: boolean
    email?: string // Fetched separately or via join if View
}

const columns: ColumnDef<Profile>[] = [
  {
    accessorKey: "full_name",
    header: "Name",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
            {row.getValue("role").toString().replace('_', ' ')}
        </Badge>
    )
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
        <Badge variant={row.getValue("is_active") ? "default" : "secondary"}>
            {row.getValue("is_active") ? "Active" : "Inactive"}
        </Badge>
    )
  },
]

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
        <CreateUserDialog branches={branches || []} />
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

