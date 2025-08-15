import { defineStore } from 'pinia'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import type { 
  OnboardingData, 
  MacroGoals, 
  PhysicalStats, 
  ActivityLevel, 
  BodyFatInput, 
  GoalType, 
  GoalPlan 
} from '~/types'
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
  validateOnboardingStep,
  validateSafePace,
  getRecommendedPaceRange,
  // Legacy support
  calculateWeightChangeRate,
  isHealthyWeightChangeRate
} from '~/utils/onboarding'

export const useOnboardingStore = defineStore('onboarding', () => {
  const { db } = useFirebase()
  const authStore = useAuthStore()

  // Enhanced state with comprehensive data structure
  const currentStep = ref(1)
  const formData = ref<Partial<OnboardingData>>({
    completed: false,
    currentStep: 1
  })
  
  // New structured data
  const physical = ref<Partial<PhysicalStats>>({})
  const activity = ref<ActivityLevel | null>(null)
  const bodyFatData = ref<Partial<BodyFatInput>>({ method: 'unknown' })
  const goalType = ref<GoalType | null>(null)
  const plan = ref<Partial<GoalPlan>>({})
  
  // Calculated values
  const calculatedMacros = ref<MacroGoals | null>(null)
  const isLoading = ref(false)
  const showAdvancedOptions = ref(false)

  // Enhanced computed properties
  const metricPhysical = computed(() => {
    if (!physical.value.height || !physical.value.weight) return null
    return convertToMetric(physical.value as PhysicalStats)
  })

  const bmr = computed(() => {
    if (!metricPhysical.value || !physical.value.ageYears || !physical.value.gender) {
      // Legacy support
      if (formData.value.weight && formData.value.height && formData.value.age && formData.value.gender) {
        return calculateBMR(formData.value.weight, formData.value.height, formData.value.age, formData.value.gender)
      }
      return 0
    }
    return calculateBMR(
      metricPhysical.value.weightKg,
      metricPhysical.value.heightCm,
      physical.value.ageYears,
      physical.value.gender
    )
  })

  const tdee = computed(() => {
    if (!bmr.value) return 0
    
    const activityLevel = activity.value || formData.value.activityLevel
    if (!activityLevel) return 0
    
    return calculateTDEE(bmr.value, activityLevel)
  })

  const bodyFatPercent = computed(() => {
    if (!bodyFatData.value.method || !metricPhysical.value || !physical.value.gender) return null
    
    switch (bodyFatData.value.method) {
      case 'known':
        return bodyFatData.value.percent || null
      case 'tape':
        if (!bodyFatData.value.measurements?.waist || !bodyFatData.value.measurements?.neck) return null
        try {
          return estimateBodyFatNavy(
            bodyFatData.value.measurements.waist,
            bodyFatData.value.measurements.neck,
            metricPhysical.value.heightCm,
            physical.value.gender,
            bodyFatData.value.measurements.hip
          )
        } catch {
          return null
        }
      case 'visual':
        // This would be set by the visual selector component
        return bodyFatData.value.percent || null
      case 'unknown':
        return estimateBodyFatFromBMI(
          metricPhysical.value.weightKg,
          metricPhysical.value.heightCm,
          physical.value.gender
        )
      default:
        return null
    }
  })

  const leanBodyMass = computed(() => {
    if (!metricPhysical.value || !bodyFatPercent.value) return null
    return calculateLeanBodyMass(metricPhysical.value.weightKg, bodyFatPercent.value)
  })

  const calorieTarget = computed(() => {
    if (!tdee.value || !goalType.value || !plan.value.paceKgPerWeek || !physical.value.gender) return 0
    return calculateCalorieTarget(tdee.value, goalType.value, plan.value.paceKgPerWeek, physical.value.gender)
  })

  const finalMacros = computed(() => {
    if (!calorieTarget.value || !goalType.value || !metricPhysical.value) return null
    return calculateMacros(
      calorieTarget.value,
      goalType.value,
      metricPhysical.value.weightKg,
      leanBodyMass.value || undefined
    )
  })

  const timeline = computed(() => {
    if (!metricPhysical.value || !plan.value.targetWeightKg || !plan.value.paceKgPerWeek) return null
    return estimateTimeline(
      metricPhysical.value.weightKg,
      plan.value.targetWeightKg,
      plan.value.paceKgPerWeek
    )
  })

  const isCurrentStepValid = computed(() => {
    const data = {
      ...formData.value,
      physical: physical.value,
      activity: activity.value,
      bodyFatData: bodyFatData.value,
      goalType: goalType.value,
      plan: plan.value
    }
    return validateOnboardingStep(currentStep.value, data)
  })

  const paceValidation = computed(() => {
    if (!goalType.value || !plan.value.paceKgPerWeek) return { isValid: true }
    return validateSafePace(plan.value.paceKgPerWeek, goalType.value)
  })

  // Legacy computed for backward compatibility
  const weightChangeRate = computed(() => {
    if (!formData.value.weight || !formData.value.goalWeight || !formData.value.timelineWeeks) {
      return 0
    }
    return calculateWeightChangeRate(
      formData.value.weight,
      formData.value.goalWeight,
      formData.value.timelineWeeks
    )
  })

  const isHealthyRate = computed(() => {
    return isHealthyWeightChangeRate(weightChangeRate.value)
  })

  // Enhanced actions
  function setPhysical(data: Partial<PhysicalStats>) {
    physical.value = { ...physical.value, ...data }
    persistState()
  }

  function setActivity(level: ActivityLevel) {
    activity.value = level
    persistState()
  }

  function setBodyFat(data: Partial<BodyFatInput>) {
    bodyFatData.value = { ...bodyFatData.value, ...data }
    persistState()
  }

  function setGoal(goal: GoalType) {
    goalType.value = goal
    
    // Set default pace based on goal
    const range = getRecommendedPaceRange(goal)
    if (!plan.value.paceKgPerWeek) {
      plan.value.paceKgPerWeek = range.default
    }
    persistState()
  }

  function setPlan(planData: Partial<GoalPlan>) {
    plan.value = { ...plan.value, ...planData }
    persistState()
  }

  function computeAll() {
    if (finalMacros.value) {
      calculatedMacros.value = finalMacros.value
    }
  }

  function updateFormData(updates: Partial<OnboardingData>) {
    formData.value = { ...formData.value, ...updates }
    persistState()
  }

  function nextStep() {
    if (isCurrentStepValid.value && currentStep.value < 9) {
      currentStep.value++
      formData.value.currentStep = currentStep.value
      persistState()
    }
  }

  function previousStep() {
    if (currentStep.value > 1) {
      currentStep.value--
      formData.value.currentStep = currentStep.value
      persistState()
    }
  }

  function goToStep(step: number) {
    if (step >= 1 && step <= 9) {
      currentStep.value = step
      formData.value.currentStep = step
      persistState()
    }
  }

  // State persistence
  function persistState() {
    if (process.client) {
      const state = {
        currentStep: currentStep.value,
        formData: formData.value,
        physical: physical.value,
        activity: activity.value,
        bodyFatData: bodyFatData.value,
        goalType: goalType.value,
        plan: plan.value,
        timestamp: Date.now()
      }
      localStorage.setItem('onboarding-state', JSON.stringify(state))
    }
  }

  function loadPersistedState() {
    if (process.client) {
      const saved = localStorage.getItem('onboarding-state')
      if (saved) {
        try {
          const state = JSON.parse(saved)
          const hoursSince = (Date.now() - state.timestamp) / (1000 * 60 * 60)
          
          // Only load if less than 24 hours old
          if (hoursSince < 24) {
            currentStep.value = state.currentStep || 1
            formData.value = state.formData || { completed: false }
            physical.value = state.physical || {}
            activity.value = state.activity || null
            bodyFatData.value = state.bodyFatData || { method: 'unknown' }
            goalType.value = state.goalType || null
            plan.value = state.plan || {}
          }
        } catch (error) {
          console.warn('Failed to load persisted onboarding state:', error)
        }
      }
    }
  }

  async function saveToFirestore() {
    if (!authStore.user) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true

    try {
      // Ensure all calculations are up to date
      computeAll()

      if (!finalMacros.value || !metricPhysical.value) {
        throw new Error('Missing required calculation data')
      }

      // Create comprehensive onboarding data
      const completedData: OnboardingData = {
        // Legacy fields for backward compatibility
        age: physical.value.ageYears,
        height: metricPhysical.value.heightCm,
        weight: metricPhysical.value.weightKg,
        gender: physical.value.gender,
        activityLevel: activity.value === 'light' ? 'lightly_active' : 
                      activity.value === 'moderate' ? 'moderately_active' :
                      activity.value === 'very' ? 'very_active' :
                      activity.value === 'extra' ? 'extra_active' : 'sedentary',
        bodyFat: bodyFatPercent.value && bodyFatPercent.value > 0 ? bodyFatPercent.value : null,
        goal: goalType.value,
        goalWeight: plan.value.targetWeightKg,
        timelineWeeks: timeline.value?.estimatedWeeks,
        bmr: bmr.value,
        tdee: tdee.value,
        
        // New structured data
        physical: physical.value as PhysicalStats,
        activity: activity.value,
        bodyFatData: bodyFatData.value as BodyFatInput,
        goalType: goalType.value,
        plan: plan.value as GoalPlan,
        macros: finalMacros.value,
        currentStep: 9, // Completed
        
        // Computed values
        leanBodyMassKg: leanBodyMass.value || undefined,
        calorieTarget: calorieTarget.value,
        
        // Completion tracking
        completed: true,
        completedAt: serverTimestamp() as any
      }

      // Update user profile in Firestore
      const userRef = doc(db, 'users', authStore.user.uid)
      await updateDoc(userRef, {
        onboarding: completedData,
        macroGoals: finalMacros.value,
        units: {
          weight: physical.value.weight?.unit || 'kg',
          height: physical.value.height?.unit || 'cm'
        },
        onboarded: true,
        updatedAt: serverTimestamp()
      })

      // Update local auth store
      await authStore.updateUserProfile({
        onboarding: completedData,
        macroGoals: finalMacros.value,
        onboarded: true
      })

      // Clear persisted state
      if (process.client) {
        localStorage.removeItem('onboarding-state')
      }

      return { success: true }
    } catch (error: any) {
      console.error('Onboarding completion error:', error)
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  function reset() {
    currentStep.value = 1
    formData.value = { completed: false, currentStep: 1 }
    physical.value = {}
    activity.value = null
    bodyFatData.value = { method: 'unknown' }
    goalType.value = null
    plan.value = {}
    calculatedMacros.value = null
    showAdvancedOptions.value = false
    
    // Clear persisted state
    if (process.client) {
      localStorage.removeItem('onboarding-state')
    }
  }

  function loadExistingOnboarding() {
    if (authStore.user?.onboarding) {
      const existing = authStore.user.onboarding
      
      // Load legacy data
      formData.value = { ...existing }
      calculatedMacros.value = authStore.user.macroGoals
      
      // Load new structured data if available
      if (existing.physical) {
        physical.value = existing.physical
      } else if (existing.height && existing.weight && existing.age && existing.gender) {
        // Convert legacy data to new structure
        physical.value = {
          ageYears: existing.age,
          height: { value: existing.height, unit: 'cm' },
          weight: { value: existing.weight, unit: 'kg' },
          gender: existing.gender
        }
      }
      
      if (existing.activity) {
        activity.value = existing.activity
      } else if (existing.activityLevel) {
        // Convert legacy activity level
        const activityMap: Record<string, ActivityLevel> = {
          sedentary: 'sedentary',
          lightly_active: 'light',
          moderately_active: 'moderate',
          very_active: 'very',
          extra_active: 'extra'
        }
        activity.value = activityMap[existing.activityLevel] || 'moderate'
      }
      
      if (existing.bodyFatData) {
        bodyFatData.value = existing.bodyFatData
      } else if (existing.bodyFat) {
        bodyFatData.value = { method: 'known', percent: existing.bodyFat }
      }
      
      if (existing.goalType) {
        goalType.value = existing.goalType
      } else if (existing.goal) {
        goalType.value = existing.goal
      }
      
      if (existing.plan) {
        plan.value = existing.plan
      } else if (existing.goalWeight && existing.timelineWeeks) {
        plan.value = {
          targetWeightKg: existing.goalWeight,
          paceKgPerWeek: Math.abs(existing.goalWeight - (existing.weight || 70)) / existing.timelineWeeks,
          estimatedWeeks: existing.timelineWeeks
        }
      }
      
      if (existing.completed) {
        currentStep.value = 9 // Summary step
      } else {
        currentStep.value = existing.currentStep || 1
      }
    } else {
      // Try to load from localStorage
      loadPersistedState()
    }
  }

  return {
    // State
    currentStep: readonly(currentStep),
    formData: readonly(formData),
    physical: readonly(physical),
    activity: readonly(activity),
    bodyFatData: readonly(bodyFatData),
    goalType: readonly(goalType),
    plan: readonly(plan),
    calculatedMacros: readonly(calculatedMacros),
    isLoading: readonly(isLoading),
    showAdvancedOptions: readonly(showAdvancedOptions),
    
    // Computed values
    metricPhysical,
    bmr,
    tdee,
    bodyFatPercent,
    leanBodyMass,
    calorieTarget,
    finalMacros,
    timeline,
    isCurrentStepValid,
    paceValidation,
    
    // Legacy computed
    weightChangeRate,
    isHealthyRate,
    
    // Actions
    setPhysical,
    setActivity,
    setBodyFat,
    setGoal,
    setPlan,
    computeAll,
    updateFormData,
    nextStep,
    previousStep,
    goToStep,
    saveToFirestore,
    reset,
    loadExistingOnboarding,
    persistState,
    loadPersistedState,
    
    // Legacy actions
    completeOnboarding: saveToFirestore,
    resetOnboarding: reset
  }
})