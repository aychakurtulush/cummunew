# Communew

**Communew** is a community marketplace for discovering and booking local hobby events in Berlin. 

## 🚀 Features

- **Explore**: Discover workshops, classes, and meetups in your neighborhood.
- **Host**: Create and manage your own events.
- **Book**: Reserve spots in paid or free events.
- **Connect**: Chat with hosts and other attendees (Mocked for MVP).

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **Auth**: Supabase Auth (Email/Password, Social)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com) + Custom "Warm Minimal" Design System

## 🏁 Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Setup Environment**:
    - Copy `.env.example` to `.env.local`
    - Add your Supabase URL and Anon Key (See `BACKEND_SETUP.md` for details)

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Open App**:
    - Visit `http://localhost:3000`

## 📚 Documentation

- **Backend Setup**: See `BACKEND_SETUP.md` for database migrations and policies.
- **Design System**: See `DESIGN.md` for color palette and typography rules.
