import { createClient } from "@/lib/supabase/server"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { formatDateTime } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type AuditLog = {
    id: string
    action: string
    entity_type: string
    created_at: string
    actor_id: string
    profiles: {
        full_name: string
    } | null
    branches: {
        name: string
    } | null
}

const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "created_at",
    header: "Date/Time",
    cell: ({ row }) => formatDateTime(row.getValue("created_at")),
  },
  {
    accessorKey: "action",
    header: "Action",
     cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("action")}</Badge>
    )
  },
  {
    accessorKey: "entity_type",
    header: "Entity",
  },
  {
    accessorFn: (row) => row.profiles?.full_name || "Unknown",
    header: "User",
  },
  {
    accessorFn: (row) => row.branches?.name || "System/Global",
    header: "Branch",
  },
]

export default async function AuditPage() {
  const supabase = await createClient()

  // Note: For real production, use pagination. We'll limit to 100 for now.
  const { data: logs } = await supabase
    .from("audit_logs")
    .select("*, profiles(full_name), branches(name)")
    .order("created_at", { ascending: false })
    .limit(100)

  return (
    <div className="flex-1 space-y-4">
       <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
      </div>

      <Card>
          <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
              <DataTable columns={columns} data={(logs as any) || []} searchKey="action" />
          </CardContent>
      </Card>
    </div>
  )
}



