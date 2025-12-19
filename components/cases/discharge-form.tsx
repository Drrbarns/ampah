"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

const dischargeSchema = z.object({
  discharge_date: z.string().min(1, "Discharge date is required"),
  final_storage_days: z.coerce.number().min(0),
  confirm_payment: z.boolean().refine(val => val === true, "You must confirm payment status"),
})

type DischargeFormValues = z.infer<typeof dischargeSchema>

interface DischargeFormProps {
  branchId: string
  caseId: string
  caseData: any
  charges: any[]
}

export function DischargeForm({ branchId, caseId, caseData, charges }: DischargeFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Calculate projected storage days based on today (or selected date)
  const today = new Date().toISOString().split('T')[0]
  const admissionDate = new Date(caseData.admission_date)
  
  const form = useForm<DischargeFormValues>({
    resolver: zodResolver(dischargeSchema),
    defaultValues: {
      discharge_date: today,
      final_storage_days: caseData.storage_days, // Initial value
      confirm_payment: false,
    },
  })

  // Watch date to update days
  const watchedDate = form.watch("discharge_date")

  useEffect(() => {
    if (watchedDate) {
        const discharge = new Date(watchedDate)
        const diffTime = Math.abs(discharge.getTime() - admissionDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        // Logic for counting admission day as day 1 could go here based on settings
        // For now simple diff
        form.setValue("final_storage_days", diffDays)
    }
  }, [watchedDate, admissionDate, form])

  async function onSubmit(data: DischargeFormValues) {
    setLoading(true)
    try {
        if (caseData.balance > 0) {
             // Check setting if allowed
             // For now, warn
             const confirmed = window.confirm(`There is an outstanding balance of ${formatCurrency(caseData.balance)}. Continue discharge?`)
             if (!confirmed) {
                 setLoading(false)
                 return
             }
        }

        // 1. Generate Discharge Receipt Number
        const { data: receiptNo, error: receiptError } = await supabase.rpc(
            'generate_receipt_number',
            { branch_id_param: branchId, receipt_type_param: 'DISCHARGE' }
        )
        if (receiptError) throw receiptError

        // 2. Update Case Status
        const { error: updateError } = await supabase
            .from("deceased_cases")
            .update({
                status: "DISCHARGED",
                discharge_date: data.discharge_date,
                discharge_receipt_no: receiptNo,
                // We rely on the stored generated column or trigger to finalize storage days/fees
                // But typically we should insert a final 'Storage Charge' row here if not auto-calculated per day
                // Let's assume we insert a final storage charge calculation if needed
            })
            .eq("id", caseId)

        if (updateError) throw updateError

        toast({
            title: "Discharged Successfully",
            description: `Receipt: ${receiptNo}`,
        })
        
        router.push(`/app/branch/${branchId}/cases/${caseId}`)
        router.refresh()

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Something went wrong.",
        })
    } finally {
        setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="discharge_date"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Discharge Date</FormLabel>
                    <FormControl>
                        <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="final_storage_days"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Calculated Storage Days</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} readOnly className="bg-muted" />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <div className="rounded-md border p-4 bg-muted/50">
            <h4 className="font-medium mb-2">Financial Check</h4>
            <div className="flex justify-between text-sm">
                <span>Total Bill:</span>
                <span className="font-bold">{formatCurrency(caseData.total_bill)}</span>
            </div>
             <div className="flex justify-between text-sm">
                <span>Total Paid:</span>
                <span className="font-bold text-green-600">{formatCurrency(caseData.total_paid)}</span>
            </div>
             <div className="flex justify-between text-lg mt-2 pt-2 border-t">
                <span>Outstanding Balance:</span>
                <span className={`font-bold ${caseData.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(caseData.balance)}
                </span>
            </div>
        </div>

        <FormField
          control={form.control}
          name="confirm_payment"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Confirm Discharge
                </FormLabel>
                <FormDescription>
                  I confirm that the body is ready for release and all financial checks are completed.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" className="w-full" variant="destructive" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Process Discharge
        </Button>
      </form>
    </Form>
  )
}

