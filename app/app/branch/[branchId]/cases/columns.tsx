"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Database } from "@/lib/supabase/database.types"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

// Type for our case data
type Case = Database["public"]["Tables"]["deceased_cases"]["Row"]

export const columns: ColumnDef<Case>[] = [
  {
    accessorKey: "tag_no",
    header: "Tag No.",
  },
  {
    accessorKey: "name_of_deceased",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "gender",
    header: "Gender",
  },
  {
    accessorKey: "admission_date",
    header: "Admission Date",
    cell: ({ row }) => formatDate(row.getValue("admission_date")),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === "IN_CUSTODY" ? "default" : status === "DISCHARGED" ? "secondary" : "outline"}>
          {status}
        </Badge>
      )
    }
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => formatCurrency(row.getValue("balance")),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const caseItem = row.original

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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(caseItem.tag_no)}
            >
              Copy Tag No
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Link href={`/app/branch/${caseItem.branch_id}/cases/${caseItem.id}`}>
               <DropdownMenuItem>View Details</DropdownMenuItem>
            </Link>
             <Link href={`/app/branch/${caseItem.branch_id}/payments?caseId=${caseItem.id}`}>
               <DropdownMenuItem>Add Payment</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]


