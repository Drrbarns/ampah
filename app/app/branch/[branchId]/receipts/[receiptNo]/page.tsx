import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { PrintButton } from "@/components/ui/print-button"

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ branchId: string; receiptNo: string }>
}) {
  const { branchId, receiptNo } = await params
  const supabase = await createClient()

  // Try to find in payments
  const { data: payment } = await supabase
    .from("payments")
    .select("*, deceased_cases(*), branches(*)")
    .eq("receipt_no", receiptNo)
    .single()

  // If not found, try to find in discharges (deceased_cases)
  let dischargeCase = null;
  if (!payment) {
     const { data: dCase } = await supabase
        .from("deceased_cases")
        .select("*, branches(*)")
        .eq("discharge_receipt_no", receiptNo)
        .single()
    dischargeCase = dCase
  }

  if (!payment && !dischargeCase) {
    return notFound()
  }

  const branch = payment ? payment.branches : dischargeCase.branches
  const deceased = payment ? payment.deceased_cases : dischargeCase
  const type = payment ? "PAYMENT RECEIPT" : "DISCHARGE CLEARANCE"
  const date = payment ? payment.paid_on : dischargeCase.discharge_date

  return (
    <div className="p-8 max-w-[800px] mx-auto font-serif text-black bg-white min-h-screen">
      <style>{`
        @media print {
            body { background: white; }
            .no-print { display: none; }
        }
      `}</style>
      
      <div className="text-center mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold uppercase">{branch?.name}</h1>
        <p className="text-sm">{branch?.address}</p>
        <p className="text-sm">{branch?.phone}</p>
      </div>

      <div className="flex justify-between mb-8">
        <div>
            <h2 className="text-xl font-bold underline mb-2">{type}</h2>
            <p><strong>Receipt No:</strong> {receiptNo}</p>
            <p><strong>Date:</strong> {formatDateTime(date || "")}</p>
        </div>
        <div className="text-right">
            <p><strong>Tag No:</strong> {deceased?.tag_no}</p>
        </div>
      </div>

      <div className="mb-8 border p-4 rounded-sm">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <p className="text-sm text-gray-600">Received From / Relative:</p>
                <p className="font-bold">{deceased?.relative_name}</p>
            </div>
             <div>
                <p className="text-sm text-gray-600">Being Payment For Deceased:</p>
                <p className="font-bold">{deceased?.name_of_deceased}</p>
            </div>
        </div>
      </div>

      {payment && (
        <div className="mb-8">
             <table className="w-full border-collapse border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Description</th>
                        <th className="border p-2 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border p-2">
                            {payment.allocation} - {payment.method}
                            {payment.note && <div className="text-xs italic">{payment.note}</div>}
                        </td>
                        <td className="border p-2 text-right font-bold">
                            {formatCurrency(payment.amount)}
                        </td>
                    </tr>
                </tbody>
             </table>
        </div>
      )}

      {dischargeCase && (
          <div className="mb-8">
               <h3 className="font-bold mb-2">Final Clearance Summary</h3>
               <table className="w-full border-collapse border">
                <tbody>
                     <tr>
                        <td className="border p-2">Admission Date</td>
                        <td className="border p-2 text-right">{formatDateTime(dischargeCase.admission_date)}</td>
                    </tr>
                     <tr>
                        <td className="border p-2">Discharge Date</td>
                        <td className="border p-2 text-right">{formatDateTime(dischargeCase.discharge_date)}</td>
                    </tr>
                     <tr>
                        <td className="border p-2">Total Storage Days</td>
                        <td className="border p-2 text-right">{dischargeCase.storage_days}</td>
                    </tr>
                    <tr className="font-bold bg-gray-50">
                        <td className="border p-2">Total Billed</td>
                        <td className="border p-2 text-right">{formatCurrency(dischargeCase.total_bill)}</td>
                    </tr>
                    <tr className="font-bold bg-gray-50">
                        <td className="border p-2">Total Paid</td>
                        <td className="border p-2 text-right">{formatCurrency(dischargeCase.total_paid)}</td>
                    </tr>
                </tbody>
             </table>
             <div className="mt-4 text-center font-bold border p-2">
                 STATUS: DISCHARGED
             </div>
          </div>
      )}

      <div className="mt-16 flex justify-between">
          <div className="text-center w-1/3 border-t pt-2">
              <p>Authority Signature</p>
          </div>
          <div className="text-center w-1/3 border-t pt-2">
              <p>Relative Signature</p>
          </div>
      </div>

      <div className="mt-8 text-center text-xs text-gray-500">
          Generated by Mortuary Management System
      </div>

       <PrintButton />
    </div>
  )
}

