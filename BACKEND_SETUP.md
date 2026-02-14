# 🚀 Backend Setup Guide

Your "Communew" marketplace is fully built! Currently, it is running in **Demo Mode** with mock data. To make it a real, functioning app where you can sign up users and create actual events, allow follow these steps:

## 1. Create a Supabase Project
1. Go to [database.new](https://database.new) and create a new project.
2. Give it a name (e.g., `commun-app`) and a strong database password.
3. Choose a region close to you (e.g., Frankfurt/Central Europe).

## 2. Run the Database Migrations
Go to the **SQL Editor** in your Supabase dashboard and run the following scripts in order. **Copy and paste the contents of each file:**

1.  **Schema**: `supabase/migrations/001_schema.sql`  
    *(Creates tables like users, events, bookings)*
2.  **Security (RLS)**: `supabase/migrations/002_rls.sql`  
    *(Sets permissions so users can only edit their own data)*
3.  **Storage**: `supabase/migrations/003_storage.sql`  
    *(Creates buckets for image uploads)*

## 3. Connect the App
1. Go to **Settings > API** in your Supabase dashboard.
2. Copy the **Project URL** and **anon/public Key**.
3. Create a file named `.env.local` in your root project folder (`C:\Users\aycha\.gemini\antigravity\scratch\commun`).
4. Add the keys like this:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. Restart & Verify
1. Stop the running server (Ctrl+C in terminal).
2. Run `npm run dev` again.
3. Go to `http://localhost:3000`.
4. Try to **Sign Up** -> If it works, you are live!

## Optional: Add Seed Data
If you want to start with some data instead of an empty app:
1. Sign up a new user in your app.
2. Go to `supabase/seed.sql`.
3. Replace `'REPLACE_WITH_YOUR_USER_ID'` with your new user's ID (found in Supabase Auth/Table).
4. Run the script in the Supabase SQL Editor.
