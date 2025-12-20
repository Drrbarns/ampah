import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, Wallet, UserMinus } from "lucide-react"

export default async function BranchDashboardPage({
  params,
}: {
  params: Promise<{ branchId: string }>
}) {
  const { branchId } = await params
  const supabase = await createClient()

  // 1. Total Registration Amount (Total Bill for all cases? Or just 'Admissions'?
  // Let's assume Total Bill generated in this branch
  const { data: branchFinancials } = await supabase
    .from('deceased_cases')
    .select('total_bill, balance, storage_fee')
    .eq('branch_id', branchId)

  const totalRegistrationAmount = branchFinancials?.reduce((sum, c) => sum + (c.total_bill || 0), 0) || 0
  const totalStorageAmount = branchFinancials?.reduce((sum, c) => sum + (c.storage_fee || 0), 0) || 0
  
  // 2. Counts
  const { count: totalAdmissions } = await supabase
    .from('deceased_cases')
    .select('*', { count: 'exact', head: true })
    .eq('branch_id', branchId)

  const { count: dischargedCount } = await supabase
    .from('deceased_cases')
    .select('*', { count: 'exact', head: true })
    .eq('branch_id', branchId)
    .eq('status', 'DISCHARGED')

  const { count: inCustodyCount } = await supabase
    .from('deceased_cases')
    .select('*', { count: 'exact', head: true })
    .eq('branch_id', branchId)
    .eq('status', 'IN_CUSTODY')

  // Recent Activity
  const { data: recentCases } = await supabase
    .from('deceased_cases')
    .select('id, tag_no, name_of_deceased, admission_date, status')
    .eq('branch_id', branchId)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: recentPayments } = await supabase
    .from('payments')
    .select('id, receipt_no, amount, paid_on, deceased_cases(name_of_deceased, tag_no)')
    .eq('branch_id', branchId)
    .order('paid_on', { ascending: false })
    .limit(5)

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Link href={`/app/branch/${branchId}/cases/new`}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Admission
            </Button>
          </Link>
          <Link href={`/app/branch/${branchId}/payments`}>
             <Button variant="secondary">
              <Wallet className="mr-2 h-4 w-4" />
              Payments
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              In Custody
            </CardTitle>
            <UserMinus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inCustodyCount}</div>
            <p className="text-xs text-muted-foreground">
              Current bodies in morgue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Admissions
            </CardTitle>
            <PlusCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAdmissions}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Discharged
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
               <path d="M9 11l3 3L22 4" />
               <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dischargedCount}</div>
            <p className="text-xs text-muted-foreground">
              Successfully discharged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Billed
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRegistrationAmount)}</div>
             <p className="text-xs text-muted-foreground">
              Cumulative bills
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Admissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCases?.map((c) => (
                <Link key={c.id} href={`/app/branch/${branchId}/cases/${c.id}`}>
                  <div className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer">
                    <div>
                      <div className="font-medium">{c.tag_no} - {c.name_of_deceased}</div>
                      <div className="text-xs text-muted-foreground">{formatCurrency(0)} • {c.status}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{c.admission_date}</div>
                  </div>
                </Link>
              ))}
              {(!recentCases || recentCases.length === 0) && (
                <div className="text-center text-muted-foreground text-sm py-4">No recent admissions</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments?.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.receipt_no}</div>
                    <div className="text-xs text-muted-foreground">{p.deceased_cases?.tag_no}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">{formatCurrency(p.amount)}</div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(0)}</div>
                  </div>
                </div>
              ))}
              {(!recentPayments || recentPayments.length === 0) && (
                <div className="text-center text-muted-foreground text-sm py-4">No recent payments</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


