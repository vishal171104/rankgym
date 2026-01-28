import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export interface Profile {
    age: number;
    weight: number;
    height: number;
    goal: 'bulk' | 'cut' | 'maintain';
    experience: 'beginner' | 'intermediate' | 'advanced';
    startRank: number; // 0-100
    currentRank: number; // 0-100
    name?: string;
    favoriteFoods?: string[];
}

export interface QuestTask {
    name: string;
    target: number;
    unit: string;
    completed: boolean;
}

export interface Quest {
    id: string;
    date: string; // ISO Date (YYYY-MM-DD)
    type: 'DAILY' | 'PENALTY' | 'SIDE';
    tasks: QuestTask[];
    difficulty: 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
    reward: string;
    punishment: string;
    status: 'pending' | 'completed' | 'failed';
    xpReward: number;
}

export interface DailyLog {
    id: string;
    date: string;
    workoutType: string;
    volume: number; // total weight * reps
    soreness: number; // 1-5
    sleep: number; // 1-10 (quality)
    stress: number; // 1-5
    xpGained: number;
}

export interface TrainingModel {
    weights: number[]; // Simplified for storage
}

const STORAGE_KEYS = {
    PROFILE: 'anti_gravity_profile',
    LOGS: 'anti_gravity_logs',
    MODEL: 'anti_gravity_model',
    QUEST: 'anti_gravity_active_quest'
};

export const Storage = {
    getProfile: (): Profile | null => {
        if (typeof window === 'undefined') return null;
        const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
        return data ? JSON.parse(data) : null;
    },

    saveProfile: (profile: Profile) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    },

    getCurrentQuest: (): Quest | null => {
        if (typeof window === 'undefined') return null;
        const data = localStorage.getItem(STORAGE_KEYS.QUEST);
        if (!data) return null;

        const quest = JSON.parse(data);
        // Check if quest is from a previous day and not completed -> fail it?
        // For now just return it
        return quest;
    },

    saveQuest: (quest: Quest | null) => {
        if (typeof window === 'undefined') return;
        if (quest === null) {
            localStorage.removeItem(STORAGE_KEYS.QUEST);
        } else {
            localStorage.setItem(STORAGE_KEYS.QUEST, JSON.stringify(quest));
        }
    },

    getLogs: (): DailyLog[] => {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(STORAGE_KEYS.LOGS);
        return data ? JSON.parse(data) : [];
    },

    addLog: (log: DailyLog) => {
        if (typeof window === 'undefined') return;
        const logs = Storage.getLogs();
        logs.push(log);
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    },

    saveModelWeights: (weights: string) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEYS.MODEL, weights);
    },

    getModelWeights: (): string | null => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(STORAGE_KEYS.MODEL);
    },

    clearAll: () => {
        if (typeof window === 'undefined') return;
        localStorage.clear();
    }
};
