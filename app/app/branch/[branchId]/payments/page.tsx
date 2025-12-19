import { createClient } from "@/lib/supabase/server"
import { PaymentForm } from "@/components/payments/payment-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils"
import { Database } from "@/lib/supabase/database.types"

type Payment = Database["public"]["Tables"]["payments"]["Row"] & {
    deceased_cases: {
        name_of_deceased: string
        tag_no: string
    } | null
}

const columns: ColumnDef<Payment>[] = [
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
]

export default async function PaymentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ branchId: string }>
  searchParams: Promise<{ caseId?: string }>
}) {
  const { branchId } = await params
  const { caseId } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("payments")
    .select("*, deceased_cases(name_of_deceased, tag_no)")
    .eq("branch_id", branchId)
    .order("paid_on", { ascending: false })

  if (caseId) {
    query = query.eq("case_id", caseId)
  }

  const { data: payments } = await query

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Record New Payment</CardTitle>
            </CardHeader>
            <CardContent>
                <PaymentForm branchId={branchId} preselectedCaseId={caseId} />
            </CardContent>
        </Card>

        <Card className="md:col-span-5">
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                <DataTable columns={columns} data={(payments as any) || []} searchKey="receipt_no" />
            </CardContent>
        </Card>
      </div>
    </div>
  )
}

