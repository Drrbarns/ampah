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
import { createUserAction, updateUserAction } from "@/app/actions/user-actions"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface Branch {
    id: string
    name: string
}

interface Profile {
    id: string
    full_name: string
    role: string
    phone: string | null
    is_active: boolean
}

export function UserDialog({ branches, user }: { branches: Branch[], user?: Profile }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const isEdit = !!user

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    
    let res
    if (isEdit && user) {
        res = await updateUserAction(user.id, formData)
    } else {
        res = await createUserAction(formData)
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
        description: `User ${isEdit ? "updated" : "created"} successfully`,
      })
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
            <Button variant="ghost" className="w-full justify-start pl-2 font-normal">
                Edit User
            </Button>
        ) : (
            <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add User
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "Create New User"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update user profile and access." : "Add a new staff member to the system."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right">
                Full Name
              </Label>
              <Input id="full_name" name="full_name" required className="col-span-3" defaultValue={user?.full_name} />
            </div>
            
            {!isEdit && (
                <>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                        Email
                    </Label>
                    <Input id="email" name="email" type="email" required className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                        Password
                    </Label>
                    <Input id="password" name="password" type="password" required className="col-span-3" />
                </div>
                </>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input id="phone" name="phone" className="col-span-3" defaultValue={user?.phone || ""} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select name="role" defaultValue={user?.role || "staff"}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="branch_admin">Branch Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Branch Assignment - simplified for now */}
            {!isEdit && (
             <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Branches</Label>
              <div className="col-span-3 space-y-2 max-h-32 overflow-y-auto border p-2 rounded-md">
                {branches.map(branch => (
                    <div key={branch.id} className="flex items-center space-x-2">
                        <Checkbox id={`branch-${branch.id}`} name="branch_ids" value={branch.id} />
                        <label htmlFor={`branch-${branch.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {branch.name}
                        </label>
                    </div>
                ))}
              </div>
            </div>
            )}

            {isEdit && (
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="is_active" className="text-right">
                        Active
                    </Label>
                    <div className="flex items-center space-x-2 col-span-3">
                        <Checkbox id="is_active" name="is_active" defaultChecked={user?.is_active} />
                        <label htmlFor="is_active" className="text-sm text-muted-foreground">
                            User can login
                        </label>
                    </div>
                </div>
            )}

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
