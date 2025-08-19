import XLSX from 'xlsx'
import { writeFileSync } from 'fs'
import { join } from 'path'

interface ExcelMeal {
  [key: string]: any
  'Хоолны Төрөл': string
  'Жорын Нэр': string
  'Орц': string
  'Заавар': string
  'Макро (ойролцоо)': string
}

interface ParsedMeal {
  id: string
  name: string
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ingredients: string[]
  instructions: string[]
  macros: {
    kcal: number
    proteinG: number
    carbsG: number
    fatG: number
  }
  servingSize: number
  imageUrl?: string
}

function parseCategory(mongolianCategory: string): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
  const category = mongolianCategory.toLowerCase().trim()
  
  // Map Mongolian meal types to categories
  if (category.includes('өглөө') || category.includes('breakfast')) {
    return 'breakfast'
  } else if (category.includes('өдөр') || category.includes('lunch') || category.includes('үдийн')) {
    return 'lunch'
  } else if (category.includes('орой') || category.includes('dinner') || category.includes('оройн')) {
    return 'dinner'
  } else {
    return 'snack' // Default to snack for flexibility
  }
}

function parseIngredients(ingredientsText: string): string[] {
  if (!ingredientsText) return []
  
  // Split by common delimiters and clean up
  return ingredientsText
    .split(/[,\n;]/)
    .map(ingredient => ingredient.trim())
    .filter(ingredient => ingredient.length > 0)
}

function parseInstructions(instructionsText: string): string[] {
  if (!instructionsText) return []
  
  // Split by periods, numbers, or line breaks for instructions
  return instructionsText
    .split(/\d+\.|\n|;/)
    .map(instruction => instruction.trim())
    .filter(instruction => instruction.length > 0)
}

function parseMacros(macroText: string): { kcal: number; proteinG: number; carbsG: number; fatG: number } {
  const defaultMacros = { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  
  if (!macroText) return defaultMacros
  
  const text = macroText.toLowerCase()
  
  // Extract numbers followed by unit indicators
  const kcalMatch = text.match(/(\d+)\s*(?:ккал|kcal|cal)/i)
  const proteinMatch = text.match(/(\d+)\s*(?:г|g)?\s*(?:уураг|protein)/i)
  const carbsMatch = text.match(/(\d+)\s*(?:г|g)?\s*(?:нүүрс|carb|углевод)/i)
  const fatMatch = text.match(/(\d+)\s*(?:г|g)?\s*(?:өөх|fat|жир)/i)
  
  return {
    kcal: kcalMatch ? parseInt(kcalMatch[1]) : 0,
    proteinG: proteinMatch ? parseInt(proteinMatch[1]) : 0,
    carbsG: carbsMatch ? parseInt(carbsMatch[1]) : 0,
    fatG: fatMatch ? parseInt(fatMatch[1]) : 0
  }
}

function generateId(name: string, index: number): string {
  // Create a clean ID from the meal name
  const cleanName = name
    .toLowerCase()
    .replace(/[^\u0400-\u04FFa-z0-9\s]/g, '') // Keep Cyrillic, Latin, numbers, spaces
    .trim()
    .replace(/\s+/g, '-')
  
  return `${cleanName}-${index + 1}`
}

async function parseMealsExcel(): Promise<ParsedMeal[]> {
  try {
    console.log('📚 Reading Excel file...')
    
    // Read the Excel file
    const workbook = XLSX.readFile('Хоолны-жор.xlsx')
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Convert to JSON
    const rawData: ExcelMeal[] = XLSX.utils.sheet_to_json(worksheet)
    
    console.log(`📋 Found ${rawData.length} meals in Excel file`)
    
    // Parse each meal
    const parsedMeals: ParsedMeal[] = rawData.map((row, index) => {
      const meal: ParsedMeal = {
        id: generateId(row['Жорын Нэр'] || `meal-${index}`, index),
        name: row['Жорын Нэр'] || `Unnamed Meal ${index + 1}`,
        category: parseCategory(row['Хоолны Төрөл'] || 'snack'),
        ingredients: parseIngredients(row['Орц'] || ''),
        instructions: parseInstructions(row['Заавар'] || ''),
        macros: parseMacros(row['Макро (ойролцоо)'] || ''),
        servingSize: 1, // Default serving size
        imageUrl: undefined // Will be added later when you provide images
      }
      
      return meal
    })
    
    // Filter out meals with missing essential data
    const validMeals = parsedMeals.filter(meal => 
      meal.name && 
      meal.ingredients.length > 0 && 
      (meal.macros.kcal > 0 || meal.macros.proteinG > 0)
    )
    
    console.log(`✅ Successfully parsed ${validMeals.length} valid meals`)
    
    // Group by category for summary
    const summary = validMeals.reduce((acc, meal) => {
      acc[meal.category] = (acc[meal.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log('📊 Meal distribution by category:')
    Object.entries(summary).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} meals`)
    })
    
    return validMeals
    
  } catch (error) {
    console.error('❌ Error parsing Excel file:', error)
    throw error
  }
}

async function extractIngredientsList(meals: ParsedMeal[]): Promise<string[]> {
  const allIngredients = new Set<string>()
  
  meals.forEach(meal => {
    meal.ingredients.forEach(ingredient => {
      // Clean and standardize ingredient names
      const cleaned = ingredient
        .trim()
        .toLowerCase()
        // Remove quantities and measurements
        .replace(/\d+\s*(г|кг|мл|л|ш|дэмж)/gi, '')
        .trim()
      
      if (cleaned.length > 0) {
        allIngredients.add(cleaned)
      }
    })
  })
  
  return Array.from(allIngredients).sort()
}

// Main execution
async function main() {
  try {
    console.log('🍽️  Starting meal parsing process...')
    
    const meals = await parseMealsExcel()
    const ingredients = await extractIngredientsList(meals)
    
    // Save parsed meals to JSON file
    const mealsOutput = join(process.cwd(), 'data', 'parsed-meals.json')
    writeFileSync(mealsOutput, JSON.stringify(meals, null, 2), 'utf-8')
    console.log(`💾 Saved ${meals.length} meals to ${mealsOutput}`)
    
    // Save ingredients list for your reference
    const ingredientsOutput = join(process.cwd(), 'data', 'ingredients-list.json')
    writeFileSync(ingredientsOutput, JSON.stringify(ingredients, null, 2), 'utf-8')
    console.log(`📝 Saved ${ingredients.length} unique ingredients to ${ingredientsOutput}`)
    
    // Create a sample for review
    const sampleMeals = meals.slice(0, 3)
    const sampleOutput = join(process.cwd(), 'data', 'meals-sample.json')
    writeFileSync(sampleOutput, JSON.stringify(sampleMeals, null, 2), 'utf-8')
    console.log(`🔍 Created sample file with 3 meals: ${sampleOutput}`)
    
    console.log('\n✨ Parsing complete! Next steps:')
    console.log('1. Review the sample file to ensure parsing accuracy')
    console.log('2. Provide meal images for the recipes')
    console.log('3. Add ingredient images and data')
    console.log('4. Run the Firestore import script')
    
  } catch (error) {
    console.error('💥 Parsing failed:', error)
    process.exit(1)
  }
}

// Always run when executed
main().catch(console.error)

export { parseMealsExcel, extractIngredientsList, type ParsedMeal }