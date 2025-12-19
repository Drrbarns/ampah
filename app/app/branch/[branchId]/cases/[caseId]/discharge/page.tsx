import { createClient } from "@/lib/supabase/server"
import { DischargeForm } from "@/components/cases/discharge-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Database } from "@/lib/supabase/database.types"

export default async function DischargePage({
  params,
}: {
  params: Promise<{ branchId: string; caseId: string }>
}) {
  const { branchId, caseId } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from("deceased_cases")
    .select("*")
    .eq("id", caseId)
    .single()

  const caseDetails = data as Database['public']['Tables']['deceased_cases']['Row'] | null

  const { data: charges } = await supabase
    .from("case_charges")
    .select("*")
    .eq("case_id", caseId)

  if (!caseDetails) {
    return <div>Case not found</div>
  }

  return (
    <div className="flex-1 space-y-4 max-w-2xl mx-auto">
       <div className="flex items-center space-x-2 mb-6">
            <Link href={`/app/branch/${branchId}/cases/${caseId}`}>
                <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <h2 className="text-3xl font-bold tracking-tight">Discharge Case</h2>
        </div>

      <Card>
        <CardHeader>
            <CardTitle>{caseDetails.tag_no} - {caseDetails.name_of_deceased}</CardTitle>
        </CardHeader>
        <CardContent>
            <DischargeForm 
                branchId={branchId} 
                caseId={caseId} 
                caseData={caseDetails} 
                charges={charges || []} 
            />
        </CardContent>
      </Card>
    </div>
  )
}

