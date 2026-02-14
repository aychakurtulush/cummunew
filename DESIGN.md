# Commun UI/UX Layout Blueprint & Design System

## 1. Design DNA & System (Refined v2)
**Vibe**: Organic Community, "Living City", Warm, Accessible.
**Direction**: "Not a Design Hotel". Authentic over curated.
**Texture**: Subtle, atmospheric stone (grain/noise) rather than heavy marble.

### Color Palette "Community Warmth"
*   **Page Background**: `#FAFAF9` (Warm White / Stone-50) with a **very subtle grain texture**.
    *   *Why*: Reduces the "luxury" feel, adds organic warmth.
*   **Surfaces (Cards)**: `#FFFFFF` (White) - *Clean canvas for content.*
*   **Structure**: `#E7E5E4` (Stone-200) - *Soft definition.*
*   **Text**:
    *   **Primary**: `#1C1917` (Warm Black) - *High contrast, softer than pure black.*
    *   **Secondary**: `#57534E` (Stone-600) - *Readable, warm grey.*
*   **Accents**:
    *   **Moss Green**: `#4A6C4C` (Growth, Action).
    *   **Terracotta**: `#C87961` (Warmth, Urgency).
    *   **Human**: `#F5F5F4` (Hover backgrounds).

### Imagery & Atmosphere
*   **Subject Matter**: **Candid moments**. People laughing, hands working, messy tables, shared meals.
*   **Style**: Natural light, slightly imperfect framing. "You are there."
*   **Avoid**: Empty rooms, perfect architectural shots, cold minimalism.

### Depth & Shadows (The "Tactile" Feel)
*   **Card Shadow**: `box-shadow: 0 4px 20px -2px rgba(45, 43, 35, 0.08);` - *Diffuse, warm shadow. lifts the card off the page.*
*   **Hover Effect**:
    *   `transform: translateY(-2px);`
    *   `border-color: #3A5A40;` (Subtle green border activation).
    *   Shadow deepens slightly.

### Typography
*   **Headings**: *Fraunces* (Soft Serif). Weight: Semi-Bold (600). Color: `#1A1C19`.
*   **Body**: *Inter* or *DM Sans*. Weight: Regular (400) / Medium (500). Color: `#444`.
*   **Hierarchy**:
    *   `h1`: Large, Serif, Dark.
    *   `label`: Uppercase, tracking-wide, small, `text-stone`.

---

## 2. Updated Visual Examples

### 1) Explore Page (Composition)
*   **Background**: Full page is `#F2F0E9` (Warm Stone).
*   **Sticky Header**: White `#FFFFFF` with a thin bottom border `#E2E0D6`. Shadow is minimal/none.
    *   Logo: **Commun.** (Serif, Black).
*   **Filter Bar**: Situated below header.
    *   Mouth-pill shaped chips. Default: White bg, Border stone. Selected: Moss Green bg, White text.
*   **The Grid**:
    *   Cards float on the background.
    *   Spacing is generous (gap-8).

### 2) Event Card (The "Hero" Component)
*   **Container**: Pure White `#FFFFFF`. `rounded-xl` (not too round, not too sharp).
*   **Image**: Top 60% of card. Aspect Ratio 4:3. High texture photo.
*   **Content**:
    *   **Tag** (Top left of image): "Workshop". White pill, small text.
    *   **Title** (Below image): "Hand-building Clay Basics". Serif. 1.25rem.
    *   **Meta Row**:
        *   Host Avatar (Circle) + Name ("Clay Studio").
        *   Right aligned: **€45**.
    *   **Footer**: Thin separator line. "Sat, 24 Feb • Kreuzberg".
*   **Interaction**: On mouse over, the border turns distinct Moss Green, card lifts up 2px.

---

## 3. Layout Structure (Next.js)

```
app/
├── (public)/                   # Layout: MainNavbar (Sticky, White), Footer
│   ├── page.tsx                # Explore/Home (Screen A)
│   ├── events/
│   │   └── [id]/
│   │       └── page.tsx        # Event Detail (Screen B)
│   ├── studio/
│   │   └── [id]/
│   │       └── page.tsx        # Studio Public Profile
│   └── about/
├── (auth)/                     # Layout: Centered, Minimal, Warm BG
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (dashboard)/                # Layout: DashboardSidebar (Role aware)
│   ├── layout.tsx              # AuthGuard + Sidebar
│   ├── bookings/               # Participant View
│   ├── saved/                  # Participant View
│   ├── messages/               # Shared View (Thread list)
│   └── host/                   # Host View Group
...
```
