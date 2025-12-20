"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { UserActionCell } from "./user-action-cell"

export type Profile = {
    id: string
    full_name: string
    role: string
    phone: string | null
    is_active: boolean
    email?: string
}

export const columns: ColumnDef<Profile>[] = [
  {
    accessorKey: "full_name",
    header: "Name",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
            {row.getValue("role")?.toString().replace('_', ' ')}
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
  {
      id: "actions",
      cell: ({ row }) => <UserActionCell user={row.original} />
  }
]

