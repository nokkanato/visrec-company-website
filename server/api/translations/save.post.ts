import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { page, section, key, enValue, thValue } = body

        if (!page || !section || !key) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing required fields: page, section, key'
            })
        }

        // Paths to the JSON files
        const enPath = join(process.cwd(), 'i18n', 'locales', 'en.json')
        const thPath = join(process.cwd(), 'i18n', 'locales', 'th.json')

        // Read current JSON files
        const enData = await readFile(enPath, 'utf-8')
        const thData = await readFile(thPath, 'utf-8')

        const enMessages: any = JSON.parse(enData)
        const thMessages: any = JSON.parse(thData)

        // Update the specific translation
        if (!enMessages[page]) enMessages[page] = {}
        if (!enMessages[page][section]) enMessages[page][section] = {}
        enMessages[page][section][key] = enValue

        if (!thMessages[page]) thMessages[page] = {}
        if (!thMessages[page][section]) thMessages[page][section] = {}
        thMessages[page][section][key] = thValue

        // Write back to files
        await writeFile(enPath, JSON.stringify(enMessages, null, 2), 'utf-8')
        await writeFile(thPath, JSON.stringify(thMessages, null, 2), 'utf-8')

        return {
            success: true,
            message: 'Translation saved successfully'
        }
    } catch (error) {
        console.error('Error saving translation:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to save translation'
        })
    }
})
