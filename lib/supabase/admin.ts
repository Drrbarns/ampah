import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Note: This client should only be used in Server Actions or API routes
// where the SUPABASE_SERVICE_ROLE_KEY is available.
// NEVER use this on the client side.

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

