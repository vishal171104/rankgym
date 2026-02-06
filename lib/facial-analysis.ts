/**
 * Facial Analysis Engine
 * Provides deterministic, multi-photo analysis for aesthetic ranking
 */

export interface PhotoCapture {
    dataUrl: string;
    timestamp: number;
    pose: 'front' | 'left' | 'right';
    quality: {
        brightness: number;
        contrast: number;
        sharpness: number;
    };
}

export interface FacialMetrics {
    symmetry: number;      // 0-100
    skinClarity: number;   // 0-100
    definition: number;    // 0-100 (jawline, cheekbones)
    eyeArea: number;       // 0-100
    overall: number;       // 0-100
}

export interface AnalysisResult {
    hunterSeed: string;           // Permanent ID for this user's baseline
    currentState: FacialMetrics;  // Present stats
    potential: FacialMetrics;     // Max achievable stats
    variance: number;             // Consistency score (lower = more reliable)
    quests: Quest[];              // Personalized improvement tasks
    timestamp: number;
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    category: 'skincare' | 'grooming' | 'lifestyle';
    difficulty: 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
    statBoost: Partial<FacialMetrics>;
    duration: string; // e.g., "2 weeks"
}

/**
 * Generate a permanent Hunter Seed from user's first analysis
 * This ensures consistency across sessions
 */
export function generateHunterSeed(photos: PhotoCapture[]): string {
    // Use timestamp + photo count as seed
    const baseData = photos.map(p => p.timestamp).join('-');
    return `HUNTER-${btoa(baseData).substring(0, 12).toUpperCase()}`;
}

/**
 * Analyze image quality metrics
 */
export function analyzeImageQuality(dataUrl: string): PhotoCapture['quality'] {
    // Simulate quality analysis based on data URL length and characteristics
    // In production, this would use actual image processing
    const dataLength = dataUrl.length;

    // Brightness estimation (based on data density)
    const brightness = Math.min(100, Math.max(30, 50 + (dataLength % 50)));

    // Contrast estimation
    const contrast = Math.min(100, Math.max(40, 60 + (dataLength % 40)));

    // Sharpness estimation
    const sharpness = Math.min(100, Math.max(50, 70 + (dataLength % 30)));

    return { brightness, contrast, sharpness };
}

/**
 * Analyze facial metrics from a single photo
 * Uses deterministic algorithms based on image characteristics
 */
export function analyzeSinglePhoto(photo: PhotoCapture, seed: string): FacialMetrics {
    // Use seed to ensure consistency
    const seedValue = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Base scores influenced by image quality
    const qualityFactor = (photo.quality.brightness + photo.quality.contrast + photo.quality.sharpness) / 300;

    // Symmetry (front pose gets higher weight)
    const symmetryBase = photo.pose === 'front' ? 75 : 70;
    const symmetry = Math.min(95, Math.max(60, symmetryBase + (seedValue % 15) * qualityFactor));

    // Skin clarity (affected by brightness)
    const skinBase = 65;
    const skinClarity = Math.min(90, Math.max(50, skinBase + (photo.quality.brightness / 5)));

    // Definition (jawline, cheekbones)
    const definitionBase = 70;
    const definition = Math.min(92, Math.max(55, definitionBase + (photo.quality.contrast / 5)));

    // Eye area
    const eyeBase = 72;
    const eyeArea = Math.min(94, Math.max(60, eyeBase + (seedValue % 20)));

    // Overall score
    const overall = Math.round((symmetry + skinClarity + definition + eyeArea) / 4);

    return { symmetry, skinClarity, definition, eyeArea, overall };
}

/**
 * Ensemble analysis: Average metrics across multiple photos
 */
export function ensembleAnalysis(photos: PhotoCapture[], seed: string): {
    current: FacialMetrics;
    variance: number;
} {
    const analyses = photos.map(photo => analyzeSinglePhoto(photo, seed));

    // Calculate averages
    const current: FacialMetrics = {
        symmetry: Math.round(analyses.reduce((sum, a) => sum + a.symmetry, 0) / analyses.length),
        skinClarity: Math.round(analyses.reduce((sum, a) => sum + a.skinClarity, 0) / analyses.length),
        definition: Math.round(analyses.reduce((sum, a) => sum + a.definition, 0) / analyses.length),
        eyeArea: Math.round(analyses.reduce((sum, a) => sum + a.eyeArea, 0) / analyses.length),
        overall: 0
    };
    current.overall = Math.round((current.symmetry + current.skinClarity + current.definition + current.eyeArea) / 4);

    // Calculate variance (standard deviation of overall scores)
    const mean = current.overall;
    const squaredDiffs = analyses.map(a => Math.pow(a.overall - mean, 2));
    const variance = Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / analyses.length);

    return { current, variance };
}

/**
 * Calculate potential stats (what user could achieve)
 */
export function calculatePotential(current: FacialMetrics): FacialMetrics {
    // Potential is current + improvement margin
    // Higher current stats = smaller improvement margin (diminishing returns)

    const improvementFactor = (stat: number) => {
        if (stat >= 85) return 5;  // Already high
        if (stat >= 70) return 12; // Good baseline
        return 18; // Lots of room for improvement
    };

    return {
        symmetry: Math.min(98, current.symmetry + improvementFactor(current.symmetry)),
        skinClarity: Math.min(97, current.skinClarity + improvementFactor(current.skinClarity)),
        definition: Math.min(96, current.definition + improvementFactor(current.definition)),
        eyeArea: Math.min(95, current.eyeArea + improvementFactor(current.eyeArea)),
        overall: 0
    };
}

/**
 * Generate personalized quests based on weak points
 */
export function generateQuests(current: FacialMetrics, potential: FacialMetrics): Quest[] {
    const quests: Quest[] = [];

    // Skin clarity quests
    if (current.skinClarity < 75) {
        quests.push({
            id: 'skin-clarity-1',
            title: 'Purify the Surface',
            description: 'Use a gentle cleanser twice daily (morning & night). Focus on removing oil and impurities without stripping skin.',
            category: 'skincare',
            difficulty: current.skinClarity < 60 ? 'C' : 'D',
            statBoost: { skinClarity: 8 },
            duration: '2 weeks'
        });
    }

    if (current.skinClarity < 80) {
        quests.push({
            id: 'skin-clarity-2',
            title: 'Hydration Protocol',
            description: 'Apply moisturizer after cleansing. Drink 3L water daily. Avoid excessive sugar and processed foods.',
            category: 'lifestyle',
            difficulty: 'D',
            statBoost: { skinClarity: 6 },
            duration: '3 weeks'
        });
    }

    // Definition quests (jawline, facial structure)
    if (current.definition < 75) {
        quests.push({
            id: 'definition-1',
            title: 'Sharpen the Blade',
            description: 'Practice mewing (tongue posture) for 10 minutes daily. Keep entire tongue pressed against roof of mouth.',
            category: 'grooming',
            difficulty: 'C',
            statBoost: { definition: 10 },
            duration: '4 weeks'
        });
    }

    if (current.definition < 70) {
        quests.push({
            id: 'definition-2',
            title: 'Reduce Bloat',
            description: 'Cut sodium intake by 50%. Avoid processed foods, chips, and instant noodles. This reduces facial water retention.',
            category: 'lifestyle',
            difficulty: 'B',
            statBoost: { definition: 12, skinClarity: 5 },
            duration: '2 weeks'
        });
    }

    // Eye area quests
    if (current.eyeArea < 75) {
        quests.push({
            id: 'eye-area-1',
            title: 'Rest & Recovery',
            description: 'Sleep 7-8 hours nightly. Use cold compress on eyes for 5 minutes each morning to reduce puffiness.',
            category: 'lifestyle',
            difficulty: 'D',
            statBoost: { eyeArea: 8 },
            duration: '1 week'
        });
    }

    // Symmetry quests
    if (current.symmetry < 80) {
        quests.push({
            id: 'symmetry-1',
            title: 'Posture Correction',
            description: 'Maintain proper head and neck alignment. Avoid sleeping on one side consistently. Check posture hourly.',
            category: 'grooming',
            difficulty: 'C',
            statBoost: { symmetry: 7 },
            duration: '3 weeks'
        });
    }

    // Advanced quest for high performers
    if (current.overall >= 75) {
        quests.push({
            id: 'advanced-1',
            title: 'Peak Optimization',
            description: 'Apply retinol serum 3x weekly (night only). Increases collagen production and skin refinement.',
            category: 'skincare',
            difficulty: 'A',
            statBoost: { skinClarity: 10, definition: 5 },
            duration: '6 weeks'
        });
    }

    return quests;
}

/**
 * Complete facial analysis from multiple photos
 */
export function performAnalysis(photos: PhotoCapture[], existingSeed?: string): AnalysisResult {
    // Generate or use existing Hunter Seed
    const hunterSeed = existingSeed || generateHunterSeed(photos);

    // Ensemble analysis
    const { current, variance } = ensembleAnalysis(photos, hunterSeed);

    // Calculate potential
    const potential = calculatePotential(current);
    potential.overall = Math.round((potential.symmetry + potential.skinClarity + potential.definition + potential.eyeArea) / 4);

    // Generate quests
    const quests = generateQuests(current, potential);

    return {
        hunterSeed,
        currentState: current,
        potential,
        variance: Math.round(variance * 10) / 10,
        quests,
        timestamp: Date.now()
    };
}
