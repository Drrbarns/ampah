import { createClient } from "@/lib/supabase/server"
import { CaseForm } from "@/components/cases/case-form"
import { notFound } from "next/navigation"

export default async function EditCasePage({
  params,
}: {
  params: Promise<{ branchId: string; caseId: string }>
}) {
  const { branchId, caseId } = await params
  const supabase = await createClient()

  const { data: caseDetails } = await supabase
    .from("deceased_cases")
    .select("*")
    .eq("id", caseId)
    .single()

  if (!caseDetails) {
    return notFound()
  }

  // Transform to form values format if necessary
  // CaseForm expects specific types, checking compatibility
  const caseData = caseDetails as any
  const initialData = {
      ...caseData,
      // Ensure time format is HH:MM
      admission_time: caseData.admission_time?.slice(0, 5) || ""
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Case</h2>
      </div>
      <div className="grid gap-4">
        <CaseForm branchId={branchId} initialData={initialData as any} isEdit />
      </div>
    </div>
  )
}


