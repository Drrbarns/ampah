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
import { BranchDialog, Branch } from "./branch-dialog"
import { deleteBranchAction } from "@/app/actions/branch-actions"
import { useToast } from "@/components/ui/use-toast"

export function BranchActionCell({ branch }: { branch: Branch }) {
    const { toast } = useToast()

    const handleDelete = async () => {
        if (!confirm("Are you sure? This cannot be undone if there are no linked records.")) return
        
        const res = await deleteBranchAction(branch.id)
        if (res.error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: res.error
            })
        } else {
            toast({
                title: "Success",
                description: "Branch deleted."
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
                <BranchDialog branch={branch} />
            </div>
            <DropdownMenuItem onClick={handleDelete} className="text-red-600 cursor-pointer">
                <Trash className="mr-2 h-4 w-4" />
                Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
    )
}

