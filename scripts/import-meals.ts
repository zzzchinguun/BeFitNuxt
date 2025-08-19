import { readFileSync } from 'fs'
import { join } from 'path'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Firebase Admin initialization
function initializeFirebaseAdmin() {
  try {
    // Initialize with environment variables
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    })
    
    console.log('✅ Firebase Admin initialized')
    return getFirestore()
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error)
    throw error
  }
}

async function importMealsToFirestore() {
  try {
    console.log('🍽️  Starting Firestore import process...')
    
    // Initialize Firebase Admin
    const db = initializeFirebaseAdmin()
    
    // Read parsed meals data
    const mealsPath = join(process.cwd(), 'data', 'parsed-meals.json')
    console.log('📖 Reading meals from:', mealsPath)
    
    const mealsData = JSON.parse(readFileSync(mealsPath, 'utf-8'))
    console.log(`📋 Found ${mealsData.length} meals to import`)
    
    // Convert to Firestore format
    const firestoreMeals = mealsData.map((meal: any) => ({
      id: meal.id,
      name: meal.name,
      category: meal.category,
      ingredients: meal.ingredients,
      instructions: meal.instructions,
      macros: meal.macros,
      servingSize: meal.servingSize || 1,
      imageUrl: null, // Will be added later
      estimatedTime: Math.floor(Math.random() * 30) + 15, // Random 15-45 min
      difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
      source: 'database',
      createdAt: new Date(),
      updatedAt: new Date()
    }))
    
    // Batch write to Firestore
    const batchSize = 500 // Firestore batch limit
    const batches = []
    
    for (let i = 0; i < firestoreMeals.length; i += batchSize) {
      const batch = db.batch()
      const batchMeals = firestoreMeals.slice(i, i + batchSize)
      
      batchMeals.forEach(meal => {
        const docRef = db.collection('generated_meals').doc(meal.id)
        batch.set(docRef, meal)
      })
      
      batches.push(batch)
    }
    
    console.log(`📦 Created ${batches.length} batches for import`)
    
    // Execute all batches
    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit()
      console.log(`✅ Batch ${i + 1}/${batches.length} completed`)
    }
    
    console.log('🎉 All meals imported successfully!')
    
    // Import ingredients list
    await importIngredientsToFirestore(db)
    
  } catch (error) {
    console.error('💥 Import failed:', error)
    throw error
  }
}

async function importIngredientsToFirestore(db: any) {
  try {
    console.log('🥕 Starting ingredients import...')
    
    // Read ingredients data
    const ingredientsPath = join(process.cwd(), 'data', 'ingredients-list.json')
    const ingredientsData = JSON.parse(readFileSync(ingredientsPath, 'utf-8'))
    
    console.log(`📝 Found ${ingredientsData.length} ingredients to import`)
    
    // Convert to structured ingredient format
    const structuredIngredients = ingredientsData.map((ingredientName: string, index: number) => {
      // Parse ingredient name to extract quantity and unit
      const cleaned = ingredientName.trim()
      
      // Try to extract amount and unit
      const match = cleaned.match(/^(\d+(?:[.,]\d+)?)\s*([а-яё\w]*)\s+(.+)$/i)
      
      let amount = 1
      let unit = 'ширхэг'
      let name = cleaned
      
      if (match) {
        amount = parseFloat(match[1].replace(',', '.'))
        unit = match[2] || 'ширхэг'
        name = match[3]
      }
      
      // Categorize ingredients
      let category = 'other'
      const nameLower = name.toLowerCase()
      
      if (nameLower.includes('мах') || nameLower.includes('загас') || nameLower.includes('өндөг') || nameLower.includes('уураг')) {
        category = 'protein'
      } else if (nameLower.includes('ногоо') || nameLower.includes('жимс') || nameLower.includes('лууван') || nameLower.includes('гадил')) {
        category = 'vegetables'
      } else if (nameLower.includes('будаа') || nameLower.includes('овъёос') || nameLower.includes('талх') || nameLower.includes('жимс')) {
        category = 'carbs'
      } else if (nameLower.includes('тараг') || nameLower.includes('бяслаг') || nameLower.includes('сүү')) {
        category = 'dairy'
      } else if (nameLower.includes('тос') || nameLower.includes('үр')) {
        category = 'fats'
      }
      
      return {
        id: `ingredient-${index + 1}`,
        name,
        category,
        defaultAmount: amount,
        defaultUnit: unit,
        imageUrl: null, // Will be added later
        nutritionPer100g: null, // Will be added later
        averagePrice: Math.floor(Math.random() * 5000) + 500, // Mock pricing
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    // Batch write ingredients
    const batch = db.batch()
    structuredIngredients.forEach((ingredient: any) => {
      const docRef = db.collection('ingredients').doc(ingredient.id)
      batch.set(docRef, ingredient)
    })
    
    await batch.commit()
    console.log('✅ All ingredients imported successfully!')
    
  } catch (error) {
    console.error('❌ Ingredients import failed:', error)
  }
}

// Main execution
async function main() {
  try {
    await importMealsToFirestore()
    console.log('\n🎊 Import completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Add meal images to your Firebase Storage')
    console.log('2. Add ingredient images and nutritional data')
    console.log('3. Test the meal generation flow')
    
  } catch (error) {
    console.error('💥 Import process failed:', error)
    process.exit(1)
  }
}

// Run if called directly
main().catch(console.error)

export { importMealsToFirestore }