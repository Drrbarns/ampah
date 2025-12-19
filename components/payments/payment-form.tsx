"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

const paymentFormSchema = z.object({
  case_id: z.string().min(1, "Case is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  method: z.enum(["CASH", "MOMO", "CARD", "BANK"]),
  allocation: z.enum(["EMBALMING", "COLDROOM", "STORAGE", "GENERAL"]),
  note: z.string().optional(),
})

type PaymentFormValues = z.infer<typeof paymentFormSchema>

interface PaymentFormProps {
  branchId: string
  preselectedCaseId?: string
  onSuccess?: () => void
}

export function PaymentForm({ branchId, preselectedCaseId, onSuccess }: PaymentFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [cases, setCases] = useState<{ id: string; name_of_deceased: string; tag_no: string }[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchCases() {
      const { data } = await supabase
        .from("deceased_cases")
        .select("id, name_of_deceased, tag_no")
        .eq("branch_id", branchId)
        .eq("status", "IN_CUSTODY") // Only show active cases usually? Or all?
        .order("name_of_deceased")
      
      if (data) {
        setCases(data)
      }
    }
    fetchCases()
  }, [branchId, supabase])

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      case_id: preselectedCaseId || "",
      amount: 0,
      method: "CASH",
      allocation: "GENERAL",
      note: "",
    },
  })

  async function onSubmit(data: PaymentFormValues) {
    setLoading(true)
    try {
        // 1. Get current user ID
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Not authenticated")

        // 2. Generate Receipt Number (Server-side function)
        const { data: receiptNo, error: receiptError } = await supabase.rpc(
            'generate_receipt_number',
            { branch_id_param: branchId, receipt_type_param: 'PAYMENT' }
        )

        if (receiptError) throw receiptError

        // 3. Insert Payment
        const { error: paymentError } = await supabase
            .from("payments")
            .insert({
                branch_id: branchId,
                case_id: data.case_id,
                amount: data.amount,
                method: data.method,
                allocation: data.allocation,
                note: data.note,
                receipt_no: receiptNo,
                received_by: user.id
            })

        if (paymentError) throw paymentError

        toast({
            title: "Success",
            description: `Payment recorded. Receipt: ${receiptNo}`,
        })

        form.reset()
        if (onSuccess) onSuccess()
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
        <FormField
          control={form.control}
          name="case_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Case</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!!preselectedCaseId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a case" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.tag_no} - {c.name_of_deceased}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
             <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (GH₵)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="MOMO">Mobile Money</SelectItem>
                      <SelectItem value="CARD">Card</SelectItem>
                      <SelectItem value="BANK">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <FormField
          control={form.control}
          name="allocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allocation</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Allocation" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="GENERAL">General Payment</SelectItem>
                  <SelectItem value="EMBALMING">Embalming</SelectItem>
                  <SelectItem value="COLDROOM">Coldroom</SelectItem>
                  <SelectItem value="STORAGE">Storage</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Note</FormLabel>
                <FormControl>
                <Input placeholder="Optional note..." {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Record Payment
        </Button>
      </form>
    </Form>
  )
}

