import type { Timestamp } from 'firebase/firestore'

export interface User {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  role: 'user' | 'admin'
  language: string
  units: {
    weight: 'kg' | 'lb'
    height: 'cm' | 'in'
  }
  onboarding?: OnboardingData
  macroGoals: MacroGoals
  mealPlanGenerated?: boolean // Track if user has generated their first meal plan
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Enhanced interfaces for comprehensive onboarding
export interface PhysicalStats {
  ageYears: number
  height: {
    value: number
    unit: 'cm' | 'in'
  }
  weight: {
    value: number
    unit: 'kg' | 'lb'
  }
  gender: 'male' | 'female'
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'extra'

export interface BodyFatInput {
  method: 'visual' | 'tape' | 'known' | 'unknown'
  percent?: number
  measurements?: {
    waist?: number
    neck?: number
    hip?: number
  }
}

export type GoalType = 'cut' | 'maintain' | 'bulk'

export interface GoalPlan {
  targetWeightKg: number
  paceKgPerWeek: number
  estimatedWeeks: number
}

export interface OnboardingData {
  // Legacy fields for backward compatibility
  age?: number
  height?: number
  weight?: number
  gender?: 'male' | 'female'
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'
  bodyFat?: number
  goal?: 'cut' | 'maintain' | 'bulk'
  goalWeight?: number
  timelineWeeks?: number
  bmr?: number
  tdee?: number
  
  // New comprehensive structure
  physical?: PhysicalStats
  activity?: ActivityLevel
  bodyFatData?: BodyFatInput
  goalType?: GoalType
  plan?: GoalPlan
  macros?: MacroGoals
  currentStep?: number
  
  // Computed values
  leanBodyMassKg?: number
  calorieTarget?: number
  
  // Completion tracking
  completed: boolean
  completedAt?: Timestamp
}

export interface MacroGoals {
  kcal: number
  proteinG: number
  carbsG: number
  fatG: number
  // Legacy support
  protein?: number
  carbs?: number
  fat?: number
}

export interface MealEntry {
  id: string
  userId: string
  date: string // YYYY-MM-DD
  timeOfDay: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  items: MealItem[]
  totals: MacroGoals
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface MealItem {
  refType: 'verified' | 'custom'
  refId: string
  name: string
  brand?: string
  quantityGrams: number
  servingSize?: number
  kcal: number
  protein: number
  carbs: number
  fat: number
  photoUrl?: string
}

export interface VerifiedMeal {
  id: string
  name: string
  brand?: string
  barcode?: string
  serving: {
    size: number
    unit: string
  }
  per100g: MacroGoals
  categories: string[]
  imageUrl?: string
  source: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface UnverifiedMeal extends Omit<VerifiedMeal, 'id'> {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  submittedBy: string
  reviewedBy?: string
  notes?: string
}

export interface Exercise {
  id: string
  name: string
  category: 'compound' | 'lowerBody' | 'upperBodyPush' | 'upperBodyPull' | 'core' | 'custom'
  isCustom: boolean
  createdBy: string | null
  mongolianName?: string
  description?: string
  instructions?: string[]
  muscleGroups?: string[]
}

export interface WorkoutSet {
  id?: string
  reps: number
  weight: number
  isCompleted: boolean
  restSeconds?: number
}

export interface WorkoutLog {
  id: string
  userId: string
  exerciseId: string
  exerciseName: string
  date: string
  sets: WorkoutSet[]
  notes?: string
  durationMin?: number
  totalVolume: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ExerciseLog {
  id: string
  userId: string
  date: string
  entries: ExerciseEntry[]
  totals: {
    volume?: number
    kcal?: number
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ExerciseEntry {
  name: string
  type: 'strength' | 'cardio'
  sets?: ExerciseSet[]
  durationMin?: number
  kcal?: number
}

export interface ExerciseSet {
  reps: number
  weight: number
}

export interface WeightLog {
  id: string
  userId: string
  date: string
  weight: number
  note?: string
  createdAt: Timestamp
}

export interface AppConfig {
  latestVersion: string
  forceUpdate: boolean
}

export interface NotificationItem {
  id: string
  userId: string
  type: 'meal_verified' | 'meal_rejected' | 'system' | 'reminder'
  title: string
  message: string
  read: boolean
  createdAt: Timestamp
}

export interface SearchFilters {
  query?: string
  categories?: string[]
  brand?: string
  hasBarcode?: boolean
}

export interface DailyMacros {
  date: string
  consumed: MacroGoals
  goals: MacroGoals
  remaining: MacroGoals
  percentages: {
    kcal: number
    protein: number
    carbs: number
    fat: number
  }
}

// ===== MEAL GENERATION TYPES =====

export interface GeneratedMeal {
  id: string
  name: string
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ingredients: MealIngredient[]
  instructions: string[]
  macros: MacroGoals
  servingSize: number
  imageUrl?: string
  estimatedTime?: number // cooking time in minutes
  difficulty?: 'easy' | 'medium' | 'hard'
  source: 'database' | 'custom'
}

export interface MealIngredient {
  id: string
  name: string
  amount: number
  unit: string
  category: 'protein' | 'vegetables' | 'carbs' | 'dairy' | 'fats' | 'spices' | 'other'
  imageUrl?: string
  essential: boolean // true if critical for the recipe
}

export interface MealPlan {
  id: string
  userId: string
  targetMacros: MacroGoals
  meals: GeneratedMeal[]
  totalMacros: MacroGoals
  macroAccuracy: number // percentage of how close we got to target macros
  generatedAt: Timestamp
  preferences?: MealPreferences
  status: 'active' | 'archived' | 'draft'
}

export interface MealPreferences {
  dietaryRestrictions?: string[]
  allergies?: string[]
  dislikedIngredients?: string[]
  preferredCuisines?: string[]
  maxCookingTime?: number
  difficultyLevel?: 'easy' | 'medium' | 'hard' | 'any'
}

export interface ShoppingList {
  id: string
  userId: string
  mealPlanId: string
  items: ShoppingListItem[]
  totalItems: number
  estimatedCost?: number
  createdAt: Timestamp
  completed: boolean
}

export interface ShoppingListItem {
  id: string
  name: string
  amount: number
  unit: string
  category: 'protein' | 'vegetables' | 'carbs' | 'dairy' | 'fats' | 'spices' | 'other'
  price?: number
  checked: boolean
  imageUrl?: string
  notes?: string
}

export interface MealGenerationRequest {
  targetMacros: MacroGoals
  preferences?: MealPreferences
  excludeMeals?: string[] // IDs of meals to exclude
  mealDistribution?: {
    breakfast: number // percentage of daily calories
    lunch: number
    dinner: number
    snacks: number
  }
}

export interface MealGenerationResult {
  success: boolean
  mealPlan?: MealPlan
  shoppingList?: ShoppingList
  warnings?: string[]
  errors?: string[]
  accuracy: number
}

// Analytics and tracking
export interface MealGenerationHistory {
  id: string
  userId: string
  requestedAt: Timestamp
  request: MealGenerationRequest
  result: MealGenerationResult
  userFeedback?: {
    rating: number
    liked: boolean
    regeneratedMeals: string[]
    comments?: string
  }
}