import { defineStore } from 'pinia'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore'
import { format } from 'date-fns'
import type { MealEntry, MealItem, VerifiedMeal, UnverifiedMeal, DailyMacros, SearchFilters } from '~/types'

export const useMealsStore = defineStore('meals', () => {
  const { db } = useFirebase()
  const authStore = useAuthStore()

  // State
  const mealsByDate = ref<Record<string, MealEntry[]>>({})
  const currentDate = ref(format(new Date(), 'yyyy-MM-dd'))
  const verifiedMeals = ref<VerifiedMeal[]>([])
  const searchResults = ref<VerifiedMeal[]>([])
  const isLoading = ref(false)
  const searchLoading = ref(false)

  // Computed
  const todaysMeals = computed(() => mealsByDate.value[currentDate.value] || [])

  function getMealsForDate(date: string) {
    return mealsByDate.value[date] || []
  }

  function getDailyTotals(date: string) {
    const meals = getMealsForDate(date)
    return meals.reduce(
      (totals, meal) => ({
        kcal: totals.kcal + meal.totals.kcal,
        proteinG: totals.proteinG + meal.totals.proteinG,
        carbsG: totals.carbsG + meal.totals.carbsG,
        fatG: totals.fatG + meal.totals.fatG
      }),
      { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }
    )
  }

  const dailyMacros = computed((): DailyMacros => {
    const consumed = getDailyTotals(currentDate.value)
    const goals = authStore.user?.macroGoals || { kcal: 2000, proteinG: 100, carbsG: 250, fatG: 67 }
    
    const remaining = {
      kcal: Math.max(0, goals.kcal - consumed.kcal),
      proteinG: Math.max(0, goals.proteinG - consumed.proteinG),
      carbsG: Math.max(0, goals.carbsG - consumed.carbsG),
      fatG: Math.max(0, goals.fatG - consumed.fatG)
    }

    const percentages = {
      kcal: goals.kcal > 0 ? (consumed.kcal / goals.kcal) * 100 : 0,
      protein: goals.proteinG > 0 ? (consumed.proteinG / goals.proteinG) * 100 : 0,
      carbs: goals.carbsG > 0 ? (consumed.carbsG / goals.carbsG) * 100 : 0,
      fat: goals.fatG > 0 ? (consumed.fatG / goals.fatG) * 100 : 0
    }

    return {
      date: currentDate.value,
      consumed: {
        kcal: consumed.kcal,
        protein: consumed.proteinG,
        carbs: consumed.carbsG,
        fat: consumed.fatG
      },
      goals: {
        kcal: goals.kcal,
        protein: goals.proteinG,
        carbs: goals.carbsG,
        fat: goals.fatG
      },
      remaining: {
        kcal: remaining.kcal,
        protein: remaining.proteinG,
        carbs: remaining.carbsG,
        fat: remaining.fatG
      },
      percentages
    }
  })

  // Actions
  async function loadMealsForDate(date: string) {
    if (!authStore.user) return

    isLoading.value = true

    try {
      const mealsRef = collection(db, `meals/${authStore.user.uid}/entries`)
      const q = query(
        mealsRef,
        where('date', '==', date),
        orderBy('createdAt', 'asc')
      )
      
      const snapshot = await getDocs(q)
      const meals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MealEntry[]
      
      mealsByDate.value[date] = meals
      
    } catch (error) {
      console.error('Error loading meals:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function loadTodaysMeals(date?: string) {
    const targetDate = date || format(new Date(), 'yyyy-MM-dd')
    currentDate.value = targetDate
    await loadMealsForDate(targetDate)
  }

  async function addMeal(data: {
    date: Date,
    timeOfDay: MealEntry['timeOfDay'],
    items: MealItem[]
  }): Promise<string> {
    if (!authStore.user) throw new Error('User not authenticated')

    const totals = data.items.reduce(
      (sum, item) => ({
        kcal: sum.kcal + item.kcal,
        proteinG: sum.proteinG + item.protein,
        carbsG: sum.carbsG + item.carbs,
        fatG: sum.fatG + item.fat
      }),
      { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }
    )

    const dateStr = format(data.date, 'yyyy-MM-dd')
    const mealEntry: Omit<MealEntry, 'id'> = {
      userId: authStore.user.uid,
      date: dateStr,
      timeOfDay: data.timeOfDay,
      items: data.items,
      totals,
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any
    }

    try {
      const mealsRef = collection(db, `meals/${authStore.user.uid}/entries`)
      const docRef = await addDoc(mealsRef, mealEntry)
      
      // Add to local state
      if (!mealsByDate.value[dateStr]) {
        mealsByDate.value[dateStr] = []
      }
      mealsByDate.value[dateStr].push({
        id: docRef.id,
        ...mealEntry
      } as MealEntry)

      return docRef.id
    } catch (error) {
      console.error('Error adding meal entry:', error)
      throw error
    }
  }

  async function addMealEntry(
    timeOfDay: MealEntry['timeOfDay'],
    items: MealItem[]
  ): Promise<string> {
    return addMeal({
      date: new Date(),
      timeOfDay,
      items
    })
  }

  async function updateMealEntry(mealId: string, updates: Partial<MealEntry>) {
    if (!authStore.user) throw new Error('User not authenticated')

    try {
      const mealRef = doc(db, `meals/${authStore.user.uid}/entries`, mealId)
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      }
      
      await updateDoc(mealRef, updateData)
      
      // Update local state
      const index = todaysMeals.value.findIndex(meal => meal.id === mealId)
      if (index !== -1) {
        todaysMeals.value[index] = {
          ...todaysMeals.value[index],
          ...updates
        }
      }
    } catch (error) {
      console.error('Error updating meal entry:', error)
      throw error
    }
  }

  async function deleteMeal(mealId: string) {
    if (!authStore.user) throw new Error('User not authenticated')

    try {
      const mealRef = doc(db, `meals/${authStore.user.uid}/entries`, mealId)
      await deleteDoc(mealRef)
      
      // Remove from local state - find and remove from all dates
      for (const date in mealsByDate.value) {
        mealsByDate.value[date] = mealsByDate.value[date].filter(meal => meal.id !== mealId)
      }
    } catch (error) {
      console.error('Error deleting meal entry:', error)
      throw error
    }
  }

  async function deleteMealEntry(mealId: string) {
    return deleteMeal(mealId)
  }

  async function searchVerifiedMeals(filters: SearchFilters) {
    searchLoading.value = true

    try {
      const mealsRef = collection(db, 'verified_meals')
      let q = query(mealsRef, orderBy('name'), limit(50))

      // Add filters based on search criteria
      if (filters.categories && filters.categories.length > 0) {
        q = query(q, where('categories', 'array-contains-any', filters.categories))
      }

      if (filters.brand) {
        q = query(q, where('brand', '==', filters.brand))
      }

      if (filters.hasBarcode !== undefined) {
        if (filters.hasBarcode) {
          q = query(q, where('barcode', '!=', null))
        }
      }

      const snapshot = await getDocs(q)
      let results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VerifiedMeal[]

      // Client-side filtering for text search (since Firestore has limited text search)
      if (filters.query) {
        const searchTerm = filters.query.toLowerCase()
        results = results.filter(meal => 
          meal.name.toLowerCase().includes(searchTerm) ||
          meal.brand?.toLowerCase().includes(searchTerm) ||
          meal.categories.some(cat => cat.toLowerCase().includes(searchTerm))
        )
      }

      searchResults.value = results
      return results
    } catch (error) {
      console.error('Error searching meals:', error)
      throw error
    } finally {
      searchLoading.value = false
    }
  }

  async function getMealByBarcode(barcode: string): Promise<VerifiedMeal | null> {
    try {
      const mealsRef = collection(db, 'verified_meals')
      const q = query(mealsRef, where('barcode', '==', barcode), limit(1))
      
      const snapshot = await getDocs(q)
      if (snapshot.empty) {
        return null
      }

      const doc = snapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data()
      } as VerifiedMeal
    } catch (error) {
      console.error('Error finding meal by barcode:', error)
      return null
    }
  }

  async function addCustomMeal(mealData: Omit<UnverifiedMeal, 'id' | 'status' | 'submittedBy' | 'createdAt' | 'updatedAt'>) {
    if (!authStore.user) throw new Error('User not authenticated')

    const customMeal: Omit<UnverifiedMeal, 'id'> = {
      ...mealData,
      status: 'pending',
      submittedBy: authStore.user.uid,
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any
    }

    try {
      const customMealsRef = collection(db, 'unverified_meals')
      const docRef = await addDoc(customMealsRef, customMeal)
      return docRef.id
    } catch (error) {
      console.error('Error adding custom meal:', error)
      throw error
    }
  }

  function calculateMacrosForQuantity(meal: VerifiedMeal, quantityGrams: number): MealItem {
    const multiplier = quantityGrams / 100 // per100g to actual quantity
    
    return {
      refType: 'verified',
      refId: meal.id,
      name: meal.name,
      brand: meal.brand,
      quantityGrams,
      kcal: Math.round(meal.per100g.kcal * multiplier),
      protein: Math.round(meal.per100g.protein * multiplier * 10) / 10,
      carbs: Math.round(meal.per100g.carbs * multiplier * 10) / 10,
      fat: Math.round(meal.per100g.fat * multiplier * 10) / 10
    }
  }

  return {
    // State
    mealsByDate: readonly(mealsByDate),
    todaysMeals,
    currentDate: readonly(currentDate),
    verifiedMeals: readonly(verifiedMeals),
    searchResults: readonly(searchResults),
    isLoading: readonly(isLoading),
    searchLoading: readonly(searchLoading),

    // Computed
    dailyMacros,
    getMealsForDate,
    getDailyTotals,

    // Actions
    loadMealsForDate,
    loadTodaysMeals,
    addMeal,
    addMealEntry,
    updateMealEntry,
    deleteMeal,
    deleteMealEntry,
    searchVerifiedMeals,
    getMealByBarcode,
    addCustomMeal,
    calculateMacrosForQuantity
  }
})