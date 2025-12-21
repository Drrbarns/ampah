import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ branchId: string }>
}) {
  const { branchId } = await params
  const supabase = await createClient()
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() // 0-indexed

  // Fetch monthly payments
  // Note: Range filter would be better, doing full fetch for demo is risky in prod but okay for initial version
  const { data: payments } = await supabase
    .from("payments")
    .select("amount, paid_on")
    .eq("branch_id", branchId)
    // .gte('paid_on', new Date(currentYear, 0, 1).toISOString()) // This year

  const monthlyRevenue = new Array(12).fill(0)
  
  payments?.forEach(p => {
    const d = new Date(p.paid_on)
    if (d.getFullYear() === currentYear) {
        monthlyRevenue[d.getMonth()] += p.amount
    }
  })

  const totalYearlyRevenue = monthlyRevenue.reduce((a, b) => a + b, 0)

  return (
    <div className="flex-1 space-y-4">
       <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
      </div>

      <Tabs defaultValue="financial" className="space-y-4">
          <TabsList>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="operational">Operational</TabsTrigger>
          </TabsList>
          
          <TabsContent value="financial" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Revenue ({currentYear})</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <div className="text-2xl font-bold">{formatCurrency(totalYearlyRevenue)}</div>
                      </CardContent>
                  </Card>
              </div>

              <Card>
                  <CardHeader>
                      <CardTitle>Monthly Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="space-y-2">
                          {monthlyRevenue.map((amount, index) => (
                              <div key={index} className="flex items-center justify-between border-b pb-2">
                                  <span>{new Date(0, index).toLocaleString('default', { month: 'long' })}</span>
                                  <span className="font-medium">{formatCurrency(amount)}</span>
                              </div>
                          ))}
                      </div>
                  </CardContent>
              </Card>
          </TabsContent>
          
           <TabsContent value="operational">
               <Card>
                   <CardHeader>
                       <CardTitle>Coming Soon</CardTitle>
                   </CardHeader>
                   <CardContent>
                       Operational reports (Admissions vs Discharges, Gender stats) will appear here.
                   </CardContent>
               </Card>
           </TabsContent>
      </Tabs>
    </div>
  )
}




