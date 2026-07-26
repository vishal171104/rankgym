# 🧠 Backend Logic & System Services

This directory contains the core logic and functionalities of the **Hunter System**. These services are shared across the frontend components and handle the "intelligence" of the application.

### 📂 Structure

- **`ai.ts`**: TensorFlow.js integration for workout prediction and quest generation.
- **`facial-analysis.ts`**: Image quality assessment and Hunter potential calculations.
- **`health.ts`**: Capacitor HealthKit integration for fetching real-time vitals and activity.
- **`knowledge-base.ts`**: Dataset for food/habit analysis and system tips.
- **`notifications.ts`**: Local notification scheduling for mission reminders.
- **`storage.ts`**: Persistent data management (localStorage/Profile structure).
- **`utils.ts`**: Shared utility functions and UI helpers.

### 🛠️ Usage
All services are aliased to `@/lib/*` for clean imports across the project.
