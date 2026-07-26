export type ItemType = 'food' | 'drink' | 'habit' | 'exercise';
export type EffectType = 'vitality' | 'toxicity' | 'neutral';

export interface KnowledgeItem {
    id: string;
    name: string;
    type: ItemType;
    effect: EffectType;
    score: number; // Positive for vitality, negative for toxicity
    message: string;
    tags: string[]; // e.g., 'protein', 'sugar', 'cardio'
}

export const KNOWLEDGE_BASE: KnowledgeItem[] = [
    // Foods - Good
    { id: 'chicken_breast', name: 'Chicken Breast', type: 'food', effect: 'vitality', score: 10, message: "Lean protein detected. Muscle synthesis initializing.", tags: ['protein', 'lean'] },
    { id: 'salmon', name: 'Salmon', type: 'food', effect: 'vitality', score: 12, message: "Omega-3 fatty acids acquired. Cognitive and joint function reinforced.", tags: ['protein', 'healthy_fats'] },
    { id: 'broccoli', name: 'Broccoli', type: 'food', effect: 'vitality', score: 8, message: "Micronutrients assimilated. Cellular defense boosted.", tags: ['vegetable', 'fiber'] },
    { id: 'oats', name: 'Oats', type: 'food', effect: 'vitality', score: 7, message: "Complex carbohydrates loaded. Sustained energy levels optimized.", tags: ['carbs', 'fiber'] },
    { id: 'greek_yogurt', name: 'Greek Yogurt', type: 'food', effect: 'vitality', score: 9, message: "Probiotics and casein protein found. Gut health and recovery enhanced.", tags: ['protein', 'dairy'] },
    { id: 'eggs', name: 'Eggs', type: 'food', effect: 'vitality', score: 9, message: "Bioavailable protein and choline secured. Anabolic state supported.", tags: ['protein', 'fats'] },
    { id: 'blueberries', name: 'Blueberries', type: 'food', effect: 'vitality', score: 8, message: "Antioxidant surgeon deployed. Oxidative stress reducing.", tags: ['fruit', 'antioxidant'] },

    // Foods - Bad
    { id: 'soda', name: 'Soda', type: 'drink', effect: 'toxicity', score: -15, message: "WARNING: High sugar content. Insulin spike imminent. Metabolic disruption detected.", tags: ['sugar', 'processed'] },
    { id: 'processed_meat', name: 'Processed Meat', type: 'food', effect: 'toxicity', score: -10, message: "WARNING: Nitrates and high sodium. Cardiovascular stress increased.", tags: ['processed', 'sodium'] },
    { id: 'alcohol', name: 'Alcohol', type: 'drink', effect: 'toxicity', score: -20, message: "CRITICAL WARNING: Toxin detected. Liver workload maximum. Muscle recovery Halted.", tags: ['alcohol', 'toxin'] },
    { id: 'fried_food', name: 'Deep Fried Food', type: 'food', effect: 'toxicity', score: -12, message: "WARNING: Trans fats identified. Inflammation markers rising.", tags: ['fat', 'processed'] },

    // Drinks - Good
    { id: 'water', name: 'Water', type: 'drink', effect: 'vitality', score: 5, message: "Hydration levels restored. Biological functions optimized.", tags: ['hydration'] },
    { id: 'green_tea', name: 'Green Tea', type: 'drink', effect: 'vitality', score: 7, message: "Catechins absorbed. Metabolic rate slightly enhanced.", tags: ['antioxidant', 'caffeine'] },

    // Habits/Exercise
    { id: 'sleep_8h', name: '8 Hours Sleep', type: 'habit', effect: 'vitality', score: 20, message: "Optimal recovery cycle completed. Growth hormone secretion maximized.", tags: ['recovery'] },
    { id: 'weight_lifting', name: 'Weight Lifting', type: 'exercise', effect: 'vitality', score: 15, message: "Hypertrophy stimulus applied. Muscle tissue remodeling initiated.", tags: ['strength'] },
    { id: 'cardio', name: 'Cardio', type: 'exercise', effect: 'vitality', score: 10, message: "Cardiovascular output increased. Endurance capacity expanding.", tags: ['cardio'] },
    // Skincare & Aesthetics (New Dataset)
    { id: 'sunscreen', name: 'Sunscreen', type: 'habit', effect: 'vitality', score: 10, message: "UV Shield Active. Collagen preservation initialized. Aging delayed.", tags: ['skincare', 'looks'] },
    { id: 'retinol', name: 'Retinol', type: 'habit', effect: 'vitality', score: 8, message: "Cellular turnover accelerated. Skin texture refinement optimization.", tags: ['skincare', 'looks'] },
    { id: 'moisturizer', name: 'Moisturizer', type: 'habit', effect: 'vitality', score: 5, message: "Epidermal barrier reinforced. Hydration glow active.", tags: ['skincare', 'looks'] },
    { id: 'face_wash', name: 'Face Wash', type: 'habit', effect: 'vitality', score: 5, message: "Pore debris eliminated. Surface bacteria neutralized.", tags: ['skincare', 'looks'] },
    { id: 'cold_shower', name: 'Cold Shower', type: 'habit', effect: 'vitality', score: 7, message: "Thermic shock initiated. Blood circulation and alertness boosted.", tags: ['health', 'looks'] },
    { id: 'mewing', name: 'Mewing', type: 'habit', effect: 'vitality', score: 5, message: "Tongue posture corrected. Jawline definition protocol active.", tags: ['looks', 'posture'] },
    { id: 'neck_curls', name: 'Neck Training', type: 'exercise', effect: 'vitality', score: 8, message: "Neck hypertrophy stimulus. Aesthetics and durability enhanced.", tags: ['looks', 'strength'] },

    // Aesthetic Foods
    { id: 'carrots', name: 'Carrots', type: 'food', effect: 'vitality', score: 6, message: "Beta-carotene assimilated. Skin tone warmth increasing.", tags: ['food', 'looks'] },
    { id: 'collagen_peptides', name: 'Collagen', type: 'food', effect: 'vitality', score: 8, message: "Connective tissue reinforcement. Skin elasticity improved.", tags: ['food', 'looks'] },
    { id: 'dark_chocolate', name: 'Dark Chocolate', type: 'food', effect: 'vitality', score: 5, message: "Flavonoids detected. Skin blood flow improved.", tags: ['food', 'looks'] },
    { id: 'avocado', name: 'Avocado', type: 'food', effect: 'vitality', score: 9, message: "Healthy fats loaded. Skin hydration from within.", tags: ['food', 'looks'] },
    { id: 'sweet_potato', name: 'Sweet Potato', type: 'food', effect: 'vitality', score: 7, message: "Vitamin A synthesis. Natural glow enhancement.", tags: ['food', 'looks'] },

    // South Indian Diet (New Dataset)
    { id: 'idli', name: 'Idli', type: 'food', effect: 'vitality', score: 9, message: "Fermented goodness. Gut health optimized. Sustainable energy.", tags: ['gut_health', 'carb'] },
    { id: 'dosa', name: 'Dosa', type: 'food', effect: 'vitality', score: 7, message: "Crisp lentil crepe. Protein and carb balance detected.", tags: ['carb', 'protein'] },
    { id: 'sambar', name: 'Sambar', type: 'food', effect: 'vitality', score: 8, message: "Lentil matrix with vegetable infusion. Fiber and protein acquired.", tags: ['protein', 'fiber'] },
    { id: 'rasam', name: 'Rasam', type: 'drink', effect: 'vitality', score: 8, message: "Digestive fire igniter. Turmeric and tamarind immunity boost.", tags: ['immunity', 'digestion'] },
    { id: 'ragi_mudde', name: 'Ragi Mudde', type: 'food', effect: 'vitality', score: 10, message: "Finger millet detected. Calcium overload. Low GI power source.", tags: ['superfood', 'calcium'] },
    { id: 'curd_rice', name: 'Curd Rice', type: 'food', effect: 'vitality', score: 9, message: "Probiotic coolant. Gut microbiome restoration complete.", tags: ['probiotic', 'gut_health'] },
    { id: 'coconut_chutney', name: 'Coconut Chutney', type: 'food', effect: 'vitality', score: 7, message: "MCT oils identified. Healthy fat metabolism active.", tags: ['healthy_fats'] },
    { id: 'upma', name: 'Upma', type: 'food', effect: 'vitality', score: 6, message: "Semolina fuel. Moderate energy release.", tags: ['carb'] },
    { id: 'chicken_chettinad', name: 'Chicken Chettinad', type: 'food', effect: 'vitality', score: 9, message: "Spiced protein synthesis. Thermogenic effect active.", tags: ['protein', 'spicy'] },
    { id: 'filter_coffee', name: 'Filter Coffee', type: 'drink', effect: 'vitality', score: 6, message: "Caffeine stimulant. Mental focus sharpened. Watch cortisol.", tags: ['caffeine', 'focus'] },
    { id: 'medu_vada', name: 'Medu Vada', type: 'food', effect: 'toxicity', score: -5, message: "Deep fried lentil. Delicious but lipids elevated. Moderate intake.", tags: ['probiotic', 'toxin'] },
    { id: 'pongal', name: 'Pongal', type: 'food', effect: 'vitality', score: 7, message: "Lentil rice harvest. Comfort fuel derived.", tags: ['carb', 'protein'] },
];

export const GENERAL_TIPS = [
    "Hydration Check: Drink a glass of water now. Clear skin requires hydration.",
    "Posture Correction: Align your spine. Confidence and height perception improve with posture.",
    "Jawline Check: Close your mouth, breathe through your nose. Tongue on the roof.",
    "Sunlight Exposure: 10 mins direct sun for Vitamin D and mood. Don't burn.",
    "Sleep Protocol: 7-9 hours is non-negotiable for 'Beauty Sleep' (HGH Release).",
    "Digital Detox: Reduce blue light 1 hour before bed to prevent dark circles.",
    "Collagen Banking: Eat Vitamin C with protein to synthesize collagen.",
    "Strategic Fasting: 12-16 hour Intermittent Fasting reduces bloating and sharpens features.",
    "Spices Update: Turmeric in your diet is a natural anti-inflammatory glow booster.",
];

export function analyzeInput(input: string): KnowledgeItem | null {
    const normalized = input.toLowerCase();
    return KNOWLEDGE_BASE.find(item => normalized.includes(item.name.toLowerCase())) || null;
}

export function getRandomTip(): string {
    return GENERAL_TIPS[Math.floor(Math.random() * GENERAL_TIPS.length)];
}
