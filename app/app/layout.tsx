import { Toaster } from "@/components/ui/toaster"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {children}
      </div>
      <Toaster />
    </div>
  )
}
