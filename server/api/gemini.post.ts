import { GoogleGenerativeAI } from '@google/generative-ai'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const body = await readBody(event)
    const { prompt, context } = body

    if (!config.geminiApiKey) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Gemini API Key is not configured.'
        })
    }

    try {
        const genAI = new GoogleGenerativeAI(config.geminiApiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

        let fullPrompt = prompt
        if (context) {
            fullPrompt = `Context: ${context}\n\nTask: ${prompt}`
        }

        const result = await model.generateContent(fullPrompt)
        const response = await result.response
        const text = response.text()

        return { text }
    } catch (error: any) {
        console.error('Gemini API Error:', error)

        // Fallback for token limits or quota exceeded
        if (error.message?.includes('429') || error.message?.includes('quota') || error.status === 429) {
            return {
                text: "⚠️ AI Limit Reached: I'm currently unavailable due to high traffic or usage limits. Please try again later or continue writing manually."
            }
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to generate content.'
        })
    }
})
