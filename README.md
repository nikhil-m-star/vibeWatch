# 🎬 Vibe Watch

Vibe Watch is a state-of-the-art, premium AI-powered cinema concierge and recommendation platform. It translates your immediate emotional states, pacing preferences, and specific movie queries into highly curated recommendations. 

Powered by **NVIDIA NIM** (LLaMA-based reasoning model) and integrated with the **TMDb (The Movie Database)** API, Vibe Watch matches your personal vibe to the perfect film or television series in seconds.

---

## ✨ Features

- **🧠 Vibe-Driven AI Recommendation Engine**: Powered by NVIDIA NIM LLaMA models to translate text vibes, genres, pacing, and tones into highly personalized suggestions.
- **🎞️ GPU-Accelerated Cover Flow Loading**: A buttery-smooth, fullscreen, hardware-accelerated 3D carousel that displays live trending movie posters moving across the viewport while recommendations compile.
- **💫 Playful Prompt Presets**: Dynamic pill-shaped empty-state vibe selectors that wiggle, scale, and light up in vibe-specific color signatures on hover.
- **🚫 Real-Time Watched Exclusion Logic**: Mark titles as "watched" to instantly trigger a single-card replacement recommendation. The system filters out all previously watched movies and TV series using strict server-side exclusion mappings.
- **💾 LocalStorage Session Persistence**: Your ongoing chat session history and recommendation outputs survive browser reloads and navigation so you never lose your matches.
- **📱 Premium Borderless Dark Theme**: Sleek, pure-black theme with high-contrast electric violet details, geometric `Outfit` typography, and layout lines.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router & React Server Actions)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database ORM**: [Prisma](https://www.prisma.io/) with PostgreSQL
- **AI Inference Model**: [NVIDIA NIM](https://build.nvidia.com/) (LLaMA 3 Instruct)
- **Cinema Data Integration**: [TMDb API](https://www.themoviedb.org/documentation/api)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### 📋 Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.x or higher)
- **npm** or **yarn**
- A running **PostgreSQL** database instance (e.g., Supabase or local PostgreSQL)

---

### ⚙️ Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/nikhil-m-star/vibeWatch.git
   cd vibeWatch
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` (and `.env.local` for client configuration) in the root directory and add the following:
   ```env
   # PostgreSQL database connection string
   DATABASE_URL="postgresql://username:password@localhost:5432/vibewatch"

   # Clerk Authentication Keys (if enabled)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # TMDB API Configuration
   TMDB_API_KEY=your_tmdb_api_key

   # NVIDIA NIM Configuration
   NVIDIA_NIM_API_KEY=your_nvidia_nim_api_key
   ```

4. **Initialize Database Tables**:
   Push the Prisma schema definition to your database instance:
   ```bash
   npx prisma db push
   ```

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to experience Vibe Watch locally!

---

## 📁 Project Structure

```
├── prisma/                 # Database schema models and configurations
├── public/                 # Static asset delivery (favicons, logos)
├── src/
│   ├── app/                # Next.js App Router Page directories
│   │   ├── actions/        # Server Actions (chat, watchlist, history)
│   │   ├── mood-chat/      # AI Vibe Chat interface
│   │   └── layout.tsx      # Main wrapper importing Outfit font
│   ├── components/         # Premium UI Components (Header, Cards)
│   ├── lib/                # Shared utilities (NVIDIA NIM wrappers, TMDb clients)
│   └── styles/             # Global CSS and GPU keyframe configurations
```

---

## ⚡ Key Commands

- `npm run dev`: Boots the development server.
- `npm run build`: Prepares production bundle for Vercel/Next deployment.
- `npx prisma studio`: Launches visual database browser GUI.
- `npx tsc --noEmit`: Verifies strict TypeScript compliance.
