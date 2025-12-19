import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Branch = {
    id: string
    name: string
    code: string
    address: string | null
    phone: string | null
    is_active: boolean
}

const columns: ColumnDef<Branch>[] = [
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "address",
    header: "Address",
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
        <Button disabled>Add Branch (Coming Soon)</Button>
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

