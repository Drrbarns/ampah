export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      branches: {
        Row: {
          id: string
          name: string
          code: string
          address: string | null
          phone: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          address?: string | null
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          address?: string | null
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          role: 'super_admin' | 'branch_admin' | 'staff'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          phone?: string | null
          role: 'super_admin' | 'branch_admin' | 'staff'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          role?: 'super_admin' | 'branch_admin' | 'staff'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_branch_assignments: {
        Row: {
          id: string
          user_id: string
          branch_id: string
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          branch_id: string
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          branch_id?: string
          is_primary?: boolean
          created_at?: string
        }
      }
      deceased_cases: {
        Row: {
          id: string
          branch_id: string
          tag_no: string
          name_of_deceased: string
          age: number | null
          gender: 'Male' | 'Female' | 'Other/Unknown'
          place: string | null
          admission_date: string
          admission_time: string
          type: 'Normal' | 'VIP'
          status: 'IN_CUSTODY' | 'DISCHARGED' | 'CANCELLED' | 'ARCHIVED'
          discharge_date: string | null
          storage_days: number
          relative_name: string
          relative_contact: string
          relative_contact_secondary: string | null
          notes: string | null
          embalming_receipt_no: string | null
          coldroom_receipt_no: string | null
          discharge_receipt_no: string | null
          embalming_fee: number
          coldroom_fee: number
          storage_fee: number
          total_bill: number
          total_paid: number
          balance: number
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          branch_id: string
          tag_no: string
          name_of_deceased: string
          age?: number | null
          gender?: 'Male' | 'Female' | 'Other/Unknown'
          place?: string | null
          admission_date: string
          admission_time: string
          type?: 'Normal' | 'VIP'
          status?: 'IN_CUSTODY' | 'DISCHARGED' | 'CANCELLED' | 'ARCHIVED'
          discharge_date?: string | null
          relative_name: string
          relative_contact: string
          relative_contact_secondary?: string | null
          notes?: string | null
          embalming_receipt_no?: string | null
          coldroom_receipt_no?: string | null
          discharge_receipt_no?: string | null
          embalming_fee?: number
          coldroom_fee?: number
          storage_fee?: number
          total_bill?: number
          total_paid?: number
          balance?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          branch_id?: string
          tag_no?: string
          name_of_deceased?: string
          age?: number | null
          gender?: 'Male' | 'Female' | 'Other/Unknown'
          place?: string | null
          admission_date?: string
          admission_time?: string
          type?: 'Normal' | 'VIP'
          status?: 'IN_CUSTODY' | 'DISCHARGED' | 'CANCELLED' | 'ARCHIVED'
          discharge_date?: string | null
          relative_name?: string
          relative_contact?: string
          relative_contact_secondary?: string | null
          notes?: string | null
          embalming_receipt_no?: string | null
          coldroom_receipt_no?: string | null
          discharge_receipt_no?: string | null
          embalming_fee?: number
          coldroom_fee?: number
          storage_fee?: number
          total_bill?: number
          total_paid?: number
          balance?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      case_charges: {
        Row: {
          id: string
          branch_id: string
          case_id: string
          service_id: string | null
          description: string
          quantity: number
          unit_price: number
          amount: number
          charge_type: 'EMBALMING' | 'COLDROOM' | 'STORAGE' | 'OTHER'
          applied_on: string
          auto_generated: boolean
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          branch_id: string
          case_id: string
          service_id?: string | null
          description: string
          quantity?: number
          unit_price: number
          amount?: number
          charge_type: 'EMBALMING' | 'COLDROOM' | 'STORAGE' | 'OTHER'
          applied_on?: string
          auto_generated?: boolean
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          branch_id?: string
          case_id?: string
          service_id?: string | null
          description?: string
          quantity?: number
          unit_price?: number
          amount?: number
          charge_type?: 'EMBALMING' | 'COLDROOM' | 'STORAGE' | 'OTHER'
          applied_on?: string
          auto_generated?: boolean
          created_at?: string
          created_by?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          branch_id: string
          case_id: string
          paid_on: string
          method: 'CASH' | 'MOMO' | 'CARD' | 'BANK'
          amount: number
          allocation: 'EMBALMING' | 'COLDROOM' | 'STORAGE' | 'GENERAL'
          receipt_no: string
          received_by: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          branch_id: string
          case_id: string
          paid_on?: string
          method?: 'CASH' | 'MOMO' | 'CARD' | 'BANK'
          amount: number
          allocation?: 'EMBALMING' | 'COLDROOM' | 'STORAGE' | 'GENERAL'
          receipt_no: string
          received_by: string
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          branch_id?: string
          case_id?: string
          paid_on?: string
          method?: 'CASH' | 'MOMO' | 'CARD' | 'BANK'
          amount?: number
          allocation?: 'EMBALMING' | 'COLDROOM' | 'STORAGE' | 'GENERAL'
          receipt_no?: string
          received_by?: string
          note?: string | null
          created_at?: string
        }
      }
      receipt_sequences: {
        Row: {
          id: string
          branch_id: string
          receipt_type: 'PAYMENT' | 'DISCHARGE' | 'EMBALMING' | 'COLDROOM'
          prefix: string
          next_number: number
        }
        Insert: {
          id?: string
          branch_id: string
          receipt_type: 'PAYMENT' | 'DISCHARGE' | 'EMBALMING' | 'COLDROOM'
          prefix: string
          next_number?: number
        }
        Update: {
          id?: string
          branch_id?: string
          receipt_type?: 'PAYMENT' | 'DISCHARGE' | 'EMBALMING' | 'COLDROOM'
          prefix?: string
          next_number?: number
        }
      }
      audit_logs: {
        Row: {
          id: string
          branch_id: string | null
          actor_id: string
          action: string
          entity_type: string
          entity_id: string | null
          changes: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          branch_id?: string | null
          actor_id: string
          action: string
          entity_type: string
          entity_id?: string | null
          changes?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          branch_id?: string | null
          actor_id?: string
          action?: string
          entity_type?: string
          entity_id?: string | null
          changes?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          branch_id: string | null
          key: string
          value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          branch_id?: string | null
          key: string
          value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          branch_id?: string | null
          key?: string
          value?: Json
          created_at?: string
          updated_at?: string
        }
      }
      services_catalog: {
        Row: {
          id: string
          branch_id: string
          name: string
          pricing_model: 'FLAT' | 'PER_DAY' | 'MANUAL'
          unit_price: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          branch_id: string
          name: string
          pricing_model?: 'FLAT' | 'PER_DAY' | 'MANUAL'
          unit_price: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          branch_id?: string
          name?: string
          pricing_model?: 'FLAT' | 'PER_DAY' | 'MANUAL'
          unit_price?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      auth_user_has_branch: {
        Args: { branch_id_param: string }
        Returns: boolean
      }
      generate_receipt_number: {
        Args: {
          branch_id_param: string
          receipt_type_param: string
        }
        Returns: string
      }
      update_case_financials: {
        Args: { case_id_param: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}




