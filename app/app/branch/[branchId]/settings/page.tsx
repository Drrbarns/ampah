import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ branchId: string }>
}) {
  const { branchId } = await params
  const supabase = await createClient()

  const { data: services } = await supabase
    .from("services_catalog")
    .select("*")
    .eq("branch_id", branchId)
    .order("name")

  return (
    <div className="flex-1 space-y-4">
       <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
          <Card>
              <CardHeader>
                  <CardTitle>Service Catalog (Pricing)</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                      {services?.map((service) => (
                          <div key={service.id} className="grid grid-cols-3 gap-2 items-center border-b pb-2">
                              <div className="font-medium">{service.name}</div>
                              <div className="text-sm text-muted-foreground">{service.pricing_model}</div>
                              <div className="text-right font-mono">{service.unit_price}</div>
                          </div>
                      ))}
                      {/* Add/Edit form would go here */}
                      <Button className="mt-4" variant="outline" disabled>Manage Services (Coming Soon)</Button>
                  </div>
              </CardContent>
          </Card>

          <Card>
              <CardHeader>
                  <CardTitle>Receipt Configuration</CardTitle>
              </CardHeader>
               <CardContent>
                   <div className="space-y-4">
                       <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label>Payment Prefix</Label>
                            <Input type="text" value="ADM-PAY-" disabled />
                        </div>
                         <Button className="mt-4" variant="outline" disabled>Update Configuration (Coming Soon)</Button>
                   </div>
               </CardContent>
          </Card>
      </div>
    </div>
  )
}

