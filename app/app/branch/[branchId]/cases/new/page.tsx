import { CaseForm } from "@/components/cases/case-form"

export default async function NewCasePage({
  params,
}: {
  params: Promise<{ branchId: string }>
}) {
  const { branchId } = await params

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">New Admission</h2>
      </div>
      <div className="grid gap-4">
        <CaseForm branchId={branchId} />
      </div>
    </div>
  )
}

