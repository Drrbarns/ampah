import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect('/auth/login');
}

export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect('/auth/login');
}

