
# Mir Baba Tour and Travels - Website

This is the official website for **Mir Baba Tour and Travels**, a Kashmir-based travel agency. The project is built with **Next.js 15**, **Tailwind CSS**, and **Supabase**.

## Features

- **Responsive Design:** Mobile-first approach using Tailwind CSS.
- **Dynamic Tour Packages:** Filterable list and detailed package pages.
- **Booking System:** Inquiry form integrated with Supabase.
- **Admin Panel:** Secure dashboard to manage packages, inquiries, and chatbot FAQs.
- **AI Chatbot:** Built-in support assistant for common queries.
- **SEO Optimized:** Meta tags, fast loading speeds.

## Prerequisites

- Node.js 18+ installed.
- A Supabase account.

## Setup Instructions

1. **Clone/Navigate to the project:**
   ```bash
   cd mir-baba-web
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Set up Supabase:**
   - Create a new project on [Supabase](https://supabase.com/).
   - Go to **Project Settings > API** and copy the `URL` and `anon` key.
   - Create a `.env.local` file in the root directory (if not exists) and add:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
     NEXT_PUBLIC_SITE_URL=http://localhost:3000
     # Server-only: required for Admin → Users → “Create employee” (never expose in client bundles)
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
     ```

4. **Database Setup:**
   - Go to the **SQL Editor** in your Supabase dashboard.
   - Run `supabase_schema.sql` (base schema), then run:
     - `supabase/migrations/20260210120000_site_settings_crm.sql`
     - `supabase/migrations/20260510_supabase_full_config.sql`
   - Optional sample data: run `supabase/seed.sql`.

5. **Create Admin + Employee User:**
   - Go to **Authentication** in Supabase and create a new user (email/password).
   - In the **Table Editor**, go to the `profiles` table.
   - Set your owner account role to `admin`.
   - **Or** sign in as admin at `/admin` → **Users** → **Create employee**: enter email + password; the API creates the Auth user (email confirmed) and sets `profiles.role` to `employee` so they can log in immediately. Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (Project Settings → API → `service_role` secret).
   - Admin panel `/admin` still supports changing role for existing users: `admin`, `employee`, `user`.
   - Run `supabase/migrations/20260513_storage_employee_delete_cms_buckets.sql` if you want **employees** to delete old files in `packages`, `places`, `cars`, and `cabs` buckets (not only admins).

6. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the site.

## Deployment

This project is ready to be deployed on **Vercel** or **Netlify**.
- Push the code to GitHub.
- Import the repository in Vercel.
- Add environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SITE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` (server only; for creating employee accounts from the admin panel)

## Folder Structure

- `src/app`: App Router pages.
- `src/components`: Reusable UI components.
- `src/lib`: Supabase client configuration.
- `public`: Static assets.

## Contact

For support, contact **info@mirbabatourandtravels.com**.
