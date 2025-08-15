# Vercel AI SDK Documentation

## Overview

This document covers the integration and usage of the Vercel AI SDK within the BeFit Nuxt application.

## Setup

### Installation

```bash
pnpm add ai @ai-sdk/openai
```

### Configuration

Environment variables required:
- `OPENAI_API_KEY` - OpenAI API key for AI model access

## Usage Patterns

### Basic AI Chat Integration

```typescript
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

// Generate nutrition advice
const response = await generateText({
  model: openai('gpt-3.5-turbo'),
  prompt: 'Provide nutrition advice for weight loss'
})
```

### Streaming Responses

```typescript
import { streamText } from 'ai'

// Stream meal recommendations
const { textStream } = await streamText({
  model: openai('gpt-3.5-turbo'),
  prompt: 'Suggest healthy meal ideas for breakfast'
})
```

## Integration with BeFit Features

### Nutrition Analysis
- AI-powered meal logging and macro estimation
- Ingredient recognition from meal descriptions
- Nutritional advice based on user goals

### Personalized Recommendations
- Workout suggestions based on user preferences
- Meal planning with dietary restrictions
- Progress tracking insights

## Best Practices

1. **Error Handling**: Always wrap AI calls in try-catch blocks
2. **Rate Limiting**: Implement proper rate limiting for API calls
3. **User Feedback**: Provide loading states and error messages
4. **Data Privacy**: Ensure user data is handled securely

## Examples

### Meal Analysis Component

```vue
<script setup lang="ts">
const { data, pending, error } = await useLazyAsyncData('analyze-meal', () =>
  $fetch('/api/ai/analyze-meal', {
    method: 'POST',
    body: { description: mealDescription.value }
  })
)
</script>
```

### API Route Handler

```typescript
// server/api/ai/analyze-meal.post.ts
export default defineEventHandler(async (event) => {
  const { description } = await readBody(event)
  
  const response = await generateText({
    model: openai('gpt-3.5-turbo'),
    prompt: `Analyze this meal: ${description}`
  })
  
  return { analysis: response.text }
})
```