import { z } from 'zod'
import type { PhysicalStats, ActivityLevel, BodyFatInput, GoalType, GoalPlan } from '~/types'

// Physical stats validation
export const physicalStatsSchema = z.object({
  ageYears: z.number()
    .min(13, 'Age must be at least 13 years')
    .max(100, 'Age cannot exceed 100 years'),
  height: z.object({
    value: z.number()
      .min(120, 'Height must be at least 120cm (47in)')
      .max(230, 'Height cannot exceed 230cm (91in)'),
    unit: z.enum(['cm', 'in'])
  }),
  weight: z.object({
    value: z.number()
      .min(30, 'Weight must be at least 30kg (66lb)')
      .max(300, 'Weight cannot exceed 300kg (661lb)'),
    unit: z.enum(['kg', 'lb'])
  }),
  gender: z.enum(['male', 'female'])
})

// Activity level validation
export const activityLevelSchema = z.enum(['sedentary', 'light', 'moderate', 'very', 'extra'])

// Body fat validation with gender-specific constraints
export const bodyFatInputSchema = z.object({
  method: z.enum(['visual', 'tape', 'known', 'unknown']),
  percent: z.number()
    .min(3, 'Body fat percentage cannot be less than 3%')
    .max(60, 'Body fat percentage cannot exceed 60%')
    .optional(),
  measurements: z.object({
    waist: z.number().min(10).max(200).optional(),
    neck: z.number().min(10).max(100).optional(),
    hip: z.number().min(10).max(200).optional()
  }).optional()
}).refine((data) => {
  if (data.method === 'known' && !data.percent) {
    return false
  }
  if (data.method === 'tape' && !data.measurements) {
    return false
  }
  return true
}, {
  message: 'Required measurements missing for selected method'
})

// Goal type validation
export const goalTypeSchema = z.enum(['cut', 'maintain', 'bulk'])

// Goal plan validation with goal-specific constraints
export const goalPlanSchema = z.object({
  targetWeightKg: z.number()
    .min(30, 'Target weight must be at least 30kg')
    .max(300, 'Target weight cannot exceed 300kg'),
  paceKgPerWeek: z.number()
    .min(0.125, 'Weight change pace must be at least 0.125kg/week')
    .max(1.0, 'Weight change pace cannot exceed 1.0kg/week for safety'),
  estimatedWeeks: z.number()
    .min(1, 'Timeline must be at least 1 week')
    .max(520, 'Timeline cannot exceed 10 years')
})

// Step-specific validation schemas
export const step1Schema = physicalStatsSchema

export const step2Schema = z.object({
  gender: z.enum(['male', 'female']),
  activity: activityLevelSchema
})

export const step3Schema = bodyFatInputSchema

export const step4Schema = goalTypeSchema

export const step5Schema = z.object({
  goalType: goalTypeSchema,
  targetWeightKg: z.number().min(30).max(300),
  paceKgPerWeek: z.number().min(0.125).max(1.0)
}).refine((data) => {
  // Validate goal direction is correct
  return true // Will be validated with current weight in component
}, {
  message: 'Target weight conflicts with selected goal'
})

export const step6Schema = goalPlanSchema

// Complete onboarding validation
export const completeOnboardingSchema = z.object({
  physical: physicalStatsSchema,
  activity: activityLevelSchema,
  bodyFatData: bodyFatInputSchema,
  goalType: goalTypeSchema,
  plan: goalPlanSchema
})

// Helper function to validate body fat percentage based on gender
export function validateBodyFatForGender(percent: number, gender: 'male' | 'female'): boolean {
  if (gender === 'male') {
    return percent >= 3 && percent <= 50
  } else {
    return percent >= 10 && percent <= 60
  }
}

// Helper function to validate goal pace based on goal type
export function validatePaceForGoal(pace: number, goalType: GoalType): boolean {
  switch (goalType) {
    case 'cut':
      return pace >= 0.25 && pace <= 1.0
    case 'bulk':
      return pace >= 0.125 && pace <= 0.5
    case 'maintain':
      return pace === 0
    default:
      return false
  }
}

// Helper function to validate target weight direction
export function validateTargetWeightDirection(
  currentWeightKg: number,
  targetWeightKg: number,
  goalType: GoalType
): boolean {
  const delta = targetWeightKg - currentWeightKg
  
  switch (goalType) {
    case 'cut':
      return delta < 0 // Must lose weight
    case 'bulk':
      return delta > 0 // Must gain weight
    case 'maintain':
      return Math.abs(delta) <= 2 // Allow small variation
    default:
      return false
  }
}