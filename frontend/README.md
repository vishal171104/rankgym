# 🎨 Frontend UI & Application Shell

This directory contains the user interface, routing, and aesthetic components of the **Hunter System**.

### 📂 Structure

- **`app/`**: Next.js App Router folders (pages and layouts).
- **`components/`**: 
  - `shared/`: Generic Hunter-themed UI elements (Buttons, Cards, Headers).
  - `features/`: Domain-specific UI blocks (Quest lists, Profile views, Health grids).
  - `ui/`: Base Shadcn/UI primitives.
- **`hooks/`**: Custom React hooks for application state.
- **`public/`**: Static assets, manifest, and system icons.

### 🏗️ Build System
The build is orchestrated from the root directory using:
- `npm run dev`: Starts the dev server for the frontend.
- `npm run build`: Synchronizes types and generates a static export in `frontend/out`.
