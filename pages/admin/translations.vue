<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
  ssr: false // Disable SSR to prevent hydration mismatch
})

const { mergeLocaleMessage, locale } = useI18n()

// State
const currentLang = ref('en')
const editingState = ref({})
const isLoading = ref(false)
const isSaving = ref(false)
const selectedPage = ref('homepage')
const pages = ['homepage', 'about', 'work', 'services', 'contact', 'nav', 'footer']

// Scroll to page
const scrollToPage = (page) => {
  selectedPage.value = page
  const element = document.getElementById(`page-${page}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// Fetch raw translations from API
const fetchTranslations = async (lang) => {
  isLoading.value = true
  try {
    const response = await $fetch(`/api/translations/load?lang=${lang}`)
    editingState.value = response.translations
    
    // Immediately merge into i18n for live preview
    mergeLocaleMessage(lang, response.translations)
  } catch (error) {
    console.error('Error fetching translations:', error)
    alert('Failed to load translations')
  } finally {
    isLoading.value = false
  }
}

// Watch for changes and update i18n live
watch(editingState, (newState) => {
  mergeLocaleMessage(currentLang.value, newState)
}, { deep: true })

// Save translations to disk
const saveTranslations = async () => {
  isSaving.value = true
  try {
    const response = await $fetch('/api/translations/save-new', {
      method: 'POST',
      body: {
        lang: currentLang.value,
        translations: editingState.value
      }
    })
    
    if (response.success) {
      alert('Translations saved successfully!')
    }
  } catch (error) {
    console.error('Error saving translations:', error)
    alert('Failed to save translations')
  } finally {
    isSaving.value = false
  }
}

// Switch language
const switchLang = async (lang) => {
  currentLang.value = lang
  await fetchTranslations(lang)
}

// Get section content
const getSectionContent = (page, section) => {
  const pageData = editingState.value[page]
  if (!pageData) return []
  
  if (section === 'main') {
    // Flat structure (nav, footer)
    return Object.entries(pageData).map(([key, value]) => ({
      key,
      value: typeof value === 'string' ? value : JSON.stringify(value)
    }))
  } else {
    // Nested structure
    const sectionData = pageData[section]
    if (!sectionData || typeof sectionData !== 'object') return []
    
    return Object.entries(sectionData).map(([key, value]) => ({
      key,
      value: typeof value === 'string' ? value : JSON.stringify(value)
    }))
  }
}

// Get sections for a page
const getSections = (page) => {
  const pageData = editingState.value[page]
  if (!pageData || typeof pageData !== 'object') return []
  
  // Check if it's a flat object
  const isFlat = Object.values(pageData).every(val => typeof val === 'string')
  if (isFlat) return ['main']
  
  // Return all keys that are objects (sections)
  return Object.keys(pageData).filter(key => 
    typeof pageData[key] === 'object' && pageData[key] !== null
  )
}

// Update value
const updateValue = (page, section, key, newValue) => {
  if (section === 'main') {
    editingState.value[page][key] = newValue
  } else {
    if (!editingState.value[page][section]) {
      editingState.value[page][section] = {}
    }
    editingState.value[page][section][key] = newValue
  }
}

// Initialize
onMounted(() => {
  fetchTranslations(currentLang.value)
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-white shadow-sm flex justify-between items-center mb-6 py-4 px-6 -mx-6">
      <h1 class="text-3xl font-bold text-gray-800">Live Translation Editor</h1>
      
      <div class="flex gap-3 items-center">
        <!-- Page Selector -->
        <div class="flex items-center gap-2">
          <label class="text-sm font-semibold text-gray-700">Jump to:</label>
          <select 
            v-model="selectedPage"
            @change="scrollToPage(selectedPage)"
            class="border border-gray-300 text-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="page in pages" :key="page" :value="page" class="capitalize">
              {{ page }}
            </option>
          </select>
        </div>
        
        <!-- Language Switcher -->
        <div class="flex gap-2">
          <button 
            @click="switchLang('en')"
            :class="currentLang === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'"
            class="px-4 py-2 rounded font-semibold"
          >
            EN
          </button>
          <button 
            @click="switchLang('th')"
            :class="currentLang === 'th' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'"
            class="px-4 py-2 rounded font-semibold"
          >
            TH
          </button>
        </div>
        
        <!-- Save Button -->
        <button 
          @click="saveTranslations"
          :disabled="isSaving"
          class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
        >
          {{ isSaving ? 'Saving...' : 'Save to Disk' }}
        </button>
      </div>
    </div>

    <!-- Info Box -->
    <div class="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4">
      <p class="text-blue-700">
        <strong>Live Preview:</strong> Changes update instantly in memory. Click "Save to Disk" to persist changes.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-600">Loading translations...</p>
    </div>

    <!-- Pages -->
    <div v-else class="text-black">
      <div v-for="page in pages" :key="page" :id="`page-${page}`" class="mb-8 scroll-mt-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4 capitalize">{{ page }}</h2>
        
        <!-- Sections -->
        <div v-for="section in getSections(page)" :key="section" class="mb-6 bg-white shadow-md rounded overflow-hidden">
          <div class="bg-gray-100 px-6 py-3 border-b">
            <h3 class="font-semibold text-gray-700 capitalize">{{ section }}</h3>
          </div>
          
          <div class="p-6 space-y-4">
            <div 
              v-for="item in getSectionContent(page, section)" 
              :key="item.key"
              class="border-b border-gray-100 pb-4 last:border-0"
            >
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                {{ item.key }}
              </label>
              <textarea
                :value="item.value"
                @input="updateValue(page, section, item.key, $event.target.value)"
                rows="2"
                class="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
