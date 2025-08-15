import { readFileSync } from 'fs'
import { join } from 'path'
import Papa from 'papaparse'
import { getFirebaseAdminDb } from '~/utils/firebase-admin'

interface CSVRow {
  name: string
  brand?: string
  barcode?: string
  serving_size?: string
  serving_unit?: string
  kcal_per_100g: string
  protein_per_100g: string
  carbs_per_100g: string
  fat_per_100g: string
  categories?: string
}

async function seedNutritionDatabase() {
  try {
    console.log('Starting nutrition database seed...')
    
    const db = getFirebaseAdminDb()
    const csvPath = join(process.cwd(), 'data', 'Extended_Meal_and_Product_Database.csv')
    
    // Check if CSV file exists
    let csvData: string
    try {
      csvData = readFileSync(csvPath, 'utf-8')
    } catch (error) {
      console.log('CSV file not found, creating sample data...')
      csvData = createSampleCSVData()
    }

    // Parse CSV
    const parseResult = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transform: (value: string) => value.trim()
    })

    const rows = parseResult.data as CSVRow[]
    console.log(`Found ${rows.length} items to process`)

    // Process in batches
    const batchSize = 500
    const batch = db.batch()
    let processedCount = 0

    for (const row of rows) {
      if (!row.name || !row.kcal_per_100g) {
        continue // Skip invalid rows
      }

      const mealData = {
        name: row.name,
        brand: row.brand || null,
        barcode: row.barcode || null,
        serving: {
          size: parseFloat(row.serving_size || '100'),
          unit: row.serving_unit || 'g'
        },
        per100g: {
          kcal: parseFloat(row.kcal_per_100g) || 0,
          protein: parseFloat(row.protein_per_100g) || 0,
          carbs: parseFloat(row.carbs_per_100g) || 0,
          fat: parseFloat(row.fat_per_100g) || 0
        },
        categories: row.categories ? row.categories.split(',').map(c => c.trim()) : [],
        source: 'csv_import',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = db.collection('verified_meals').doc()
      batch.set(docRef, mealData)
      processedCount++

      // Commit batch when it reaches the limit
      if (processedCount % batchSize === 0) {
        await batch.commit()
        console.log(`Processed ${processedCount} items...`)
      }
    }

    // Commit remaining items
    if (processedCount % batchSize !== 0) {
      await batch.commit()
    }

    console.log(`Successfully seeded ${processedCount} nutrition items!`)

    // Create app configuration document
    await db.collection('config').doc('app').set({
      latestVersion: '1.0.0',
      forceUpdate: false,
      updatedAt: new Date()
    })

    console.log('Created app configuration')

  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

function createSampleCSVData(): string {
  return `name,brand,barcode,serving_size,serving_unit,kcal_per_100g,protein_per_100g,carbs_per_100g,fat_per_100g,categories
Apple,Fresh,123456789,100,g,52,0.3,14,0.2,Fruits
Banana,Fresh,987654321,100,g,89,1.1,23,0.3,Fruits
Chicken Breast,Generic,,100,g,165,31,0,3.6,Meat
White Rice,Generic,,100,g,130,2.7,28,0.3,Grains
Broccoli,Fresh,,100,g,34,2.8,7,0.4,Vegetables
Whole Milk,Dairy Brand,111222333,100,ml,61,3.2,4.8,3.3,Dairy
Eggs,Farm Fresh,444555666,100,g,155,13,1.1,11,Protein
Salmon,Fresh,,100,g,208,25,0,12,Fish
Oatmeal,Quaker,777888999,100,g,389,16.9,66,6.9,Grains
Greek Yogurt,Chobani,000111222,100,g,59,10,3.6,0.4,Dairy`
}

// Run the seed function
seedNutritionDatabase()