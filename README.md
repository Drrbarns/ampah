# Mortuary Management System

A multi-branch Mortuary Management System built with Next.js 14, Supabase, and TailwindCSS.

## Features

- **Multi-Branch Support:** Independent dashboards and data isolation for multiple branches.
- **Role-Based Access Control (RBAC):** Super Admin, Branch Admin, and Staff roles.
- **Case Management:** Admission, In-custody tracking, Discharge workflow.
- **Financials:** Automated fee calculation (storage, coldroom), Payment tracking, Receipt generation.
- **Reporting:** Real-time dashboards and financial reports.
- **Security:** Row Level Security (RLS) policies ensuring data privacy.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage)
- **State:** Server Components, React Hook Form, Zod

## Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project.
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Run the migrations in order located in `supabase/migrations/`:
   - `001_initial_schema.sql`
   - `002_rls_policies.sql`
   - `003_seed_data.sql` (Modify seed data with your own User IDs after creating users)

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`.

### 5. First Login

1. Sign up a user in Supabase Authentication.
2. Copy the User UUID.
3. In the `profiles` table, insert a row for this user with `role = 'super_admin'`.
4. Login at `/auth/login`.

## Deployment

Deploy to Vercel:

1. Push code to GitHub.
2. Import project in Vercel.
3. Add Environment Variables.
4. Deploy.

## License

Private / Proprietary.
