import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, Wallet, LogOut, Printer } from "lucide-react"

export default async function CaseDetailsPage({
  params,
}: {
  params: Promise<{ branchId: string; caseId: string }>
}) {
  const { branchId, caseId } = await params
  const supabase = await createClient()

  // Fetch Case Details
  const { data: caseDetails } = await supabase
    .from("deceased_cases")
    .select("*")
    .eq("id", caseId)
    .single()

  if (!caseDetails) {
    return <div>Case not found</div>
  }

  // Fetch Charges
  const { data: charges } = await supabase
    .from("case_charges")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true })

  // Fetch Payments
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("case_id", caseId)
    .order("paid_on", { ascending: true })

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
            <Link href={`/app/branch/${branchId}/cases`}>
                <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <h2 className="text-3xl font-bold tracking-tight">Case: {caseDetails.tag_no}</h2>
            <Badge variant={caseDetails.status === "IN_CUSTODY" ? "default" : "secondary"}>
                {caseDetails.status}
            </Badge>
        </div>
        <div className="flex items-center space-x-2">
            <Link href={`/app/branch/${branchId}/payments?caseId=${caseId}`}>
                <Button variant="outline">
                    <Wallet className="mr-2 h-4 w-4" />
                    Add Payment
                </Button>
            </Link>
             <Link href={`/app/branch/${branchId}/cases/${caseId}/discharge`}>
                <Button variant="default" disabled={caseDetails.status !== "IN_CUSTODY"}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Discharge
                </Button>
            </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Left Column: Details */}
        <div className="col-span-4 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Deceased Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Name</div>
                        <div className="text-lg">{caseDetails.name_of_deceased}</div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Gender</div>
                        <div>{caseDetails.gender}</div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Age</div>
                        <div>{caseDetails.age}</div>
                    </div>
                     <div>
                        <div className="text-sm font-medium text-muted-foreground">Type</div>
                        <div>{caseDetails.type}</div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Place/Town</div>
                        <div>{caseDetails.place || '-'}</div>
                    </div>
                     <div>
                        <div className="text-sm font-medium text-muted-foreground">Admission Date</div>
                        <div>{formatDate(caseDetails.admission_date)} {caseDetails.admission_time}</div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Relative Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Name</div>
                        <div>{caseDetails.relative_name}</div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Contact</div>
                        <div>{caseDetails.relative_contact}</div>
                    </div>
                    {caseDetails.relative_contact_secondary && (
                        <div className="col-span-2">
                             <div className="text-sm font-medium text-muted-foreground">Secondary Contact</div>
                            <div>{caseDetails.relative_contact_secondary}</div>
                        </div>
                    )}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Timeline & Charges</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {charges?.map((charge) => (
                            <div key={charge.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                <div>
                                    <div className="font-medium">{charge.description}</div>
                                    <div className="text-xs text-muted-foreground">{formatDate(charge.applied_on)}</div>
                                </div>
                                <div className="font-medium">{formatCurrency(charge.amount || 0)}</div>
                            </div>
                        ))}
                         <div className="flex items-center justify-between pt-4">
                            <div className="font-bold">Total Bill</div>
                            <div className="font-bold">{formatCurrency(caseDetails.total_bill || 0)}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Right Column: Financials & Payments */}
        <div className="col-span-3 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Storage Fee ({caseDetails.storage_days} days)</span>
                        <span>{formatCurrency(caseDetails.storage_fee || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Embalming Fee</span>
                        <span>{formatCurrency(caseDetails.embalming_fee || 0)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Coldroom Fee</span>
                        <span>{formatCurrency(caseDetails.coldroom_fee || 0)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total Bill</span>
                        <span>{formatCurrency(caseDetails.total_bill || 0)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                        <span>Total Paid</span>
                        <span>{formatCurrency(caseDetails.total_paid || 0)}</span>
                    </div>
                     <Separator />
                     <div className="flex justify-between font-bold text-red-600 text-xl">
                        <span>Balance</span>
                        <span>{formatCurrency(caseDetails.balance || 0)}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="space-y-4">
                        {payments?.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                <div>
                                    <div className="font-medium">{payment.receipt_no}</div>
                                    <div className="text-xs text-muted-foreground">{formatDateTime(payment.paid_on)} - {payment.method}</div>
                                </div>
                                <div className="font-medium text-green-600">{formatCurrency(payment.amount)}</div>
                            </div>
                        ))}
                        {(!payments || payments.length === 0) && (
                            <div className="text-center text-muted-foreground text-sm">No payments recorded yet.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}


