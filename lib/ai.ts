import * as tf from '@tensorflow/tfjs';
import { DailyLog, Storage, Quest, Profile } from './storage';

// Define the shape of our input features
// Features: [volume, soreness, sleep, stress, bodyweight_change_ratio]
const INPUT_SHAPE = 5;

export class GymAI {
    model: tf.LayersModel | null = null;
    isTraining: boolean = false;

    constructor() {
        this.initModel();
    }

    async initModel() {
        // Try to load from localStorage first
        try {
            this.model = await tf.loadLayersModel('localstorage://anti_gravity_model');
            console.log('Model loaded from local storage');
        } catch (e) {
            console.log('Creating new model');
            this.createModel();
        }
    }

    createModel() {
        const model = tf.sequential({
            layers: [
                tf.layers.dense({ units: 32, activation: 'relu', inputShape: [INPUT_SHAPE] }),
                tf.layers.dropout({ rate: 0.2 }), // Prevent overfitting on small datasets
                tf.layers.dense({ units: 16, activation: 'relu' }),
                tf.layers.dense({ units: 1, activation: 'linear' }) // Predict next optimal volume
            ]
        });

        model.compile({
            optimizer: tf.train.adam(0.01),
            loss: 'meanSquaredError',
            metrics: ['mse']
        });

        this.model = model;
    }

    // Preprocess logs into tensors
    processData(logs: DailyLog[]) {
        if (logs.length < 5) return null; // Need some history

        const inputs: number[][] = [];
        const labels: number[] = [];

        // Create a sliding window dataset
        // We want to predict the *next* wokout's volume based on previous stats
        for (let i = 0; i < logs.length - 1; i++) {
            const current = logs[i];
            const next = logs[i + 1];

            // Features
            inputs.push([
                current.volume,
                current.soreness / 5, // Normalize 0-1
                current.sleep / 10,   // Normalize 0-1
                current.stress / 5,   // Normalize 0-1
                1.0 // Placeholder for weight change if needed
            ]);

            // Label: What volume allowed them to continue? 
            // Ideally we'd have a "success" metric, here we assume past history defines capacity
            labels.push(next.volume);
        }

        return {
            xs: tf.tensor2d(inputs),
            ys: tf.tensor2d(labels, [labels.length, 1])
        };
    }

    async train() {
        if (this.isTraining || !this.model) return;

        const logs = Storage.getLogs();
        if (logs.length < 5) {
            console.warn("Not enough data to train");
            return;
        }

        const data = this.processData(logs);
        if (!data) return;

        this.isTraining = true;
        console.log("Starting training...");

        // Train until convergence or max epochs
        // User asked for "best accuracy", so we use a high epoch count with callbacks
        try {
            await this.model.fit(data.xs, data.ys, {
                epochs: 200,
                batchSize: 4,
                shuffle: true,
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        if (epoch % 50 === 0) console.log(`Epoch ${epoch}: loss = ${logs?.loss}`);
                    }
                }
            });

            await this.model.save('localstorage://anti_gravity_model');
            console.log("Training complete & saved.");
        } catch (err) {
            console.error("Training error:", err);
        } finally {
            // Cleanup tensors
            data.xs.dispose();
            data.ys.dispose();
            this.isTraining = false;
        }
    }

    async predictNextVolume(currentStats: { soreness: number, sleep: number, stress: number, currentVolume: number }): Promise<number> {
        if (!this.model) return currentStats.currentVolume * 1.02; // Fallback simple progressive overload

        const input = tf.tensor2d([[
            currentStats.currentVolume,
            currentStats.soreness / 5,
            currentStats.sleep / 10,
            currentStats.stress / 5,
            1.0
        ]]);

        const prediction = this.model.predict(input) as tf.Tensor;
        const result = (await prediction.data())[0];

        input.dispose();
        prediction.dispose();

        return result;
    }

    generateDailyQuest(profile: Profile, logs: DailyLog[]): Quest {
        // 1. Determine Difficulty based on Rank
        // Base stats
        let pushups = 50;
        let situps = 50;
        let runKm = 5;
        let squats = 50;

        // Scaling factor
        const scale = 1 + (profile.currentRank / 100) * 2; // Up to 3x multiplier at max rank

        pushups = Math.floor(pushups * scale);
        situps = Math.floor(situps * scale);
        runKm = Math.floor(runKm * (1 + profile.currentRank / 200)); // Run scales slower
        squats = Math.floor(squats * scale);

        // 2. Adjust based on logs (Recovery)
        // If recovery is poor (low sleep, high soreness), reduce volume by 20%
        if (logs.length > 0) {
            const last = logs[logs.length - 1];
            const recoveryScore = (last.sleep / 10 + (5 - last.stress) / 5 + (5 - last.soreness) / 5) / 3;
            if (recoveryScore < 0.5) {
                pushups = Math.floor(pushups * 0.8);
                situps = Math.floor(situps * 0.8);
                squats = Math.floor(squats * 0.8);
            }
        }

        // 3. Rewards
        // Pick a random favorite food if available
        const foods = profile.favoriteFoods && profile.favoriteFoods.length > 0
            ? profile.favoriteFoods
            : ['Pizza', 'Burger', 'Sushi', 'Steak', 'Ice Cream'];
        const randomFood = foods[Math.floor(Math.random() * foods.length)];

        return {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            type: 'DAILY',
            difficulty: this.getRankLetter(profile.currentRank),
            tasks: [
                { name: 'Push-ups', target: pushups, unit: 'reps', completed: false },
                { name: 'Sit-ups', target: situps, unit: 'reps', completed: false },
                { name: 'Squats', target: squats, unit: 'reps', completed: false },
                { name: 'Running', target: runKm, unit: 'km', completed: false }
            ],
            reward: `Allowed to consume: ${randomFood}`,
            punishment: 'PENALTY ZONE: Survival Quest (4 hours)',
            status: 'pending',
            xpReward: Math.floor(100 * scale)
        };
    }

    generatePenaltyQuest(): Quest {
        return {
            id: `penalty-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            type: 'PENALTY',
            difficulty: 'S', // Always hard relative to state
            tasks: [
                { name: 'Survival Run', target: 10, unit: 'km', completed: false },
                { name: 'Burpees', target: 100, unit: 'reps', completed: false }
            ],
            reward: 'Status Recovery',
            punishment: 'DEATH (Account Reset)', // Flavor text
            status: 'pending',
            xpReward: 0 // No XP for penalties
        };
    }

    generateSideQuest(): Quest {
        const sideQuests = [
            { name: 'Shadow Boxing', target: 5, unit: 'min' },
            { name: 'Plank', target: 2, unit: 'min' },
            { name: 'Wall Sit', target: 2, unit: 'min' },
            { name: 'Jumping Jacks', target: 50, unit: 'reps' },
            { name: 'Stretching', target: 10, unit: 'min' },
            { name: 'Meditation', target: 5, unit: 'min' },
        ];
        const randomTask = sideQuests[Math.floor(Math.random() * sideQuests.length)];

        return {
            id: `side-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            type: 'SIDE',
            difficulty: 'E',
            tasks: [
                { name: randomTask.name, target: randomTask.target, unit: randomTask.unit, completed: false }
            ],
            reward: 'Instant Recovery (Small XP)',
            punishment: 'None',
            status: 'pending',
            xpReward: 20
        };
    }

    private getRankLetter(score: number): 'E' | 'D' | 'C' | 'B' | 'A' | 'S' {
        if (score >= 90) return 'S';
        if (score >= 75) return 'A';
        if (score >= 60) return 'B';
        if (score >= 45) return 'C';
        if (score >= 30) return 'D';
        return 'E';
    }
}

export const gymAI = new GymAI();
