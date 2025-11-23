import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const lang = query.lang as string || 'en'

    // Validate language
    if (!['en', 'th'].includes(lang)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid language. Must be "en" or "th"'
        })
    }

    try {
        // Read the raw JSON file
        const filePath = join(process.cwd(), 'i18n', 'locales', `${lang}.json`)
        const rawData = await readFile(filePath, 'utf-8')

        // Parse and return as plain object
        const translations = JSON.parse(rawData)

        return {
            lang,
            translations
        }
    } catch (error: any) {
        console.error('Error reading translation file:', error)
        throw createError({
            statusCode: 500,
            statusMessage: `Failed to read ${lang}.json: ${error.message}`
        })
    }
})
