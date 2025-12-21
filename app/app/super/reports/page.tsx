import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Overview } from "@/components/dashboard/overview"
import { DateRangePicker } from "@/components/ui/date-range-picker" // Need to create this or use a simple one
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function GlobalReportsPage() {
  const supabase = await createClient()
  
  // Fetch global financial data
  const { data: payments } = await supabase
    .from("payments")
    .select("amount, paid_on, branch_id, branches(name)")
    .order("paid_on", { ascending: true })

  // Calculate totals
  const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0
  
  // Aggregate by Branch
  const branchRevenue: Record<string, number> = {}
  payments?.forEach(p => {
      const branchName = p.branches?.name || "Unknown"
      branchRevenue[branchName] = (branchRevenue[branchName] || 0) + p.amount
  })

  const branchChartData = Object.entries(branchRevenue).map(([name, total]) => ({
      name,
      total
  }))

  // Aggregate by Month (Current Year)
  const currentYear = new Date().getFullYear()
  const monthlyRevenue = new Array(12).fill(0)
  payments?.forEach(p => {
      const d = new Date(p.paid_on)
      if (d.getFullYear() === currentYear) {
          monthlyRevenue[d.getMonth()] += p.amount
      }
  })
  
  const monthlyChartData = monthlyRevenue.map((total, index) => ({
      name: new Date(0, index).toLocaleString('default', { month: 'short' }),
      total
  }))

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Global Reports</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue (Lifetime)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="branches">By Branch</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Revenue ({currentYear})</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <Overview data={monthlyChartData} />
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="branches" className="space-y-4">
             <Card>
                <CardHeader>
                    <CardTitle>Revenue by Branch</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <Overview data={branchChartData} />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}



