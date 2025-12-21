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
import { addChargeAction } from "@/app/actions/charge-actions"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus } from "lucide-react"

export function AddChargeDialog({ caseId, branchId }: { caseId: string, branchId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    formData.append("case_id", caseId)
    formData.append("branch_id", branchId)
    
    const res = await addChargeAction(formData)

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
        description: "Charge added successfully",
      })
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Charge
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Extra Charge</DialogTitle>
          <DialogDescription>
            Add a miscellaneous charge to this case (e.g. Hearse, Decoration).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input id="description" name="description" required className="col-span-3" placeholder="e.g. Hearse Service" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input id="amount" name="amount" type="number" step="0.01" required className="col-span-3" placeholder="0.00" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="charge_type" className="text-right">
                Type
              </Label>
              <Select name="charge_type" defaultValue="OTHER">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OTHER">Other / Misc</SelectItem>
                  <SelectItem value="EMBALMING">Embalming</SelectItem>
                  <SelectItem value="COLDROOM">Coldroom</SelectItem>
                  <SelectItem value="STORAGE">Storage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Charge
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}



