import type { OnboardingData, MacroGoals, PhysicalStats, ActivityLevel, BodyFatInput, GoalType, GoalPlan } from '~/types'

// Activity multipliers for TDEE calculation
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extra: 1.9,
  // Legacy support
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9
}

// Conversion constants
const INCHES_TO_CM = 2.54
const LBS_TO_KG = 0.453592
const KCAL_PER_KG_FAT = 7700

// Unit conversion functions
export function convertToMetric(physical: PhysicalStats): { heightCm: number; weightKg: number } {
  let heightCm = physical.height.value
  let weightKg = physical.weight.value

  if (physical.height.unit === 'in') {
    heightCm = heightCm * INCHES_TO_CM
  }
  
  if (physical.weight.unit === 'lb') {
    weightKg = weightKg * LBS_TO_KG
  }

  return { heightCm, weightKg }
}

// BMR calculation using Mifflin-St Jeor equation
export function calculateBMR(
  weight: number, 
  height: number, 
  age: number, 
  gender: 'male' | 'female'
): number {
  // Mifflin-St Jeor Equation (weight in kg, height in cm)
  const base = (10 * weight) + (6.25 * height) - (5 * age)
  return Math.round(gender === 'male' ? base + 5 : base - 161)
}

// TDEE calculation with activity multiplier
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel | keyof typeof ACTIVITY_MULTIPLIERS): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel as keyof typeof ACTIVITY_MULTIPLIERS]
  return Math.round(bmr * multiplier)
}

// Body fat estimation using US Navy formula
export function estimateBodyFatNavy(
  waistCm: number,
  neckCm: number,
  heightCm: number,
  gender: 'male' | 'female',
  hipCm?: number
): number {
  if (gender === 'male') {
    // Men's formula: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
    const log10WaistNeck = Math.log10(waistCm - neckCm)
    const log10Height = Math.log10(heightCm)
    return Math.round(495 / (1.0324 - 0.19077 * log10WaistNeck + 0.15456 * log10Height) - 450)
  } else {
    // Women's formula: 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
    if (!hipCm) throw new Error('Hip measurement required for women')
    const log10WaistHipNeck = Math.log10(waistCm + hipCm - neckCm)
    const log10Height = Math.log10(heightCm)
    return Math.round(495 / (1.29579 - 0.35004 * log10WaistHipNeck + 0.22100 * log10Height) - 450)
  }
}

// Calculate lean body mass
export function calculateLeanBodyMass(weightKg: number, bodyFatPercent: number): number {
  return Math.round((weightKg * (1 - bodyFatPercent / 100)) * 10) / 10
}

// Calculate calorie target based on goal and pace
export function calculateCalorieTarget(
  tdee: number,
  goalType: GoalType,
  paceKgPerWeek: number,
  gender: 'male' | 'female'
): number {
  let dailyAdjustment = 0
  
  if (goalType !== 'maintain') {
    // Calculate daily calorie adjustment from weekly pace
    dailyAdjustment = (paceKgPerWeek * KCAL_PER_KG_FAT) / 7
    
    if (goalType === 'cut') {
      dailyAdjustment = -dailyAdjustment // Negative for deficit
    }
  }
  
  const targetCalories = tdee + dailyAdjustment
  
  // Apply safety limits
  const minCalories = gender === 'female' ? 1200 : 1500
  const maxCalories = tdee * 1.2 // Maximum 20% surplus
  
  return Math.round(Math.max(minCalories, Math.min(maxCalories, targetCalories)))
}

// Enhanced macro calculation with precise formulas
export function calculateMacros(
  calorieTarget: number,
  goalType: GoalType,
  weightKg: number,
  leanBodyMassKg?: number
): MacroGoals {
  let proteinG: number
  let fatG: number
  
  // Protein calculation
  if (goalType === 'cut' && leanBodyMassKg) {
    // Cutting with known LBM: 2.4g per kg LBM
    proteinG = leanBodyMassKg * 2.4
  } else {
    // Default: 2.0g per kg body weight
    proteinG = weightKg * 2.0
  }
  
  // Fat calculation: default 0.8g per kg body weight, minimum 20% of calories
  const fatFromWeight = weightKg * 0.8
  const fatFromCalories = (calorieTarget * 0.2) / 9
  fatG = Math.max(fatFromWeight, fatFromCalories)
  
  // Calculate remaining calories for carbs
  const proteinCalories = proteinG * 4
  const fatCalories = fatG * 9
  const remainingCalories = calorieTarget - proteinCalories - fatCalories
  const carbsG = Math.max(0, remainingCalories / 4)
  
  // Round to nearest 5g and rebalance
  const roundedProtein = Math.round(proteinG / 5) * 5
  const roundedFat = Math.round(fatG / 5) * 5
  const roundedCarbs = Math.round(carbsG / 5) * 5
  
  // Recalculate calories to ensure accuracy
  const actualCalories = (roundedProtein * 4) + (roundedFat * 9) + (roundedCarbs * 4)
  
  // If difference is significant, adjust carbs
  if (Math.abs(actualCalories - calorieTarget) > calorieTarget * 0.015) {
    const caloriesDiff = calorieTarget - ((roundedProtein * 4) + (roundedFat * 9))
    const adjustedCarbs = Math.round((caloriesDiff / 4) / 5) * 5
    
    return {
      kcal: calorieTarget,
      proteinG: roundedProtein,
      carbsG: Math.max(0, adjustedCarbs),
      fatG: roundedFat
    }
  }
  
  return {
    kcal: calorieTarget,
    proteinG: roundedProtein,
    carbsG: roundedCarbs,
    fatG: roundedFat
  }
}

// Timeline estimation
export function estimateTimeline(
  currentWeightKg: number,
  targetWeightKg: number,
  paceKgPerWeek: number
): { estimatedWeeks: number; finishDate: Date } {
  const weightDelta = Math.abs(targetWeightKg - currentWeightKg)
  const estimatedWeeks = Math.max(1, Math.min(520, Math.round(weightDelta / Math.abs(paceKgPerWeek))))
  
  const finishDate = new Date()
  finishDate.setDate(finishDate.getDate() + (estimatedWeeks * 7))
  
  return { estimatedWeeks, finishDate }
}

// Enhanced validation functions
export function validateOnboardingStep(
  step: number,
  data: Partial<OnboardingData>
): boolean {
  switch (step) {
    case 1: // Welcome
      return true
    case 2: // Age, height, weight
      if (data.physical) {
        const { heightCm, weightKg } = convertToMetric(data.physical)
        return data.physical.ageYears >= 13 && data.physical.ageYears <= 100 &&
               heightCm >= 120 && heightCm <= 230 &&
               weightKg >= 30 && weightKg <= 300
      }
      // Legacy support
      return !!(data.age && data.height && data.weight && 
                data.age > 0 && data.height > 0 && data.weight > 0)
    case 3: // Gender and activity
      return !!(data.physical?.gender && data.activity) || 
             !!(data.gender && data.activityLevel)
    case 4: // Body fat (optional)
      return true
    case 5: // Goal
      return !!data.goalType || !!data.goal
    case 6: // Goal weight and pace
      if ((data.goalType || data.goal) === 'maintain') return true
      return !!(data.plan?.targetWeightKg && data.plan?.paceKgPerWeek) ||
             !!(data.goalWeight && data.timelineWeeks)
    case 7: // Timeline preview
      return true
    case 8: // Macros
      return true
    default:
      return false
  }
}

// Legacy functions for backward compatibility
export function calculateWeightChangeRate(
  currentWeight: number,
  goalWeight: number,
  timelineWeeks: number
): number {
  const totalChange = goalWeight - currentWeight
  return totalChange / timelineWeeks // kg per week
}

export function isHealthyWeightChangeRate(rate: number): boolean {
  const absoluteRate = Math.abs(rate)
  return absoluteRate <= 1.0
}

// Body fat estimation from visual selection
export function estimateBodyFatFromVisual(
  selectionIndex: number,
  gender: 'male' | 'female'
): number {
  // Visual body fat estimation ranges
  const maleRanges = [8, 12, 16, 20, 25, 30] // 6 levels
  const femaleRanges = [16, 20, 24, 28, 32, 36] // 6 levels
  
  const ranges = gender === 'male' ? maleRanges : femaleRanges
  return ranges[Math.min(selectionIndex, ranges.length - 1)]
}

// Estimate body fat from BMI (fallback when unknown)
export function estimateBodyFatFromBMI(
  weightKg: number,
  heightCm: number,
  gender: 'male' | 'female'
): number {
  const bmi = weightKg / Math.pow(heightCm / 100, 2)
  
  // Rough estimation formulas (not very accurate, warn user)
  if (gender === 'male') {
    return Math.max(8, Math.min(35, 1.2 * bmi + 0.23 * 30 - 16.2))
  } else {
    return Math.max(16, Math.min(45, 1.2 * bmi + 0.23 * 30 - 5.4))
  }
}

// Calculate daily fiber recommendation
export function calculateFiberRecommendation(calorieTarget: number): number {
  return Math.round((calorieTarget / 1000) * 14)
}

// Calculate daily water recommendation
export function calculateWaterRecommendation(weightKg: number): number {
  return Math.round(weightKg * 35) // ml per day
}

// Validate safe weight change pace
export function validateSafePace(
  paceKgPerWeek: number,
  goalType: GoalType
): { isValid: boolean; message?: string } {
  const absolutePace = Math.abs(paceKgPerWeek)
  
  switch (goalType) {
    case 'cut':
      if (absolutePace < 0.25) {
        return { isValid: false, message: 'Minimum safe weight loss is 0.25kg/week' }
      }
      if (absolutePace > 1.0) {
        return { isValid: false, message: 'Maximum safe weight loss is 1.0kg/week' }
      }
      break
    case 'bulk':
      if (absolutePace < 0.125) {
        return { isValid: false, message: 'Minimum effective weight gain is 0.125kg/week' }
      }
      if (absolutePace > 0.5) {
        return { isValid: false, message: 'Maximum safe weight gain is 0.5kg/week' }
      }
      break
    case 'maintain':
      if (absolutePace > 0.1) {
        return { isValid: false, message: 'Maintenance should have minimal weight change' }
      }
      break
  }
  
  return { isValid: true }
}

// Get recommended pace range for goal
export function getRecommendedPaceRange(goalType: GoalType): { min: number; max: number; default: number } {
  switch (goalType) {
    case 'cut':
      return { min: 0.25, max: 1.0, default: 0.5 }
    case 'bulk':
      return { min: 0.125, max: 0.5, default: 0.25 }
    case 'maintain':
      return { min: 0, max: 0, default: 0 }
  }
}

// Round macros to maintain calorie accuracy
export function roundMacros(macros: MacroGoals): MacroGoals {
  const targetKcal = macros.kcal
  
  // Round protein and fat to nearest 5g
  const roundedProtein = Math.round(macros.proteinG / 5) * 5
  const roundedFat = Math.round(macros.fatG / 5) * 5
  
  // Calculate remaining calories for carbs
  const usedKcal = (roundedProtein * 4) + (roundedFat * 9)
  const remainingKcal = targetKcal - usedKcal
  const calculatedCarbs = Math.max(0, remainingKcal / 4)
  const roundedCarbs = Math.round(calculatedCarbs / 5) * 5
  
  return {
    kcal: targetKcal,
    proteinG: roundedProtein,
    carbsG: roundedCarbs,
    fatG: roundedFat
  }
}