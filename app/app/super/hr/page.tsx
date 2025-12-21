import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Users, Calendar, FileText, DollarSign, TrendingUp, GraduationCap, Plus } from "lucide-react"

export default async function HRManagementPage() {
  const supabase = await createClient()

  // Get employee counts
  const { count: totalEmployees } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)

  const { count: activeEmployees } = await supabase
    .from("employee_profiles")
    .select("*", { count: "exact", head: true })
    .eq("employment_status", "active")

  // Get pending leave requests
  const { count: pendingLeaves } = await supabase
    .from("leave_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  // Get today's attendance
  const today = new Date().toISOString().split('T')[0]
  const { count: presentToday } = await supabase
    .from("attendance")
    .select("*", { count: "exact", head: true })
    .eq("date", today)
    .eq("status", "present")

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">HR Management</h2>
          <p className="text-muted-foreground">
            Comprehensive Human Resource Management System
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees || 0}</div>
            <p className="text-xs text-muted-foreground">
              {activeEmployees || 0} active employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presentToday || 0}</div>
            <p className="text-xs text-muted-foreground">
              Attendance marked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingLeaves || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Current</div>
            <p className="text-xs text-muted-foreground">
              Month in progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main HR Modules */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/app/super/hr/staff">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Staff Directory
              </CardTitle>
              <CardDescription>
                Manage employee profiles, contacts, and basic information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full">
                View All Staff →
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/super/hr/attendance">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Attendance
              </CardTitle>
              <CardDescription>
                Track daily attendance, check-ins, and work hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full">
                Manage Attendance →
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/super/hr/leave">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Leave Management
              </CardTitle>
              <CardDescription>
                Handle leave requests, approvals, and balances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full">
                View Leave Requests →
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/super/hr/payroll">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payroll
              </CardTitle>
              <CardDescription>
                Process salaries, deductions, and payment records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full">
                Manage Payroll →
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/super/hr/performance">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Reviews
              </CardTitle>
              <CardDescription>
                Conduct employee evaluations and track performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full">
                View Reviews →
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/super/hr/training">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Training & Development
              </CardTitle>
              <CardDescription>
                Manage training programs and employee development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full">
                View Programs →
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
