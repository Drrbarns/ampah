"use client"

import { ColumnDef } from "@tanstack/react-table"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { Database } from "@/lib/supabase/database.types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash } from "lucide-react"
import { deletePaymentAction } from "@/app/actions/payment-actions"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

type Payment = Database["public"]["Tables"]["payments"]["Row"] & {
    deceased_cases: {
        name_of_deceased: string
        tag_no: string
    } | null
}

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "receipt_no",
    header: "Receipt No",
  },
  {
    accessorKey: "paid_on",
    header: "Date",
    cell: ({ row }) => formatDateTime(row.getValue("paid_on")),
  },
  {
    accessorFn: (row) => row.deceased_cases?.tag_no,
    header: "Tag No",
  },
  {
    accessorFn: (row) => row.deceased_cases?.name_of_deceased,
    header: "Payer/Deceased",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => formatCurrency(row.getValue("amount")),
  },
  {
    accessorKey: "method",
    header: "Method",
  },
  {
    accessorKey: "allocation",
    header: "Allocation",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original
      const { toast } = useToast()
      const router = useRouter()

      const handleDelete = async () => {
          if (!confirm("Are you sure you want to void/delete this payment? This will update the case balance.")) return

          const res = await deletePaymentAction(payment.id, payment.branch_id)
          if (res.error) {
              toast({
                  variant: "destructive",
                  title: "Error",
                  description: res.error
              })
          } else {
              toast({
                  title: "Success",
                  description: "Payment voided."
              })
              router.refresh()
          }
      }

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.receipt_no)}>
              Copy Receipt No
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Void Payment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]



