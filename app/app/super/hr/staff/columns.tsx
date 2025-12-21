"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

type Staff = {
  id: string
  full_name: string
  email: string
  role: string
  phone: string | null
  is_active: boolean
  employee_profiles: {
    employee_id: string
    department: string | null
    position: string | null
    employment_type: string | null
    employment_status: string
    base_salary: number | null
  }[] | null
}

export const columns: ColumnDef<Staff>[] = [
  {
    accessorKey: "full_name",
    header: "Name",
  },
  {
    accessorKey: "employee_profiles",
    header: "Employee ID",
    cell: ({ row }) => {
      const profile = row.original.employee_profiles?.[0]
      return profile?.employee_id || "-"
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "employee_profiles",
    header: "Department",
    cell: ({ row }) => {
      const profile = row.original.employee_profiles?.[0]
      return profile?.department || "-"
    },
  },
  {
    accessorKey: "employee_profiles",
    header: "Position",
    cell: ({ row }) => {
      const profile = row.original.employee_profiles?.[0]
      return profile?.position || "-"
    },
  },
  {
    accessorKey: "role",
    header: "System Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      return (
        <Badge variant={role === "super_admin" ? "default" : "secondary"}>
          {role.replace("_", " ")}
        </Badge>
      )
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean
      const profile = row.original.employee_profiles?.[0]
      const status = profile?.employment_status || "unknown"
      
      return (
        <Badge variant={isActive && status === "active" ? "default" : "secondary"}>
          {isActive && status === "active" ? "Active" : status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const staff = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <Link href={`/app/super/hr/staff/${staff.id}`}>
              <DropdownMenuItem>View Profile</DropdownMenuItem>
            </Link>
            <DropdownMenuItem>Edit Details</DropdownMenuItem>
            <DropdownMenuSeparator />
            <Link href={`/app/super/hr/attendance?employee=${staff.id}`}>
              <DropdownMenuItem>View Attendance</DropdownMenuItem>
            </Link>
            <Link href={`/app/super/hr/leave?employee=${staff.id}`}>
              <DropdownMenuItem>Leave History</DropdownMenuItem>
            </Link>
            <Link href={`/app/super/hr/payroll?employee=${staff.id}`}>
              <DropdownMenuItem>Payroll Records</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

