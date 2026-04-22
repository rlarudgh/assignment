# Frontend

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Runtime | Bun |
| UI | React 19, TailwindCSS v4 |
| State Management | Zustand |
| HTTP Client | Axios |
| Architecture | FSD (Feature-Sliced Design) |

## FSD Structure

```
src/
├── app/        # Layer 1 - Next.js App Router, providers, global styles
├── pages/      # Layer 2 - Route page components
├── widgets/    # Layer 3 - Composite UI blocks (header, sidebar, etc.)
├── features/   # Layer 4 - User interaction features (auth, search, etc.)
├── entities/   # Layer 5 - Business domain entities (user, product, etc.)
└── shared/     # Layer 6 - Shared code (UI components, API client, utils, types)
```

## Getting Started

```bash
bun install
bun dev
```

Open http://localhost:3000
