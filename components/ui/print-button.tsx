"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export function PrintButton() {
  return (
    <Button
      className="no-print fixed bottom-8 right-8 shadow-lg"
      size="lg"
      onClick={() => window.print()}
    >
      <Printer className="mr-2 h-4 w-4" />
      Print Receipt
    </Button>
  )
}

