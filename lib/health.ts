import { Capacitor } from '@capacitor/core';
import { Health as CapacitorHealth, HealthDataType } from '@capgo/capacitor-health';

export const HEALTH_DATA_TYPES: HealthDataType[] = [
    'steps',
    'distance',
    'calories', // Active energy burned
    'sleep',
    'heartRate',
    'weight',
];

export interface HealthStats {
    steps: number;
    distance: number; // meters
    calories: number; // kcal
    sleepMinutes: number;
    avgHeartRate: number;
    weight?: number;
}

export class HealthService {
    static async requestPermissions(): Promise<boolean> {
        if (!Capacitor.isNativePlatform()) {
            console.warn("HealthKit not available on web");
            return false;
        }

        try {
            const status = await CapacitorHealth.requestAuthorization({
                read: HEALTH_DATA_TYPES,
                write: [],
            });
            // Check if at least one permission was granted or if the OS handled it
            // Note: iOS often doesn't reveal true status for privacy, but we proceed.
            return true;
        } catch (error) {
            console.error("Error requesting health permissions:", error);
            return false;
        }
    }

    static async getTodayStats(): Promise<HealthStats> {
        if (!Capacitor.isNativePlatform()) {
            // Mock data for web development
            return {
                steps: 6543,
                distance: 4500,
                calories: 320,
                sleepMinutes: 450,
                avgHeartRate: 72,
                weight: 75,
            };
        }

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const endOfDay = now.toISOString();

        const stats: HealthStats = {
            steps: 0,
            distance: 0,
            calories: 0,
            sleepMinutes: 0,
            avgHeartRate: 0,
        };

        try {
            // Steps
            const stepsData = await CapacitorHealth.queryAggregated({
                dataType: 'steps',
                startDate: startOfDay,
                endDate: endOfDay,
                bucket: 'day',
            });
            if (stepsData.samples.length > 0) {
                stats.steps = stepsData.samples.reduce((acc, curr) => acc + curr.value, 0);
            }

            // Distance
            const distData = await CapacitorHealth.queryAggregated({
                dataType: 'distance',
                startDate: startOfDay,
                endDate: endOfDay,
                bucket: 'day',
            });
            if (distData.samples.length > 0) {
                stats.distance = distData.samples.reduce((acc, curr) => acc + curr.value, 0);
            }

            // Calories
            const calData = await CapacitorHealth.queryAggregated({
                dataType: 'calories',
                startDate: startOfDay,
                endDate: endOfDay,
                bucket: 'day',
            });
            if (calData.samples.length > 0) {
                stats.calories = calData.samples.reduce((acc, curr) => acc + curr.value, 0);
            }

            // Sleep (Note: Sleep is complex, often stores as samples, not aggregated nicely in all plugins)
            // Usually we read samples for sleep
            const sleepData = await CapacitorHealth.readSamples({
                dataType: 'sleep',
                startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // Look back 24h
                endDate: endOfDay,
                limit: 100,
            });
            // Simple logic: sum duration of 'asleep' samples that overlap with 'last night'
            // For now, let's just sum all found sleep samples in last 24h as a rough estimate
            let totalSleepSeconds = 0;
            sleepData.samples.forEach(s => {
                if (s.sleepState === 'asleep' || s.sleepState === 'deep' || s.sleepState === 'rem' || s.sleepState === 'light') {
                    const start = new Date(s.startDate).getTime();
                    const end = new Date(s.endDate).getTime();
                    totalSleepSeconds += (end - start) / 1000;
                }
            });
            stats.sleepMinutes = Math.floor(totalSleepSeconds / 60);

        } catch (e) {
            console.error("Error fetching health stats:", e);
        }

        return stats;
    }
}
