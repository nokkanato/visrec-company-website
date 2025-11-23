import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { lang, translations } = body

        // Validate language
        if (!['en', 'th'].includes(lang)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid language. Must be "en" or "th"'
            })
        }

        if (!translations || typeof translations !== 'object') {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid translations object'
            })
        }

        // Write to the JSON file
        const filePath = join(process.cwd(), 'i18n', 'locales', `${lang}.json`)
        const jsonString = JSON.stringify(translations, null, 2)

        await writeFile(filePath, jsonString, 'utf-8')

        return {
            success: true,
            message: `Successfully saved ${lang}.json`
        }
    } catch (error: any) {
        console.error('Error saving translation file:', error)
        throw createError({
            statusCode: 500,
            statusMessage: `Failed to save translations: ${error.message}`
        })
    }
})
