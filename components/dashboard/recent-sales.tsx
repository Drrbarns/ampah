import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import { formatCurrency } from "@/lib/utils"

interface RecentSalesProps {
    sales: {
        id: string
        amount: number
        profiles: {
            full_name: string
            email?: string
        } | null
        deceased_cases: {
            name_of_deceased: string
        } | null
    }[]
}

export function RecentSales({ sales }: RecentSalesProps) {
  return (
    <div className="space-y-8">
      {sales.map((sale) => (
         <div className="flex items-center" key={sale.id}>
            <Avatar className="h-9 w-9">
            <AvatarFallback>{sale.profiles?.full_name?.substring(0,2).toUpperCase() || "CN"}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.profiles?.full_name || "Cashier"}</p>
            <p className="text-sm text-muted-foreground">
                Payment for {sale.deceased_cases?.name_of_deceased}
            </p>
            </div>
            <div className="ml-auto font-medium">+{formatCurrency(sale.amount)}</div>
        </div>
      ))}
      {sales.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">No recent payments.</p>
      )}
    </div>
  )
}
