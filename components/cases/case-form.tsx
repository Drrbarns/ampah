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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { createCaseAction, updateCaseAction } from "@/app/actions/case-actions"

const caseFormSchema = z.object({
  tag_no: z.string().min(1, "Tag number is required"),
  name_of_deceased: z.string().min(1, "Name is required"),
  age: z.coerce.number().min(0, "Age must be valid"),
  gender: z.enum(["Male", "Female", "Other/Unknown"]),
  place: z.string().optional(),
  admission_date: z.string().min(1, "Admission date is required"),
  admission_time: z.string().min(1, "Admission time is required"),
  type: z.enum(["Normal", "VIP"]),
  relative_name: z.string().min(1, "Relative name is required"),
  relative_contact: z.string().min(1, "Contact is required"),
  relative_contact_secondary: z.string().optional(),
  notes: z.string().optional(),
})

type CaseFormValues = z.infer<typeof caseFormSchema>

interface CaseFormProps {
  branchId: string
  initialData?: any // Using any for simplicity with partial types
  isEdit?: boolean
}

export function CaseForm({ branchId, initialData, isEdit = false }: CaseFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const defaultValues: Partial<CaseFormValues> = initialData || {
    tag_no: "",
    name_of_deceased: "",
    age: 0,
    gender: "Other/Unknown",
    place: "",
    admission_date: new Date().toISOString().split("T")[0],
    admission_time: new Date().toTimeString().split(" ")[0].substring(0, 5),
    type: "Normal",
    relative_name: "",
    relative_contact: "",
    relative_contact_secondary: "",
    notes: "",
  }

  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseFormSchema),
    defaultValues,
  })

  async function onSubmit(data: CaseFormValues) {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("branch_id", branchId)
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value?.toString() || "")
      })

      if (isEdit && initialData?.id) {
        // Update Mode
        const res = await updateCaseAction(initialData.id, branchId, formData)
        
        if (res.error) throw new Error(res.error)

        toast({
          title: "Success",
          description: "Case updated successfully.",
        })
        router.push(`/app/branch/${branchId}/cases/${initialData.id}`)
      } else {
        // Create Mode
        const res = await createCaseAction(formData)
        
        if (res.error) throw new Error(res.error)

        toast({
          title: "Success",
          description: "Case created successfully with initial charges.",
        })
        router.push(`/app/branch/${branchId}/cases/${res.caseId}`)
      }

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Deceased Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Deceased Details</h3>
            <FormField
              control={form.control}
              name="tag_no"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag No.</FormLabel>
                  <FormControl>
                    <Input placeholder="TAG-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name_of_deceased"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name of Deceased</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other/Unknown">Other/Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
              control={form.control}
              name="place"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Place / Town</FormLabel>
                  <FormControl>
                    <Input placeholder="Accra" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="admission_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="admission_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>

          {/* Relative Details */}
          <div className="space-y-4">
             <h3 className="text-lg font-medium">Relative Details</h3>
             <FormField
              control={form.control}
              name="relative_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relative Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="relative_contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input placeholder="024XXXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="relative_contact_secondary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secondary Contact (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="020XXXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Update Case" : "Save Admission"}
        </Button>
      </form>
    </Form>
  )
}


