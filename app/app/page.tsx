import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AppRootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user profile to determine role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    // Handle edge case where profile doesn't exist yet
    return <div>User profile not found. Contact administrator.</div>;
  }

  // Redirect based on role
  if (profile.role === 'super_admin') {
    redirect('/app/super/dashboard');
  } else {
    // For branch staff, find their primary branch or first assigned branch
    const { data: assignments } = await supabase
      .from('user_branch_assignments')
      .select('branch_id')
      .eq('user_id', user.id)
      .limit(1);

    if (assignments && assignments.length > 0) {
      redirect(`/app/branch/${assignments[0].branch_id}/dashboard`);
    } else {
      return <div>You are not assigned to any branch. Contact administrator.</div>;
    }
  }
}
