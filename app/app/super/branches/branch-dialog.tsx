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
import { createBranchAction, updateBranchAction } from "@/app/actions/branch-actions"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Pencil } from "lucide-react"

export interface Branch {
    id: string
    name: string
    code: string
    address: string | null
    phone: string | null
    is_active: boolean
}

export function BranchDialog({ branch }: { branch?: Branch }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const isEdit = !!branch

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    
    let res
    if (isEdit && branch) {
        res = await updateBranchAction(branch.id, formData)
    } else {
        res = await createBranchAction(formData)
    }

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
        description: `Branch ${isEdit ? "updated" : "created"} successfully`,
      })
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
             <Button variant="ghost" className="w-full justify-start pl-2 font-normal">
                Edit Branch
             </Button>
        ) : (
            <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Branch
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Branch" : "Create New Branch"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update branch details." : "Add a new mortuary branch location."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" name="name" required className="col-span-3" placeholder="Accra Main" defaultValue={branch?.name} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Code
              </Label>
              <Input id="code" name="code" required className="col-span-3" placeholder="ADM-001" defaultValue={branch?.code} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input id="address" name="address" className="col-span-3" defaultValue={branch?.address || ""} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input id="phone" name="phone" className="col-span-3" defaultValue={branch?.phone || ""} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
