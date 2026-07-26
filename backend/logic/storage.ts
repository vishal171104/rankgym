import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export interface Profile {
    dob?: string; // ISO Date YYYY-MM-DD
    startDate?: string; // ISO Date YYYY-MM-DD
    weight: number;
    height: number;
    goal: 'bulk' | 'cut' | 'maintain';
    experience: 'beginner' | 'intermediate' | 'advanced';
    startRank: number; // 0-100
    currentRank: number; // 0-100
    name?: string;
    favoriteFoods?: string[];
    hunterSeed?: string; // Permanent ID for facial analysis consistency
    stats: {
        str: number; // Strength - Pushups/Weights
        agi: number; // Agility - Running/Jump Rope
        vit: number; // Vitality - Plank/Recovery
        per: number; // Perception/Focus - Meditation/Form
    };
    benchmarks?: {
        benchPress: number; // kg
        squat: number; // kg
        deadlift: number; // kg
        maxPushups: number; // reps
        run5km: string; // "MM:SS" or minutes
        maxBurpees: number; // reps in 1 min
    };
}

export interface QuestTask {
    name: string;
    target: number;
    current?: number; // Current progress for reps/stats
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
    statReward?: {
        str?: number;
        agi?: number;
        vit?: number;
        per?: number;
    };
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
    DAILY_QUEST: 'anti_gravity_daily_quest',
    SIDE_QUESTS: 'anti_gravity_side_quests',
    AESTHETIC_PROTOCOL: 'anti_gravity_aesthetic_protocol'
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

    getDailyQuest: (): Quest | null => {
        if (typeof window === 'undefined') return null;
        const data = localStorage.getItem(STORAGE_KEYS.DAILY_QUEST);
        return data ? JSON.parse(data) : null;
    },

    saveDailyQuest: (quest: Quest | null) => {
        if (typeof window === 'undefined') return;
        if (quest === null) {
            localStorage.removeItem(STORAGE_KEYS.DAILY_QUEST);
        } else {
            localStorage.setItem(STORAGE_KEYS.DAILY_QUEST, JSON.stringify(quest));
        }
    },

    getSideQuests: (): Quest[] => {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(STORAGE_KEYS.SIDE_QUESTS);
        return data ? JSON.parse(data) : [];
    },

    saveSideQuests: (quests: Quest[]) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEYS.SIDE_QUESTS, JSON.stringify(quests));
    },

    addSideQuest: (quest: Quest) => {
        if (typeof window === 'undefined') return;
        const quests = Storage.getSideQuests();
        quests.push(quest);
        localStorage.setItem(STORAGE_KEYS.SIDE_QUESTS, JSON.stringify(quests));
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

    getAestheticProtocol: (): { date: string, items: { id: string, done: boolean, value?: number }[] } | null => {
        if (typeof window === 'undefined') return null;
        const data = localStorage.getItem(STORAGE_KEYS.AESTHETIC_PROTOCOL);
        return data ? JSON.parse(data) : null;
    },

    saveAestheticProtocol: (data: { date: string, items: { id: string, done: boolean, value?: number }[] }) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEYS.AESTHETIC_PROTOCOL, JSON.stringify(data));
    },

    exportUserData: (): string => {
        if (typeof window === 'undefined') return '{}';
        const dump = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            profile: Storage.getProfile(),
            dailyQuest: Storage.getDailyQuest(),
            sideQuests: Storage.getSideQuests(),
            logs: Storage.getLogs(),
            aestheticProtocol: Storage.getAestheticProtocol(),
        };
        return JSON.stringify(dump, null, 2);
    },

    importUserData: (jsonString: string): boolean => {
        if (typeof window === 'undefined') return false;
        try {
            const data = JSON.parse(jsonString);
            if (data.profile) Storage.saveProfile(data.profile);
            if (data.dailyQuest) Storage.saveDailyQuest(data.dailyQuest);
            if (data.sideQuests) Storage.saveSideQuests(data.sideQuests);
            if (data.logs && Array.isArray(data.logs)) {
                localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(data.logs));
            }
            if (data.aestheticProtocol) Storage.saveAestheticProtocol(data.aestheticProtocol);
            return true;
        } catch (e) {
            console.error("Failed to import user data:", e);
            return false;
        }
    },

    clearAll: () => {
        if (typeof window === 'undefined') return;
        localStorage.clear();
    }
};
