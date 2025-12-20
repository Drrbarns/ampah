"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { upsertServiceAction } from "@/app/actions/settings-actions"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Pencil } from "lucide-react"

interface Service {
    id?: string
    name: string
    pricing_model: "FLAT" | "PER_DAY" | "MANUAL"
    unit_price: number
    branch_id: string
}

export function ServiceDialog({ branchId, service }: { branchId: string, service?: Service }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const isEdit = !!service

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    
    const data = {
        id: service?.id, // If undefined, Supabase creates new ID
        branch_id: branchId,
        name: formData.get("name") as string,
        unit_price: parseFloat(formData.get("unit_price") as string),
        pricing_model: formData.get("pricing_model") as any,
        is_active: true
    }

    const res = await upsertServiceAction(data)

    setLoading(false)

    if (res.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: res.error,
      })
    } else {
      toast({
        title: "Success",
        description: `Service ${isEdit ? 'updated' : 'created'} successfully`,
      })
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
            <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
            </Button>
        ) : (
            <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Service
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Service" : "Add New Service"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" name="name" defaultValue={service?.name} required className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pricing_model" className="text-right">
                Model
              </Label>
              <Select name="pricing_model" defaultValue={service?.pricing_model || "FLAT"}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pricing Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FLAT">Flat Fee</SelectItem>
                  <SelectItem value="PER_DAY">Per Day</SelectItem>
                  <SelectItem value="MANUAL">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit_price" className="text-right">
                Price
              </Label>
              <Input id="unit_price" name="unit_price" type="number" step="0.01" defaultValue={service?.unit_price} required className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

