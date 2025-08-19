import type { IngredientItem } from '~/server/api/ingredients'

export interface IngredientMatch {
  csvIngredient: IngredientItem | null
  confidence: number
  reasons: string[]
}

/**
 * Normalize ingredient names for better matching
 */
function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Remove common food preparation terms
    .replace(/\b(нарийн|нарийн боовтой|боовтой|хуурай|шинэ|давсгүй|өөх тостой)\b/g, '')
    // Remove units and quantities
    .replace(/\b\d+\s*(г|кг|мл|л|ширхэг|аяга|хэсэг|хэмжээ)\b/g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Calculate similarity between two strings using basic matching
 */
function calculateSimilarity(str1: string, str2: string): number {
  const norm1 = normalizeIngredientName(str1)
  const norm2 = normalizeIngredientName(str2)
  
  // Exact match
  if (norm1 === norm2) return 1.0
  
  // Check if one contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.8
  
  // Check for common keywords
  const words1 = norm1.split(' ').filter(w => w.length > 2)
  const words2 = norm2.split(' ').filter(w => w.length > 2)
  
  if (words1.length === 0 || words2.length === 0) return 0
  
  const commonWords = words1.filter(w => words2.includes(w))
  const similarity = commonWords.length / Math.max(words1.length, words2.length)
  
  return similarity
}

/**
 * Map category from meal ingredient to shopping list category
 */
function mapToShoppingCategory(csvCategory: string[]): 'protein' | 'vegetables' | 'carbs' | 'dairy' | 'fats' | 'spices' | 'other' {
  const categoryPath = csvCategory.join(' ').toLowerCase()
  
  if (categoryPath.includes('мах') || categoryPath.includes('өндөг')) return 'protein'
  if (categoryPath.includes('сүү') || categoryPath.includes('бяслаг') || categoryPath.includes('тараг')) return 'dairy'
  if (categoryPath.includes('ногоо') || categoryPath.includes('жимс')) return 'vegetables'
  if (categoryPath.includes('гурил') || categoryPath.includes('будаа') || categoryPath.includes('талх')) return 'carbs'
  if (categoryPath.includes('тос') || categoryPath.includes('өөх')) return 'fats'
  if (categoryPath.includes('амтлагч') || categoryPath.includes('халуун ногоо')) return 'spices'
  
  return 'other'
}

/**
 * Find the best matching CSV ingredient for a meal ingredient name
 */
export async function findIngredientMatch(
  ingredientName: string,
  csvIngredients?: IngredientItem[]
): Promise<IngredientMatch> {
  
  if (!csvIngredients) {
    // Fetch CSV ingredients if not provided
    try {
      const response = await fetch('/api/ingredients?onlyWithImage=true')
      const data = await response.json()
      csvIngredients = data.items || []
    } catch (error) {
      console.error('Failed to fetch CSV ingredients:', error)
      return {
        csvIngredient: null,
        confidence: 0,
        reasons: ['Failed to load ingredient database']
      }
    }
  }

  if (!csvIngredients || csvIngredients.length === 0) {
    return {
      csvIngredient: null,
      confidence: 0,
      reasons: ['No ingredient database available']
    }
  }

  let bestMatch: IngredientItem | null = null
  let bestScore = 0
  const reasons: string[] = []

  for (const csvIngredient of csvIngredients) {
    const similarity = calculateSimilarity(ingredientName, csvIngredient.name)
    
    if (similarity > bestScore) {
      bestScore = similarity
      bestMatch = csvIngredient
    }
  }

  // Determine confidence and reasons
  if (bestScore >= 0.8) {
    reasons.push('High similarity match')
  } else if (bestScore >= 0.5) {
    reasons.push('Partial match found')
  } else if (bestScore > 0) {
    reasons.push('Low confidence match')
  } else {
    reasons.push('No suitable match found')
  }

  return {
    csvIngredient: bestMatch,
    confidence: bestScore,
    reasons
  }
}

/**
 * Enhanced shopping list item creation with CSV data
 */
export function createShoppingListItem(
  ingredientId: string,
  ingredientName: string,
  amount: number,
  unit: string,
  csvMatch: IngredientMatch,
  originalCategory: string = 'other'
): {
  id: string
  name: string
  amount: number
  unit: string
  category: 'protein' | 'vegetables' | 'carbs' | 'dairy' | 'fats' | 'spices' | 'other'
  price?: number
  checked: boolean
  imageUrl?: string
  notes?: string
} {
  const csvIngredient = csvMatch.csvIngredient
  
  // Use CSV data if available and confidence is reasonable
  const shouldUseCsvData = csvIngredient && csvMatch.confidence >= 0.5
  
  const category = shouldUseCsvData 
    ? mapToShoppingCategory(csvIngredient.categoryPath)
    : (originalCategory as any)

  const price = shouldUseCsvData && csvIngredient.price
    ? parseInt(csvIngredient.price.replace(/[^\d]/g, '')) || undefined
    : undefined

  const imageUrl = shouldUseCsvData && csvIngredient.imageUrl
    ? csvIngredient.imageUrl
    : undefined

  // Add notes for low confidence matches
  const notes = csvMatch.confidence < 0.7 && csvMatch.confidence > 0 
    ? `Автомат таарц: ${csvIngredient?.name || 'тодорхойгүй'}`
    : undefined

  return {
    id: `shopping-${ingredientId}`,
    name: ingredientName,
    amount,
    unit,
    category,
    price,
    checked: false,
    imageUrl,
    notes
  }
}
