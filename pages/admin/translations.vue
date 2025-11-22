<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import enMessages from '~/i18n/locales/en.json'
import thMessages from '~/i18n/locales/th.json'

definePageMeta({
  layout: 'admin'
})

const { getLocaleMessage } = useI18n()

// Editing state
const editingKey = ref('')
const editingEN = ref('')
const editingTH = ref('')
const showEditModal = ref(false)

// Available pages
const pages = ['homepage', 'about']

// Get sections for a page
const getSections = (page) => {
  const pageData = enMessages?.[page]
  if (!pageData || typeof pageData !== 'object') return []
  return Object.keys(pageData).filter(key => key.startsWith('section'))
}

// Get section content for both languages
const getSectionContent = (page, section) => {
  const enContent = enMessages?.[page]?.[section] || {}
  const thContent = thMessages?.[page]?.[section] || {}
  
  // Merge keys from both languages
  const allKeys = new Set([...Object.keys(enContent), ...Object.keys(thContent)])
  
  return Array.from(allKeys).map(key => ({
    key,
    en: enContent[key]?.body?.static || enContent[key] || '',
    th: thContent[key]?.body?.static || thContent[key] || ''
  }))
}

// Edit translation
const editingPage = ref('')
const editingSection = ref('')

const editTranslation = (page, section, key, enValue, thValue) => {
  editingPage.value = page
  editingSection.value = section
  editingKey.value = key
  editingEN.value = enValue
  editingTH.value = thValue
  showEditModal.value = true
}

// Save translation
const isSaving = ref(false)
const saveTranslation = async () => {
  try {
    isSaving.value = true
    
    const response = await $fetch('/api/translations/save', {
      method: 'POST',
      body: {
        page: editingPage.value,
        section: editingSection.value,
        key: editingKey.value,
        enValue: editingEN.value,
        thValue: editingTH.value
      }
    })
    
    if (response.success) {
      alert('Translation saved successfully! Please refresh the page to see changes.')
      showEditModal.value = false
      
      // Optionally reload the page to show updated translations
      // window.location.reload()
    }
  } catch (error) {
    console.error('Error saving translation:', error)
    alert('Failed to save translation. Please try again.')
  } finally {
    isSaving.value = false
  }
}

// Export translations as JSON
const exportTranslations = () => {
  const data = {
    en: enMessages,
    th: thMessages
  }
  const dataStr = JSON.stringify(data, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
  
  const exportFileDefaultName = 'translations.json'
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Translation Management</h1>
      <button 
        @click="exportTranslations"
        class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
      >
        Export JSON
      </button>
    </div>

    <!-- Info Box -->
    <div class="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4">
      <p class="text-blue-700">
        <strong>Structure:</strong> Organized by page → section (top to bottom) → element (h1, h2, p, button)
      </p>
    </div>

    <!-- Pages -->
    <div v-for="page in pages" :key="page" class="mb-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-4 capitalize">{{ page }}</h2>
      
      <!-- Sections -->
      <div v-for="section in getSections(page)" :key="section" class="mb-6 bg-white shadow-md rounded overflow-hidden">
        <div class="bg-gray-100 px-6 py-3 border-b">
          <h3 class="font-semibold text-gray-700 capitalize">{{ section }}</h3>
        </div>
        
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="py-2 px-6 text-left text-gray-600 text-sm font-semibold w-24">Element</th>
              <th class="py-2 px-6 text-left text-gray-600 text-sm font-semibold">TH</th>
              <th class="py-2 px-6 text-left text-gray-600 text-sm font-semibold">EN</th>
              <th class="py-2 px-6 text-center text-gray-600 text-sm font-semibold w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="item in getSectionContent(page, section)" 
              :key="item.key"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="py-3 px-6 font-mono text-sm text-blue-600">{{ item.key }}</td>
              <td class="py-3 px-6 text-sm text-gray-700">{{ item.th }}</td>
              <td class="py-3 px-6 text-sm text-gray-700">{{ item.en }}</td>
              <td class="py-3 px-6 text-center">
                <button 
                  @click="editTranslation(page, section, item.key, item.en, item.th)"
                  class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                >
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Modal -->
    <div 
      v-if="showEditModal"
      class="text-black fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showEditModal = false"
    >
      <div class="bg-white rounded-lg p-6 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-4">Edit Translation</h2>
        
        <div class="mb-4">
          <label class="block text-gray-700 font-semibold mb-2">Key</label>
          <input 
            :value="editingKey"
            disabled
            class="w-full border border-gray-300 rounded px-4 py-2 bg-gray-100 font-mono text-sm"
          >
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Thai Column -->
          <div>
            <label class="block text-gray-700 font-semibold mb-2">
              <span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">TH</span>
              Thai
            </label>
            <textarea 
              v-model="editingTH"
              rows="8"
              class="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              :placeholder="editingTH || ''"
            ></textarea>
          </div>

          <!-- English Column -->
          <div>
            <label class="block text-gray-700 font-semibold mb-2">
              <span class="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm">EN</span>
              English
            </label>
            <textarea 
              v-model="editingEN"
              rows="8"
              class="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              :placeholder="editingEN || ''"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <button 
            @click="showEditModal = false"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button 
            @click="saveTranslation"
            class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Save Changes
          </button>
        </div>

        <div class="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-3">
          <p class="text-sm text-yellow-700">
            <strong>Note:</strong> This is a demo. In production, you would need a backend API to persist changes.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
