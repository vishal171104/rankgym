# RankGym - The Hunter System

**RankGym** is a gamified fitness application inspired by "Solo Leveling," designed to turn your daily workout routine into an immersive RPG experience. By tracking your real-world physical stats, completing daily quests, and syncing with Apple Health, you "level up" your rank from E-Class to S-Class.

## 🚀 Features

### 🎮 **Gamification System**
- **RankOrb Core**: A visual representation of your current level and progress.
- **Class System**: Progress through ranks (E, D, C, B, A, S) based on your performance.
- **Stats Hexagon**: Visual radar chart displaying your **STR** (Strength), **AGI** (Agility), **VIT** (Vitality), and **PER** (Perception).
- **XP Tracking**: Gain experience points for every log and quest completed.

### 👤 **Hunter Profile (ID Card)**
- **Smart Setup**: Automated profile creation flow that calculates your starting rank based on real-world benchmarks.
- **Stats Calibration**: Enter your 1-Rep Max (Bench, Squat, Deadlift) and cardio metrics (5km run, Burpees) to get an accurate "Power Level".
- **Dynamic Profile Card**: Displays your active days, age, weight, and favorite reward meals.

### 📅 **Quest System**
- **Daily Quests**: Automatically generated fitness tasks (e.g., "Push Ups: 100 reps") to keep you active.
- **Sudden Quests**: Random "Emergency" side quests that pop up (rare chance) offering high-risk, high-reward challenges.
- **Penalty System**: (Planned) Consequences for missing daily logs.

### 🍎 **Health Integration**
- **Apple Health Sync**: seamless integration via Capacitor Health.
- **Real-time Stats**: Automatically pulls and displays:
  - Daily Steps
  - Active Calories (Kcal)
  - Sleep Duration

### 🔔 **System Alerts**
- **Smart Notifications**: Daily reminders at 6:00 PM to log your workout.
- **Dynamic Island Support**: UI elements are designed to respect the iPhone safe areas, with notifications appearing elegantly below the camera cutout.

### 🧠 **AI Analysis (Simulation)**
- **Physique Scan**: Upload a photo to "analyze" body composition (Simulated logic for varying ranks).
- **Item Scanner**: Type in foods or items to get a "System Analysis" of their Vitality or Toxicity levels.

---

## 🛠 Technology Stack

**Core Frameworks:**
- **Next.js 15+** (React Framework)
- **Capacitor 7** (Native iOS Bridge)
- **TypeScript** (Type Safety)

**UI & Styling:**
- **Tailwind CSS v4** (Styling)
- **Framer Motion** (Complex Animations)
- **Lucide React** (Iconography)
- **Shadcn/UI** (Component Primitives)
- **Recharts** (Radar/Spider Charts)

**Native Plugin:**
- `@capgo/capacitor-health` (HealthKit)
- `@capacitor/local-notifications` (System Alerts)
- `@capacitor/ios` (iOS Platform)

---

## 📖 Usage Guide

1.  **Awakening (First Setup)**:
    - Upon first launch, you will enter the "Awakening" process.
    - Enter your codename, date of birth, and biometric data.
    - **Calibration**: Input your exercise benchmarks (Bench Press, Squat, Pushups, etc.). The system uses these to calculate your initial Rank and Stats (STR/AGI/VIT).

2.  **The Dashboard**:
    - The main screen shows your **Rank Orb** and current Class.
    - View your live Health Stats (Steps, Sleep, Kcal).
    - Check the **Radar Chart** to see your stats balance.

3.  **Completing Quests**:
    - Tap "Daily Quest" or the **Log** button in the bottom nav.
    - Check off tasks as you complete them in the gym.
    - Confirming a log grants XP and updates your "Active Days" streak.

4.  **Edit Profile**:
    - Go to the Profile page to view your Hunter ID.
    - Click "Edit" to re-calibrate your stats as you get stronger in real life.

---

## ⚙️ Installation & Development

To run this project locally or deploy to a device:

1.  **Prerequisites**:
    - Node.js & npm
    - Xcode (for iOS simulation/building)
    - CocoaPods

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Build Web Assets**:
    ```bash
    npm run build
    ```

4.  **Sync with Capacitor**:
    ```bash
    npx cap sync
    ```

5.  **Run on iOS**:
    ```bash
    npx cap open ios
    # Inside Xcode: Select your device and hit the "Play" button.
    ```

---

## 🛡️ Security & Privacy Information

### Data Privacy
- **Local Storage**: All user data (profile, logs, quests) is stored **locally** on your device using `localStorage`. No data is sent to any external cloud server or database. You own your data.
- **Apple Health**: Health data (steps, sleep) is queried strictly with your **permission**. The app only *reads* this data to display it in the UI; it does not store it permanently or share it.

### Permissions
- **Notifications**: Required to send daily reminders.
- **HealthKit**: Required to read step count and sleep analysis.

### Risks
- **Data Loss**: Since data is local, deleting the app will delete your profile progress unless you have an iCloud backup of the app container.
- **Medical Disclaimer**: The "Stats" and "Analysis" are for entertainment and gamification purposes only. Do not use this app as a substitute for professional medical advice.

---

## 💡 Why It's Helpful?

**Motivation via Gamification**:
Traditional fitness tracking is boring. RankGym uses the "Solo Leveling" philosophy to turn self-improvement into a game. Seeing your "STR" stat go up or your Rank change from "D" to "C" provides a dopamine hit that reinforces consistent training habits.

**Holistic View**:
By combining manual lifting stats (Benchmarks) with passive health data (Steps/Sleep), it gives you a complete picture of your "Hunter" status—balancing active strength with recovery (Vitality).


