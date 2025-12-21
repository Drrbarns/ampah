"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash } from "lucide-react"
import { UserDialog } from "./user-form"
import { deleteUserAction } from "@/app/actions/user-actions"
import { useToast } from "@/components/ui/use-toast"

interface Profile {
    id: string
    full_name: string
    role: string
    phone: string | null
    is_active: boolean
}

export function UserActionCell({ user }: { user: Profile }) {
    const { toast } = useToast()

    const handleDelete = async () => {
        if (!confirm("Are you sure? This deletes the user account permanently.")) return
        
        const res = await deleteUserAction(user.id)
        if (res.error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: res.error
            })
        } else {
            toast({
                title: "Success",
                description: "User deleted."
            })
        }
    }

    return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <div onClick={(e) => e.stopPropagation()}>
                <UserDialog user={user} branches={[]} /> {/* Branches usually needed for new users, but Edit might not need list if not changing assignment yet */}
            </div>
            <DropdownMenuItem onClick={handleDelete} className="text-red-600 cursor-pointer">
                <Trash className="mr-2 h-4 w-4" />
                Delete Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
    )
}



