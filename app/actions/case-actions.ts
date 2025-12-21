'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createCaseAction(formData: FormData) {
  const branchId = formData.get("branch_id") as string
  const tagNo = formData.get("tag_no") as string
  const nameOfDeceased = formData.get("name_of_deceased") as string
  const age = parseInt(formData.get("age") as string)
  const gender = formData.get("gender") as string
  const place = formData.get("place") as string
  const admissionDate = formData.get("admission_date") as string
  const admissionTime = formData.get("admission_time") as string
  const type = formData.get("type") as string
  const relativeName = formData.get("relative_name") as string
  const relativeContact = formData.get("relative_contact") as string
  const relativeContactSecondary = formData.get("relative_contact_secondary") as string
  const notes = formData.get("notes") as string

  if (!branchId || !tagNo || !nameOfDeceased || !relativeName || !relativeContact) {
    return { error: "Missing required fields" }
  }

  const supabase = await createClient()

  try {
    // 1. Create the case
    const { data: newCase, error: caseError } = await supabase
      .from("deceased_cases")
      // @ts-ignore - Supabase type inference issue
      .insert({
        branch_id: branchId,
        tag_no: tagNo,
        name_of_deceased: nameOfDeceased,
        age,
        gender,
        place,
        admission_date: admissionDate,
        admission_time: admissionTime,
        type,
        status: "IN_CUSTODY",
        relative_name: relativeName,
        relative_contact: relativeContact,
        relative_contact_secondary: relativeContactSecondary,
        notes,
      })
      .select()
      .single()

    if (caseError) {
      if (caseError.code === '23505') {
        return { error: "Tag number already exists" }
      }
      throw caseError
    }

    if (!newCase) {
      return { error: "Failed to create case" }
    }

    // 2. Fetch active services for this branch (Embalming, Coldroom)
    const { data: services } = await supabase
      .from("services_catalog")
      .select("*")
      .eq("branch_id", branchId)
      .eq("is_active", true)

    // 3. Create initial charges based on services
    const initialCharges: any[] = []
    
    // Find embalming service
    // @ts-ignore - Supabase type inference issue
    const embalmingService: any = services?.find((s: any) => s.name.toLowerCase().includes('embalm'))
    if (embalmingService) {
      initialCharges.push({
        case_id: (newCase as any).id,
        branch_id: branchId,
        service_id: embalmingService.id,
        description: embalmingService.name,
        quantity: 1,
        unit_price: embalmingService.unit_price,
        charge_type: 'EMBALMING',
        applied_on: admissionDate,
        auto_generated: true
      })
    }

    // Find coldroom service
    // @ts-ignore - Supabase type inference issue
    const coldroomService: any = services?.find((s: any) => s.name.toLowerCase().includes('cold'))
    if (coldroomService) {
      initialCharges.push({
        case_id: (newCase as any).id,
        branch_id: branchId,
        service_id: coldroomService.id,
        description: coldroomService.name,
        quantity: 1,
        unit_price: coldroomService.unit_price,
        charge_type: 'COLDROOM',
        applied_on: admissionDate,
        auto_generated: true
      })
    }

    if (initialCharges.length > 0) {
      const { error: chargesError } = await supabase
        .from("case_charges")
        // @ts-ignore - Supabase type inference issue
        .insert(initialCharges)

      if (chargesError) {
        console.error("Failed to create initial charges:", chargesError)
        // Don't fail the entire operation, just log it
      }
    }

    revalidatePath(`/app/branch/${branchId}/cases`)
    revalidatePath(`/app/branch/${branchId}/dashboard`)
    
    return { success: true, caseId: (newCase as any).id }
  } catch (error: any) {
    console.error("Create Case Error:", error)
    return { error: error.message || "Failed to create case" }
  }
}

export async function updateCaseAction(caseId: string, branchId: string, formData: FormData) {
  const supabase = await createClient()

  const updates = {
    tag_no: formData.get("tag_no") as string,
    name_of_deceased: formData.get("name_of_deceased") as string,
    age: parseInt(formData.get("age") as string),
    gender: formData.get("gender") as string,
    place: formData.get("place") as string,
    admission_date: formData.get("admission_date") as string,
    admission_time: formData.get("admission_time") as string,
    type: formData.get("type") as string,
    relative_name: formData.get("relative_name") as string,
    relative_contact: formData.get("relative_contact") as string,
    relative_contact_secondary: formData.get("relative_contact_secondary") as string,
    notes: formData.get("notes") as string,
  }

  const { error } = await supabase
    .from("deceased_cases")
    // @ts-ignore - Supabase type inference issue
    .update(updates)
    .eq("id", caseId)
    .eq("branch_id", branchId) // Security check

  if (error) return { error: error.message }

  revalidatePath(`/app/branch/${branchId}/cases/${caseId}`)
  revalidatePath(`/app/branch/${branchId}/cases`)
  
  return { success: true }
}


