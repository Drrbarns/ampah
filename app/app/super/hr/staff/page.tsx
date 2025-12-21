import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { StaffDialog } from "./staff-dialog"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function StaffDirectoryPage() {
  const supabase = await createClient()

  // Fetch all staff with their extended profiles
  const { data: staff } = await supabase
    .from("profiles")
    .select(`
      *,
      employee_profiles (
        employee_id,
        department,
        position,
        employment_type,
        date_hired,
        employment_status,
        base_salary
      )
    `)
    .order("full_name")

  const { data: branches } = await supabase
    .from("branches")
    .select("id, name")
    .order("name")

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/app/super/hr">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">Staff Directory</h2>
          <p className="text-muted-foreground">
            Manage all employee profiles and information
          </p>
        </div>
        <StaffDialog branches={branches || []} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={staff || []} 
            searchKey="full_name" 
          />
        </CardContent>
      </Card>
    </div>
  )
}

