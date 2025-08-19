import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import Papa from 'papaparse'
import { H3Event, getQuery } from 'h3'
import { randomUUID } from 'node:crypto'

type IngredientCsvRow = {
  id?: string
  item_code?: string
  item_name?: string
  item_type?: string
  cat1?: string
  cat2?: string
  cat3?: string
  price?: string
  item_popular?: string | boolean
  image_url?: string
  calories?: string | number
  protein_g?: string | number
  fat_g?: string | number
  carbs_g?: string | number
  sugar_g?: string | number
  fiber_g?: string | number
  sodium_mg?: string | number
}

export type IngredientItem = {
  id: string
  itemCode: string | null
  name: string
  type: string | null
  categoryPath: string[]
  price: string | null
  isPopular: boolean
  imageUrl: string
  calories?: number
  proteinG?: number
  fatG?: number
  carbsG?: number
  sugarG?: number
  fiberG?: number
  sodiumMg?: number
}

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value.trim().toLowerCase() === 'true'
  return false
}

function toNumber(value: unknown): number | undefined {
  if (value == null) return undefined
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return undefined
    const parsed = Number(trimmed.replace(/[^0-9.-]/g, ''))
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

function normalizeImageUrl(url: string): string {
  const trimmed = url.trim()
  // Replace only the /mini/ segment with /medium/
  return trimmed.replace('/mini/', '/medium/')
}

async function loadIngredientsFromCsv(): Promise<IngredientItem[]> {
  const csvPath = join(process.cwd(), 'Untitled spreadsheet - Sheet1.csv')
  const csvContent = await readFile(csvPath, 'utf8')

  const parsed = Papa.parse<IngredientCsvRow>(csvContent, {
    header: true,
    skipEmptyLines: true
  })

  const rows = Array.isArray(parsed.data) ? parsed.data : []

  const items: IngredientItem[] = []
  for (const row of rows) {
    const name = (row.item_name || '').toString().trim()
    const imageUrlRaw = (row.image_url || '').toString().trim()
    if (!name || !imageUrlRaw) continue

    const imageUrl = normalizeImageUrl(imageUrlRaw)

    items.push({
      id: (row.id || '').toString().trim() || randomUUID(),
      itemCode: row.item_code ? row.item_code.toString().trim() : null,
      name,
      type: row.item_type ? row.item_type.toString().trim() : null,
      categoryPath: [row.cat1, row.cat2, row.cat3].filter(Boolean).map(v => v!.toString().trim()),
      price: row.price ? row.price.toString().trim() : null,
      isPopular: toBoolean(row.item_popular),
      imageUrl,
      calories: toNumber(row.calories),
      proteinG: toNumber(row.protein_g),
      fatG: toNumber(row.fat_g),
      carbsG: toNumber(row.carbs_g),
      sugarG: toNumber(row.sugar_g),
      fiberG: toNumber(row.fiber_g),
      sodiumMg: toNumber(row.sodium_mg)
    })
  }

  return items
}

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event)
  const popularOnly = typeof query.popular === 'string' ? query.popular === 'true' : false
  const limit = typeof query.limit === 'string' ? Number(query.limit) : undefined
  const onlyWithImage = typeof query.onlyWithImage === 'string' ? query.onlyWithImage === 'true' : true

  const items = await loadIngredientsFromCsv()

  let filtered = items
  if (onlyWithImage) {
    filtered = filtered.filter(i => !!i.imageUrl)
  }
  if (popularOnly) {
    filtered = filtered.filter(i => i.isPopular)
  }

  // Stable ordering: popular first, then by name
  filtered.sort((a, b) => {
    if (a.isPopular !== b.isPopular) return a.isPopular ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  const limited = typeof limit === 'number' && Number.isFinite(limit) && limit > 0 ? filtered.slice(0, limit) : filtered

  return {
    count: limited.length,
    items: limited
  }
})


