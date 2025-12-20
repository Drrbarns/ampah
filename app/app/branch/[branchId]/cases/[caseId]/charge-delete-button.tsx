"use client"

import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import { deleteChargeAction } from "@/app/actions/charge-actions"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function ChargeDeleteButton({ chargeId, caseId, branchId }: { chargeId: string, caseId: string, branchId: string }) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm("Remove this charge?")) return
        setLoading(true)
        const res = await deleteChargeAction(chargeId, caseId, branchId)
        setLoading(false)

        if (res.error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: res.error
            })
        } else {
            toast({
                title: "Success",
                description: "Charge removed."
            })
        }
    }

    return (
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDelete} 
            disabled={loading}
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash className="h-3 w-3 text-red-500" />}
        </Button>
    )
}

