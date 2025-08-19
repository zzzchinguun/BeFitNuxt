import type { MacroGoals, MealGenerationRequest, MealPreferences } from '~/types'

export const useMealGenerator = () => {
  const mealGenerationStore = useMealGenerationStore()
  const authStore = useAuthStore()

  // Generate meal plan with user's macro goals
  async function generateForUser(preferences?: MealPreferences) {
    if (!authStore.user?.macroGoals) {
      throw new Error('User macro goals not found')
    }

    const request: MealGenerationRequest = {
      targetMacros: authStore.user.macroGoals,
      preferences,
      mealDistribution: {
        breakfast: 25,
        lunch: 35, 
        dinner: 35,
        snacks: 5
      }
    }

    return await mealGenerationStore.generateMealPlan(request)
  }

  // Quick generation with default settings
  async function quickGenerate() {
    return await generateForUser()
  }

  // Generate with custom macro targets
  async function generateWithMacros(macros: MacroGoals, preferences?: MealPreferences) {
    const request: MealGenerationRequest = {
      targetMacros: macros,
      preferences,
      mealDistribution: {
        breakfast: 25,
        lunch: 35,
        dinner: 35,
        snacks: 5
      }
    }

    return await mealGenerationStore.generateMealPlan(request)
  }

  // Validate macro goals
  function validateMacros(macros: MacroGoals): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (macros.kcal <= 0 || macros.kcal > 5000) {
      errors.push('Calories must be between 1 and 5000')
    }

    if (macros.proteinG <= 0 || macros.proteinG > 300) {
      errors.push('Protein must be between 1 and 300 grams')
    }

    if (macros.carbsG < 0 || macros.carbsG > 500) {
      errors.push('Carbs must be between 0 and 500 grams')
    }

    if (macros.fatG <= 0 || macros.fatG > 200) {
      errors.push('Fat must be between 1 and 200 grams')
    }

    // Check if macro distribution makes sense
    const proteinCals = macros.proteinG * 4
    const carbCals = macros.carbsG * 4
    const fatCals = macros.fatG * 9
    const totalMacroCals = proteinCals + carbCals + fatCals

    const difference = Math.abs(macros.kcal - totalMacroCals)
    if (difference > macros.kcal * 0.15) { // Allow 15% variance
      errors.push('Macro distribution does not match total calories')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Calculate macro percentages
  function calculateMacroPercentages(macros: MacroGoals) {
    const proteinCals = macros.proteinG * 4
    const carbCals = macros.carbsG * 4
    const fatCals = macros.fatG * 9
    const totalCals = macros.kcal

    return {
      protein: Math.round((proteinCals / totalCals) * 100),
      carbs: Math.round((carbCals / totalCals) * 100),
      fat: Math.round((fatCals / totalCals) * 100)
    }
  }

  // Suggest macro adjustments for common goals
  function suggestMacroAdjustments(currentMacros: MacroGoals, goal: 'cut' | 'bulk' | 'maintain') {
    const suggestions = { ...currentMacros }

    switch (goal) {
      case 'cut':
        // Higher protein, moderate carbs, lower fat
        suggestions.proteinG = Math.max(suggestions.proteinG, Math.round(currentMacros.kcal * 0.35 / 4))
        suggestions.carbsG = Math.round(currentMacros.kcal * 0.35 / 4)
        suggestions.fatG = Math.round(currentMacros.kcal * 0.30 / 9)
        break
      
      case 'bulk':
        // Moderate protein, higher carbs, moderate fat
        suggestions.proteinG = Math.round(currentMacros.kcal * 0.25 / 4)
        suggestions.carbsG = Math.round(currentMacros.kcal * 0.45 / 4)
        suggestions.fatG = Math.round(currentMacros.kcal * 0.30 / 9)
        break
      
      case 'maintain':
        // Balanced macros
        suggestions.proteinG = Math.round(currentMacros.kcal * 0.30 / 4)
        suggestions.carbsG = Math.round(currentMacros.kcal * 0.40 / 4)
        suggestions.fatG = Math.round(currentMacros.kcal * 0.30 / 9)
        break
    }

    return suggestions
  }

  // Get meal distribution suggestions
  function getMealDistributionOptions() {
    return [
      {
        name: 'Standard',
        description: 'Хоолойн арван гурав',
        distribution: { breakfast: 25, lunch: 35, dinner: 35, snacks: 5 }
      },
      {
        name: 'Front-loaded',
        description: 'Өглөөний хоол илүү их',
        distribution: { breakfast: 35, lunch: 30, dinner: 25, snacks: 10 }
      },
      {
        name: 'Dinner Focus',
        description: 'Оройн хоол илүү их',
        distribution: { breakfast: 20, lunch: 30, dinner: 45, snacks: 5 }
      },
      {
        name: 'Frequent Small Meals',
        description: 'Олон удаа багаар',
        distribution: { breakfast: 20, lunch: 25, dinner: 25, snacks: 30 }
      }
    ]
  }

  // Format macros for display
  function formatMacros(macros: MacroGoals) {
    return {
      calories: macros.kcal.toLocaleString(),
      protein: `${macros.proteinG}г`,
      carbs: `${macros.carbsG}г`, 
      fat: `${macros.fatG}г`
    }
  }

  return {
    // Actions
    generateForUser,
    quickGenerate,
    generateWithMacros,
    
    // Utilities
    validateMacros,
    calculateMacroPercentages,
    suggestMacroAdjustments,
    getMealDistributionOptions,
    formatMacros,
    
    // Store state
    isGenerating: computed(() => mealGenerationStore.isGenerating),
    currentMealPlan: computed(() => mealGenerationStore.currentMealPlan),
    currentShoppingList: computed(() => mealGenerationStore.currentShoppingList)
  }
}