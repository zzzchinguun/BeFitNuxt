import { defineStore } from 'pinia'
import { 
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'
import type { 
  GeneratedMeal, 
  MealPlan, 
  MealGenerationRequest, 
  MealGenerationResult,
  ShoppingList,
  ShoppingListItem,
  MacroGoals
} from '~/types'

export const useMealGenerationStore = defineStore('meal-generation', () => {
  const { db } = useFirebase()
  const authStore = useAuthStore()

  // State
  const isGenerating = ref(false)
  const currentMealPlan = ref<MealPlan | null>(null)
  const currentShoppingList = ref<ShoppingList | null>(null)
  const availableMeals = ref<GeneratedMeal[]>([])
  const generationHistory = ref<MealGenerationResult[]>([])

  // Load available meals from database (parsed from Excel)
  async function loadAvailableMeals() {
    try {
      // For now, load from our parsed JSON data
      // In production, this would be from Firestore
      const response = await fetch('/data/parsed-meals.json')
      const meals = await response.json()
      
      // Convert to GeneratedMeal format
      availableMeals.value = meals.map((meal: Record<string, unknown>) => ({
        id: meal.id,
        name: meal.name,
        category: meal.category,
        ingredients: (meal.ingredients as string[]).map((ing: string, index: number) => ({
          id: `${meal.id}-ing-${index}`,
          name: ing,
          amount: 1,
          unit: 'хэсэг',
          category: 'other' as const,
          essential: index < 3 // First 3 are essential
        })),
        instructions: meal.instructions,
        macros: meal.macros,
        servingSize: meal.servingSize || 1,
        source: 'database' as const,
        estimatedTime: Math.floor(Math.random() * 30) + 15, // Random 15-45 min
        difficulty: (['easy', 'medium', 'hard'] as const)[Math.floor(Math.random() * 3)]
      }))
      
      console.log(`Loaded ${availableMeals.value.length} available meals`)
      
    } catch (error) {
      console.error('Failed to load available meals:', error)
      // Fallback to empty array
      availableMeals.value = []
    }
  }

  // Main meal generation algorithm
  async function generateMealPlan(request: MealGenerationRequest): Promise<MealGenerationResult> {
    if (!authStore.user) {
      return {
        success: false,
        errors: ['User not authenticated'],
        accuracy: 0
      }
    }

    isGenerating.value = true

    try {
      // Ensure we have meals loaded
      if (availableMeals.value.length === 0) {
        await loadAvailableMeals()
      }

      const targetMacros = request.targetMacros
      const distribution = request.mealDistribution || {
        breakfast: 25,
        lunch: 35,
        dinner: 35,
        snacks: 5
      }

      // Calculate target macros per meal type
      const breakfastTarget = calculatePartialMacros(targetMacros, distribution.breakfast / 100)
      const lunchTarget = calculatePartialMacros(targetMacros, distribution.lunch / 100)
      const dinnerTarget = calculatePartialMacros(targetMacros, distribution.dinner / 100)
      const snackTarget = calculatePartialMacros(targetMacros, distribution.snacks / 100)

      // Select best meals for each category
      const selectedMeals: GeneratedMeal[] = []
      
      // Select breakfast meals
      const breakfastMeals = selectBestMeals(
        availableMeals.value.filter(m => m.category === 'breakfast'),
        breakfastTarget,
        1
      )
      selectedMeals.push(...breakfastMeals)

      // Select lunch meals  
      const lunchMeals = selectBestMeals(
        availableMeals.value.filter(m => m.category === 'lunch'),
        lunchTarget,
        1
      )
      selectedMeals.push(...lunchMeals)

      // Select dinner meals
      const dinnerMeals = selectBestMeals(
        availableMeals.value.filter(m => m.category === 'dinner'),
        dinnerTarget,
        1
      )
      selectedMeals.push(...dinnerMeals)

      // Add snacks if needed
      if (distribution.snacks > 0) {
        const snackMeals = selectBestMeals(
          availableMeals.value.filter(m => m.category === 'snack'),
          snackTarget,
          1
        )
        selectedMeals.push(...snackMeals)
      }

      // Calculate total macros of selected meals
      const totalMacros = selectedMeals.reduce((total, meal) => ({
        kcal: total.kcal + meal.macros.kcal,
        proteinG: total.proteinG + meal.macros.proteinG,
        carbsG: total.carbsG + meal.macros.carbsG,
        fatG: total.fatG + meal.macros.fatG
      }), { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 })

      // Calculate accuracy
      const accuracy = calculateMacroAccuracy(targetMacros, totalMacros)

      // Create meal plan
      const mealPlan: MealPlan = {
        id: `meal-plan-${Date.now()}`,
        userId: authStore.user.uid,
        targetMacros,
        meals: selectedMeals,
        totalMacros,
        macroAccuracy: accuracy,
        generatedAt: serverTimestamp() as any,
        preferences: request.preferences,
        status: 'active'
      }

      // Generate shopping list
      const shoppingList = await generateShoppingList(mealPlan)

      // Store current plan
      currentMealPlan.value = mealPlan
      currentShoppingList.value = shoppingList

      const result: MealGenerationResult = {
        success: true,
        mealPlan,
        shoppingList,
        accuracy,
        warnings: accuracy < 85 ? ['Macro accuracy is lower than ideal'] : []
      }

      // Add to history
      generationHistory.value.unshift(result)

      return result

    } catch (error: unknown) {
      console.error('Meal generation failed:', error)
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        accuracy: 0
      }
    } finally {
      isGenerating.value = false
    }
  }

  // Helper function to calculate partial macros
  function calculatePartialMacros(total: MacroGoals, percentage: number): MacroGoals {
    return {
      kcal: Math.round(total.kcal * percentage),
      proteinG: Math.round(total.proteinG * percentage),
      carbsG: Math.round(total.carbsG * percentage),
      fatG: Math.round(total.fatG * percentage)
    }
  }

  // Select best meals for target macros
  function selectBestMeals(
    meals: GeneratedMeal[], 
    targetMacros: MacroGoals, 
    count: number
  ): GeneratedMeal[] {
    if (meals.length === 0) return []

    // Score each meal based on how close it matches target macros
    const scoredMeals = meals.map(meal => {
      const accuracy = calculateMacroAccuracy(targetMacros, meal.macros)
      return { meal, score: accuracy }
    })

    // Sort by score and take top N
    return scoredMeals
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(item => item.meal)
  }

  // Calculate how close actual macros match target (percentage)
  function calculateMacroAccuracy(target: MacroGoals, actual: MacroGoals): number {
    // Prevent division by zero by ensuring targets are not zero
    const safeTarget = {
      kcal: Math.max(1, target.kcal),
      proteinG: Math.max(1, target.proteinG),
      carbsG: Math.max(1, target.carbsG),
      fatG: Math.max(1, target.fatG)
    }

    const calorieAccuracy = 1 - Math.abs(safeTarget.kcal - actual.kcal) / safeTarget.kcal
    const proteinAccuracy = 1 - Math.abs(safeTarget.proteinG - actual.proteinG) / safeTarget.proteinG
    const carbAccuracy = 1 - Math.abs(safeTarget.carbsG - actual.carbsG) / safeTarget.carbsG
    const fatAccuracy = 1 - Math.abs(safeTarget.fatG - actual.fatG) / safeTarget.fatG

    // Weighted average (calories are most important)
    const weightedAccuracy = (
      calorieAccuracy * 0.4 +
      proteinAccuracy * 0.25 +
      carbAccuracy * 0.2 +
      fatAccuracy * 0.15
    )

    // Ensure result is a valid number between 0 and 100
    const result = Math.max(0, Math.min(100, Math.round(weightedAccuracy * 100)))
    return isNaN(result) ? 85 : result // Fallback to 85% if calculation fails
  }

  // Generate shopping list from meal plan with CSV ingredient matching
  async function generateShoppingList(mealPlan: MealPlan): Promise<ShoppingList> {
    const ingredientMap = new Map<string, ShoppingListItem>()

    // Load CSV ingredients for matching
    let csvIngredients: any[] = []
    try {
      const response = await fetch('/api/ingredients?onlyWithImage=true')
      const data = await response.json()
      csvIngredients = data.items || []
    } catch (error) {
      console.error('Failed to load CSV ingredients for shopping list:', error)
    }

    // Aggregate ingredients from all meals
    for (const meal of mealPlan.meals) {
      for (const ingredient of meal.ingredients) {
        const key = ingredient.name.toLowerCase().trim()
        
        if (ingredientMap.has(key)) {
          // Combine quantities
          const existing = ingredientMap.get(key)!
          existing.amount += ingredient.amount
        } else {
          // Find matching CSV ingredient
          const { findIngredientMatch, createShoppingListItem } = await import('~/utils/ingredient-matcher')
          const match = await findIngredientMatch(ingredient.name, csvIngredients)
          
          // Create enhanced shopping list item
          const shoppingItem = createShoppingListItem(
            ingredient.id,
            ingredient.name,
            ingredient.amount,
            ingredient.unit,
            match,
            ingredient.category
          )
          
          ingredientMap.set(key, shoppingItem)
        }
      }
    }

    return {
      id: `shopping-list-${Date.now()}`,
      userId: authStore.user!.uid,
      mealPlanId: mealPlan.id,
      items: Array.from(ingredientMap.values()),
      totalItems: ingredientMap.size,
      estimatedCost: Array.from(ingredientMap.values()).reduce((total, item) => total + (item.price || 0), 0),
      createdAt: serverTimestamp() as any,
      completed: false
    }
  }

  // Mock price estimation (replace with real pricing data)
  function estimatePrice(ingredientName: string): number {
    const name = ingredientName.toLowerCase()
    
    // Simple price estimation based on ingredient type
    if (name.includes('уураг') || name.includes('protein')) return 15000
    if (name.includes('бяслаг') || name.includes('тараг')) return 4000
    if (name.includes('мах') || name.includes('өндөг')) return 5000
    if (name.includes('жимс') || name.includes('ногоо')) return 2000
    if (name.includes('тос') || name.includes('oil')) return 8000
    
    return Math.floor(Math.random() * 5000) + 1000 // Random 1000-6000₮
  }

  // Regenerate a single meal
  async function regenerateMeal(mealId: string): Promise<boolean> {
    if (!currentMealPlan.value) return false

    try {
      const mealIndex = currentMealPlan.value.meals.findIndex(m => m.id === mealId)
      if (mealIndex === -1) return false

      const currentMeal = currentMealPlan.value.meals[mealIndex]
      const category = currentMeal.category

      // Get target macros for this meal type
      const distribution = { breakfast: 25, lunch: 35, dinner: 35, snacks: 5 }
      const percentage = distribution[category as keyof typeof distribution] / 100
      const targetMacros = calculatePartialMacros(currentMealPlan.value.targetMacros, percentage)

      // Find available meals in same category, excluding current one
      const availableAlternatives = availableMeals.value.filter(m => 
        m.category === category && m.id !== mealId
      )

      if (availableAlternatives.length === 0) return false

      // Select best alternative
      const alternatives = selectBestMeals(availableAlternatives, targetMacros, 1)
      if (alternatives.length === 0) return false

      // Replace the meal
      currentMealPlan.value.meals[mealIndex] = alternatives[0]

      // Recalculate totals
      currentMealPlan.value.totalMacros = currentMealPlan.value.meals.reduce((total, meal) => ({
        kcal: total.kcal + meal.macros.kcal,
        proteinG: total.proteinG + meal.macros.proteinG,
        carbsG: total.carbsG + meal.macros.carbsG,
        fatG: total.fatG + meal.macros.fatG
      }), { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 })

      // Recalculate accuracy
      currentMealPlan.value.macroAccuracy = calculateMacroAccuracy(
        currentMealPlan.value.targetMacros,
        currentMealPlan.value.totalMacros
      )

      // Regenerate shopping list
      currentShoppingList.value = await generateShoppingList(currentMealPlan.value)

      return true

    } catch (error) {
      console.error('Failed to regenerate meal:', error)
      return false
    }
  }

  // Save meal plan to Firestore
  async function saveMealPlan(mealPlan: MealPlan): Promise<boolean> {
    try {
      if (!authStore.user) return false

      const mealPlansRef = collection(db, 'meal_plans')
      await addDoc(mealPlansRef, {
        ...mealPlan,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any
      })

      // Update user profile
      await authStore.updateUserProfile({ mealPlanGenerated: true })

      return true
    } catch (error) {
      console.error('Failed to save meal plan:', error)
      return false
    }
  }

  // Initialize store - load meals when store is first accessed
  if (import.meta.client && availableMeals.value.length === 0) {
    loadAvailableMeals()
  }

  return {
    // State
    isGenerating: readonly(isGenerating),
    currentMealPlan: readonly(currentMealPlan),
    currentShoppingList: readonly(currentShoppingList),
    availableMeals: readonly(availableMeals),
    generationHistory: readonly(generationHistory),

    // Actions
    loadAvailableMeals,
    generateMealPlan,
    regenerateMeal,
    saveMealPlan
  }
})