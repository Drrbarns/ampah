import { createClient } from "@/lib/supabase/server"
import { columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

import { RealtimeCasesListener } from "@/components/cases/realtime-cases-listener"

export default async function CasesPage({
  params,
}: {
  params: Promise<{ branchId: string }>
}) {
  const { branchId } = await params
  const supabase = await createClient()

  const { data: cases } = await supabase
    .from("deceased_cases")
    .select("*")
    .eq("branch_id", branchId)
    .order("created_at", { ascending: false })

  return (
    <div className="flex-1 space-y-4">
      <RealtimeCasesListener branchId={branchId} />
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Cases</h2>
        <div className="flex items-center space-x-2">
           <Link href={`/app/branch/${branchId}/cases/new`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Case
            </Button>
           </Link>
        </div>
      </div>
      <DataTable 
        columns={columns} 
        data={cases || []} 
        searchKey="name_of_deceased"
        facetedFilters={[
            {
                column: "status",
                title: "Status",
                options: [
                    { label: "In Custody", value: "IN_CUSTODY" },
                    { label: "Discharged", value: "DISCHARGED" },
                    { label: "Cancelled", value: "CANCELLED" },
                    { label: "Archived", value: "ARCHIVED" },
                ]
            },
            {
                column: "type",
                title: "Type",
                options: [
                    { label: "Normal", value: "Normal" },
                    { label: "VIP", value: "VIP" },
                ]
            }
        ]}
      />
    </div>
  )
}


