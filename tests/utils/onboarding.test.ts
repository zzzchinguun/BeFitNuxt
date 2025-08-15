import { describe, it, expect } from 'vitest'
import { 
  calculateBMR, 
  calculateTDEE, 
  calculateMacros,
  calculateCalorieTarget,
  calculateLeanBodyMass,
  convertToMetric,
  estimateBodyFatNavy,
  estimateBodyFatFromVisual,
  estimateBodyFatFromBMI,
  estimateTimeline,
  validateSafePace,
  getRecommendedPaceRange,
  roundMacros,
  validateOnboardingStep,
  calculateWeightChangeRate,
  isHealthyWeightChangeRate
} from '~/utils/onboarding'
import { physicalStatsSchema, activityLevelSchema, bodyFatInputSchema } from '~/utils/onboarding.schemas'
import type { PhysicalStats, GoalType } from '~/types'

describe('Onboarding Calculations', () => {
  describe('Unit conversions', () => {
    it('converts height from inches to cm', () => {
      const physical: PhysicalStats = {
        ageYears: 25,
        height: { value: 70, unit: 'in' },
        weight: { value: 150, unit: 'lb' },
        gender: 'male'
      }
      const { heightCm, weightKg } = convertToMetric(physical)
      
      expect(heightCm).toBeCloseTo(177.8, 1) // 70 * 2.54
      expect(weightKg).toBeCloseTo(68.04, 1) // 150 / 2.20462
    })

    it('handles metric units without conversion', () => {
      const physical: PhysicalStats = {
        ageYears: 25,
        height: { value: 175, unit: 'cm' },
        weight: { value: 70, unit: 'kg' },
        gender: 'male'
      }
      const { heightCm, weightKg } = convertToMetric(physical)
      
      expect(heightCm).toBe(175)
      expect(weightKg).toBe(70)
    })
  })

  describe('BMR calculations (Mifflin-St Jeor)', () => {
    it('calculates BMR correctly for males', () => {
      const bmr = calculateBMR(70, 175, 25, 'male')
      // BMR = 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75
      expect(bmr).toBe(1674) // Rounded
    })

    it('calculates BMR correctly for females', () => {
      const bmr = calculateBMR(60, 165, 25, 'female')
      // BMR = 10*60 + 6.25*165 - 5*25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25
      expect(bmr).toBe(1345) // Rounded
    })

    it('handles edge cases for age and weight', () => {
      const youngMale = calculateBMR(50, 160, 18, 'male')
      const olderFemale = calculateBMR(80, 170, 65, 'female')
      
      expect(youngMale).toBeGreaterThan(1000)
      expect(olderFemale).toBeGreaterThan(1000)
    })
  })

  describe('TDEE calculations', () => {
    it('calculates TDEE correctly for each activity level', () => {
      const bmr = 1700

      expect(calculateTDEE(bmr, 'sedentary')).toBe(2040) // 1700 * 1.2
      expect(calculateTDEE(bmr, 'light')).toBe(2338) // 1700 * 1.375
      expect(calculateTDEE(bmr, 'moderate')).toBe(2635) // 1700 * 1.55
      expect(calculateTDEE(bmr, 'very')).toBe(2933) // 1700 * 1.725
      expect(calculateTDEE(bmr, 'extra')).toBe(3230) // 1700 * 1.9
    })

    it('handles legacy activity levels', () => {
      const bmr = 1700
      expect(calculateTDEE(bmr, 'moderately_active')).toBe(2635)
    })
  })

  describe('Body fat calculations', () => {
    it('calculates lean body mass correctly', () => {
      const lbm = calculateLeanBodyMass(80, 15) // 80kg at 15% body fat
      expect(lbm).toBe(68.0) // 80 * (1 - 0.15) = 68
    })

    it('estimates body fat from Navy formula (male)', () => {
      const bodyFat = estimateBodyFatNavy(85, 38, 175, 'male')
      expect(bodyFat).toBeGreaterThan(10)
      expect(bodyFat).toBeLessThan(30)
    })

    it('estimates body fat from Navy formula (female)', () => {
      const bodyFat = estimateBodyFatNavy(75, 32, 165, 'female', 95)
      expect(bodyFat).toBeGreaterThan(15)
      expect(bodyFat).toBeLessThan(40)
    })

    it('estimates body fat from visual selection', () => {
      expect(estimateBodyFatFromVisual(0, 'male')).toBe(8) // Athletic
      expect(estimateBodyFatFromVisual(2, 'male')).toBe(16) // Average
      expect(estimateBodyFatFromVisual(0, 'female')).toBe(16) // Athletic
      expect(estimateBodyFatFromVisual(3, 'female')).toBe(28) // Above average
    })

    it('estimates body fat from BMI (fallback)', () => {
      const maleEstimate = estimateBodyFatFromBMI(80, 180, 'male')
      const femaleEstimate = estimateBodyFatFromBMI(65, 165, 'female')
      
      expect(maleEstimate).toBeGreaterThan(8)
      expect(maleEstimate).toBeLessThan(35)
      expect(femaleEstimate).toBeGreaterThan(16)
      expect(femaleEstimate).toBeLessThan(45)
    })
  })

  describe('Calorie target calculations', () => {
    it('calculates cutting calories correctly', () => {
      const tdee = 2500
      const target = calculateCalorieTarget(tdee, 'cut', 0.5, 'male')
      const expectedDeficit = (0.5 * 7700) / 7 // 550 calories/day
      
      expect(target).toBeCloseTo(tdee - expectedDeficit, 0)
      expect(target).toBeGreaterThanOrEqual(1500) // Safety minimum for males
    })

    it('calculates bulking calories correctly', () => {
      const tdee = 2500
      const target = calculateCalorieTarget(tdee, 'bulk', 0.25, 'male')
      const expectedSurplus = (0.25 * 7700) / 7 // 275 calories/day
      
      expect(target).toBeCloseTo(tdee + expectedSurplus, 0)
    })

    it('maintains calories for maintenance goal', () => {
      const tdee = 2500
      const target = calculateCalorieTarget(tdee, 'maintain', 0, 'male')
      
      expect(target).toBe(tdee)
    })

    it('enforces minimum calorie limits', () => {
      const tdee = 1400
      const maleTarget = calculateCalorieTarget(tdee, 'cut', 1.0, 'male')
      const femaleTarget = calculateCalorieTarget(tdee, 'cut', 1.0, 'female')
      
      expect(maleTarget).toBeGreaterThanOrEqual(1500)
      expect(femaleTarget).toBeGreaterThanOrEqual(1200)
    })
  })

  describe('Advanced macro calculations', () => {
    it('calculates macros with lean body mass for cutting', () => {
      const macros = calculateMacros(1800, 'cut', 80, 68) // 80kg, 68kg LBM
      
      // Should use LBM-based protein calculation and round to nearest 5g
      expect(macros.proteinG).toBe(165) // 68 * 2.4 = 163.2, rounded to 165
      expect(macros.fatG).toBeGreaterThanOrEqual(Math.round(80 * 0.8 / 5) * 5) // Min 0.8g per kg BW
      expect(macros.kcal).toBe(1800)
    })

    it('calculates macros without lean body mass', () => {
      const macros = calculateMacros(2200, 'bulk', 75)
      
      expect(macros.proteinG).toBeCloseTo(75 * 2.0, 0) // 2.0g per kg BW default
      expect(macros.kcal).toBe(2200)
    })

    it('rounds macros to nearest 5g', () => {
      const macros = calculateMacros(2000, 'maintain', 70)
      
      expect(macros.proteinG % 5).toBe(0)
      expect(macros.fatG % 5).toBe(0)
      expect(macros.carbsG % 5).toBe(0)
    })

    it('maintains calorie accuracy within 1.5%', () => {
      const targetCalories = 2000
      const macros = calculateMacros(targetCalories, 'maintain', 70)
      
      const actualCalories = (macros.proteinG * 4) + (macros.carbsG * 4) + (macros.fatG * 9)
      const error = Math.abs(actualCalories - targetCalories) / targetCalories
      
      expect(error).toBeLessThanOrEqual(0.015) // Within 1.5%
    })
  })

  describe('Timeline calculations', () => {
    it('estimates timeline correctly', () => {
      const { estimatedWeeks, finishDate } = estimateTimeline(80, 75, 0.5)
      
      expect(estimatedWeeks).toBe(10) // 5kg at 0.5kg/week
      expect(finishDate).toBeInstanceOf(Date)
      expect(finishDate.getTime()).toBeGreaterThan(Date.now())
    })

    it('handles very long timelines', () => {
      const { estimatedWeeks } = estimateTimeline(100, 70, 0.25)
      
      expect(estimatedWeeks).toBeLessThanOrEqual(520) // Max 10 years
    })

    it('handles minimum timeline', () => {
      const { estimatedWeeks } = estimateTimeline(70, 69, 1.0)
      
      expect(estimatedWeeks).toBeGreaterThanOrEqual(1) // Min 1 week
    })
  })

  describe('Pace validation', () => {
    it('validates safe cutting pace', () => {
      expect(validateSafePace(0.5, 'cut')).toEqual({ isValid: true })
      expect(validateSafePace(1.2, 'cut')).toEqual({ isValid: false, message: expect.any(String) })
      expect(validateSafePace(0.1, 'cut')).toEqual({ isValid: false, message: expect.any(String) })
    })

    it('validates safe bulking pace', () => {
      expect(validateSafePace(0.25, 'bulk')).toEqual({ isValid: true })
      expect(validateSafePace(0.6, 'bulk')).toEqual({ isValid: false, message: expect.any(String) })
      expect(validateSafePace(0.05, 'bulk')).toEqual({ isValid: false, message: expect.any(String) })
    })

    it('validates maintenance pace', () => {
      expect(validateSafePace(0, 'maintain')).toEqual({ isValid: true })
      expect(validateSafePace(0.2, 'maintain')).toEqual({ isValid: false, message: expect.any(String) })
    })
  })

  describe('Pace recommendations', () => {
    it('provides correct ranges for each goal', () => {
      expect(getRecommendedPaceRange('cut')).toEqual({ min: 0.25, max: 1.0, default: 0.5 })
      expect(getRecommendedPaceRange('bulk')).toEqual({ min: 0.125, max: 0.5, default: 0.25 })
      expect(getRecommendedPaceRange('maintain')).toEqual({ min: 0, max: 0, default: 0 })
    })
  })

  describe('Enhanced validation', () => {
    it('validates complete onboarding data', () => {
      // New step structure
      expect(validateOnboardingStep(1, {})).toBe(true) // Welcome
      expect(validateOnboardingStep(2, { 
        physical: { ageYears: 25, height: { value: 175, unit: 'cm' }, weight: { value: 70, unit: 'kg' }, gender: 'male' }
      })).toBe(true)
      expect(validateOnboardingStep(3, { 
        physical: { gender: 'male' }, 
        activity: 'moderate' 
      })).toBe(true)
      expect(validateOnboardingStep(4, {})).toBe(true) // Body fat optional
      expect(validateOnboardingStep(5, { goalType: 'cut' })).toBe(true)
      expect(validateOnboardingStep(6, { 
        goalType: 'cut',
        plan: { targetWeightKg: 65, paceKgPerWeek: 0.5, estimatedWeeks: 10 }
      })).toBe(true)
      expect(validateOnboardingStep(7, {})).toBe(true) // Timeline preview
      expect(validateOnboardingStep(8, {})).toBe(true) // Macros
    })

    it('validates legacy data structure', () => {
      expect(validateOnboardingStep(2, { age: 25, height: 175, weight: 70 })).toBe(true)
      expect(validateOnboardingStep(3, { gender: 'male', activityLevel: 'moderately_active' })).toBe(true)
    })
  })

  describe('Zod schema validation', () => {
    it('validates physical stats schema', () => {
      const validData = {
        ageYears: 25,
        height: { value: 175, unit: 'cm' as const },
        weight: { value: 70, unit: 'kg' as const },
        gender: 'male' as const
      }

      expect(() => physicalStatsSchema.parse(validData)).not.toThrow()
      
      const invalidData = { ...validData, ageYears: 12 }
      expect(() => physicalStatsSchema.parse(invalidData)).toThrow()
    })

    it('validates activity level schema', () => {
      expect(() => activityLevelSchema.parse('moderate')).not.toThrow()
      expect(() => activityLevelSchema.parse('invalid')).toThrow()
    })

    it('validates body fat input schema', () => {
      const knownBF = { method: 'known' as const, percent: 15 }
      const tapeBF = { 
        method: 'tape' as const, 
        measurements: { waist: 85, neck: 38 }
      }

      expect(() => bodyFatInputSchema.parse(knownBF)).not.toThrow()
      expect(() => bodyFatInputSchema.parse(tapeBF)).not.toThrow()
      
      // Should fail without required data
      const invalidKnown = { method: 'known' as const }
      expect(() => bodyFatInputSchema.parse(invalidKnown)).toThrow()
    })
  })

  describe('Legacy calculations (backward compatibility)', () => {
    it('calculates weight change rate correctly', () => {
      const rate = calculateWeightChangeRate(70, 65, 10)
      expect(rate).toBe(-0.5) // -5kg over 10 weeks = -0.5kg/week
    })

    it('identifies healthy weight change rates', () => {
      expect(isHealthyWeightChangeRate(0.5)).toBe(true) // Healthy gain
      expect(isHealthyWeightChangeRate(-0.7)).toBe(true) // Healthy loss
      expect(isHealthyWeightChangeRate(1.5)).toBe(false) // Too fast gain
      expect(isHealthyWeightChangeRate(-1.2)).toBe(false) // Too fast loss
    })
  })

  describe('Edge cases and error handling', () => {
    it('handles zero and negative values safely', () => {
      expect(() => calculateBMR(0, 175, 25, 'male')).not.toThrow()
      expect(() => calculateTDEE(0, 'moderate')).not.toThrow()
    })

    it('handles extreme body fat percentages', () => {
      expect(calculateLeanBodyMass(70, 3)).toBeCloseTo(67.9, 1) // Very low BF
      expect(calculateLeanBodyMass(70, 50)).toBeCloseTo(35, 1) // Very high BF
    })

    it('throws error for missing hip measurement in Navy formula for females', () => {
      expect(() => estimateBodyFatNavy(75, 32, 165, 'female')).toThrow()
    })
  })
})