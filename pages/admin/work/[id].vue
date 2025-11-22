<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { doc, getDoc, setDoc, updateDoc, collection } from 'firebase/firestore'
import { ref as storageRef, listAll, getDownloadURL, uploadBytes } from 'firebase/storage'

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const route = useRoute()
const localePath = useLocalePath()
const router = useRouter()
const { $db, $storage } = useNuxtApp()

const isNew = route.params.id === 'new'
const id = route.params.id

const loading = ref(false)
const saving = ref(false)
const geminiLoading = ref(false)
const showGeminiModal = ref(false)
const geminiPrompt = ref('')

// Media Library
const showMediaLibrary = ref(false)
const mediaImages = ref([])
const mediaLoading = ref(false)
const selectingForCover = ref(false) // Track if selecting for cover image or editor
const selectingForGallery = ref(false) // Track if selecting for gallery
const multiSelectMode = ref(false) // Track if in multi-select mode
const selectedImages = ref([]) // Track selected images in multi-select mode

// Preview
const showPreview = ref(false)
const previewDevice = ref('desktop') // 'desktop' or 'mobile'
const previewLanguage = ref('en')

// Bilingual Support
const currentLanguage = ref('en') // 'en' or 'th'

const form = ref({
  title: '',
  slug: '',
  categories: [], // Changed from single category to array
  status: 'Draft',
  coverImage: '',
  gallery: [],
  videoUrl: '',
  videoType: '',
  content: {
    en: '',
    th: ''
  },
  seo: {
    en: {
      title: '',
      description: ''
    },
    th: {
      title: '',
      description: ''
    }
  }
})

// Available categories
const availableCategories = ['Content', 'Advertisement', 'Music Video', 'CSR', 'Internal']

// Generate URL-safe slug from title
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

// Validate slug format
const isValidSlug = computed(() => {
  if (!form.value.slug) return true // Empty is okay, will be auto-generated
  // Only allow lowercase letters, numbers, and hyphens
  // Must not start or end with hyphen
  const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/
  return slugPattern.test(form.value.slug)
})

const slugError = computed(() => {
  if (!form.value.slug) return ''
  if (!isValidSlug.value) {
    return 'Slug must contain only lowercase letters, numbers, and hyphens. Cannot start or end with hyphen.'
  }
  return ''
})

// Auto-generate slug when title changes
watch(() => form.value.title, (newTitle) => {
  // Only auto-generate if slug is empty or matches the old title's slug
  if (!form.value.slug || form.value.slug === generateSlug(oldTitle.value)) {
    form.value.slug = generateSlug(newTitle)
  }
  oldTitle.value = newTitle
})

const oldTitle = ref('')

// Detect video type from URL
const detectVideoType = (url) => {
  if (!url) return ''
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('vimeo.com')) return 'vimeo'
  if (url.includes('facebook.com') || url.includes('fb.watch')) return 'facebook'
  return 'other'
}

// Watch video URL to auto-detect type
watch(() => form.value.videoUrl, (newUrl) => {
  if (newUrl) {
    form.value.videoType = detectVideoType(newUrl)
  } else {
    form.value.videoType = ''
  }
})

// Tiptap Editor with drag-drop support
const editor = useEditor({
  content: '',
  extensions: [
    StarterKit,
    Image.configure({
      inline: true,
      allowBase64: true,
    }),
  ],
  onUpdate: ({ editor }) => {
    // Update the content for the CURRENT language
    form.value.content[currentLanguage.value] = editor.getHTML()
  },
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 border rounded-md',
    },
    handleDrop: (view, event, slice, moved) => {
      if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
        const file = event.dataTransfer.files[0]
        
        // Only handle image files
        if (file.type.startsWith('image/')) {
          event.preventDefault()
          
          const reader = new FileReader()
          reader.onload = (e) => {
            const { schema } = view.state
            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
            
            const node = schema.nodes.image.create({ src: e.target.result })
            const transaction = view.state.tr.insert(coordinates.pos, node)
            view.dispatch(transaction)
          }
          reader.readAsDataURL(file)
          
          return true
        }
      }
      return false
    },
  },
})

// Watch for language changes to swap editor content
watch(currentLanguage, (newLang) => {
  if (editor.value) {
    const content = form.value.content[newLang] || ''
    editor.value.commands.setContent(content)
  }
})

// Fetch Data
onMounted(async () => {
  if (!isNew) {
    loading.value = true
    try {
      const docRef = doc($db, 'work', id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        
        // Handle legacy content (string) vs new content (object)
        let contentObj = { en: '', th: '' }
        if (typeof data.content === 'string') {
          contentObj.en = data.content
        } else if (typeof data.content === 'object' && data.content !== null) {
          contentObj = { ...contentObj, ...data.content }
        }

        form.value = { 
          ...data,
          content: contentObj,
          gallery: data.gallery || [], // Handle legacy items without gallery
          slug: data.slug || generateSlug(data.title || ''), // Generate slug if missing
          categories: data.categories || (data.category ? [data.category] : []), // Handle legacy single category
          seo: data.seo || { en: { title: '', description: '' }, th: { title: '', description: '' } } // Handle legacy items without SEO
        }
        
        // Set editor content for initial language
        if (editor.value) {
          editor.value.commands.setContent(form.value.content[currentLanguage.value])
        }
      } else {
        alert('Work not found!')
        router.push(localePath('/admin/work'))
      }
    } catch (e) {
      console.error('Error fetching work:', e)
      alert('Error loading work item.')
    } finally {
      loading.value = false
    }
  }
})

// Save Work
const saveWork = async () => {
  saving.value = true
  try {
    const workData = {
      ...form.value,
      updatedAt: new Date().toISOString()
    }

    if (isNew) {
      workData.createdAt = new Date().toISOString()
      // Create new doc with auto-ID
      const newDocRef = doc(collection($db, 'work'))
      await setDoc(newDocRef, workData)
    } else {
      const docRef = doc($db, 'work', id)
      await updateDoc(docRef, workData)
    }
    
    alert('Work saved successfully!')
    router.push(localePath('/admin/work'))
  } catch (e) {
    console.error('Error saving work:', e)
    alert('Failed to save work.')
  } finally {
    saving.value = false
  }
}

// Gemini Integration
const askGemini = async () => {
  if (!geminiPrompt.value) return
  
  geminiLoading.value = true
  try {
    // Get current editor text as context
    const context = editor.value?.getText() || ''
    
    const { text } = await $fetch('/api/gemini', {
      method: 'POST',
      body: {
        prompt: geminiPrompt.value,
        context: context.slice(0, 1000) // Limit context length
      }
    })
    
    // Insert generated text into editor
    editor.value?.commands.insertContent(text)
    
    geminiPrompt.value = ''
    showGeminiModal.value = false
  } catch (e) {
    console.error('Gemini Error:', e)
    alert('Failed to generate content. Check API Key.')
  } finally {
    geminiLoading.value = false
  }
}

// Generate SEO metadata with Gemini
const generateSEO = async () => {
  if (!form.value.title) {
    alert('Please add a title first')
    return
  }
  
  geminiLoading.value = true
  try {
    const context = editor.value?.getText() || ''
    const categories = form.value.categories.join(', ') || 'creative work'
    const language = currentLanguage.value === 'th' ? 'Thai' : 'English'
    
    const prompt = `Generate SEO metadata in ${language} for a work portfolio item:

Title: ${form.value.title}
Categories: ${categories}
Content: ${context.slice(0, 500)}

Please provide:
1. A compelling SEO title (50-60 characters)
2. An engaging meta description (150-160 characters)

Format your response as:
TITLE: [your title]
DESCRIPTION: [your description]`
    
    const { text } = await $fetch('/api/gemini', {
      method: 'POST',
      body: {
        prompt: prompt,
        context: ''
      }
    })
    
    // Parse the response
    const titleMatch = text.match(/TITLE:\s*(.+)/i)
    const descMatch = text.match(/DESCRIPTION:\s*(.+)/i)
    
    if (titleMatch) {
      form.value.seo[currentLanguage.value].title = titleMatch[1].trim()
    }
    if (descMatch) {
      form.value.seo[currentLanguage.value].description = descMatch[1].trim()
    }
    
    if (!titleMatch && !descMatch) {
      // Fallback: use the raw text
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length >= 2) {
        form.value.seo[currentLanguage.value].title = lines[0].trim().slice(0, 70)
        form.value.seo[currentLanguage.value].description = lines[1].trim().slice(0, 200)
      }
    }
  } catch (e) {
    console.error('Gemini Error:', e)
    alert('Failed to generate SEO metadata. Check API Key.')
  } finally {
    geminiLoading.value = false
  }
}

// Generate slug with Gemini
const generateSlugWithGemini = async () => {
  if (!form.value.title) {
    alert('Please add a title first')
    return
  }
  
  geminiLoading.value = true
  try {
    const context = editor.value?.getText() || ''
    const categories = form.value.categories.join(', ') || 'creative work'
    
    const prompt = `Create a short, SEO-friendly URL slug for this work portfolio item:

Title: ${form.value.title}
Categories: ${categories}
Content: ${context.slice(0, 300)}

Rules:
- Use only lowercase letters, numbers, and hyphens
- Keep it short (3-5 words max)
- Make it descriptive and memorable
- No special characters or spaces

Provide ONLY the slug, nothing else.`
    
    const { text } = await $fetch('/api/gemini', {
      method: 'POST',
      body: {
        prompt: prompt,
        context: ''
      }
    })
    
    // Clean the response and apply slug rules
    let suggestedSlug = text.trim().toLowerCase()
    suggestedSlug = generateSlug(suggestedSlug) // Apply our slug sanitization
    
    if (suggestedSlug) {
      form.value.slug = suggestedSlug
    }
  } catch (e) {
    console.error('Gemini Error:', e)
    alert('Failed to generate slug. Check API Key.')
  } finally {
    geminiLoading.value = false
  }
}

// Load Media Library images recursively
const loadMediaLibrary = async () => {
  mediaLoading.value = true
  try {
    const allImages = []
    
    // Recursive function to load images from a path
    const loadImagesFromPath = async (path) => {
      const listRef = storageRef($storage, path)
      const result = await listAll(listRef)
      
      // Load images from current path
      const imagePromises = result.items.map(async (itemRef) => {
        // Skip .keep files
        if (itemRef.name === '.keep') return null
        
        const url = await getDownloadURL(itemRef)
        return {
          name: itemRef.name,
          url: url,
          path: itemRef.fullPath,
          folder: path.replace('images/', '') || 'Root'
        }
      })
      
      const images = await Promise.all(imagePromises)
      allImages.push(...images.filter(img => img !== null))
      
      // Recursively load from subfolders
      const folderPromises = result.prefixes.map(folderRef => 
        loadImagesFromPath(folderRef.fullPath)
      )
      await Promise.all(folderPromises)
    }
    
    await loadImagesFromPath('images')
    mediaImages.value = allImages
  } catch (error) {
    console.error('Error loading media library:', error)
    alert('Failed to load media library.')
  } finally {
    mediaLoading.value = false
  }
}

// Open Media Library
const openMediaLibrary = (forCover = false, forGallery = false) => {
  selectingForCover.value = forCover
  selectingForGallery.value = forGallery
  multiSelectMode.value = false
  selectedImages.value = []
  showMediaLibrary.value = true
  loadMediaLibrary()
}

// Insert image from Media Library (single selection)
const insertImageFromLibrary = (imageUrl) => {
  if (multiSelectMode.value) {
    // In multi-select mode, toggle selection instead
    toggleImageSelection(imageUrl)
    return
  }
  
  if (selectingForCover.value) {
    // Set as cover image
    form.value.coverImage = imageUrl
  } else if (selectingForGallery.value) {
    // Add to gallery
    if (!form.value.gallery.includes(imageUrl)) {
      form.value.gallery.push(imageUrl)
    }
  } else {
    // Insert into editor
    if (editor.value) {
      editor.value.chain().focus().setImage({ src: imageUrl }).run()
    }
  }
  showMediaLibrary.value = false
}

// Toggle image selection in multi-select mode
const toggleImageSelection = (imageUrl) => {
  const index = selectedImages.value.indexOf(imageUrl)
  if (index > -1) {
    selectedImages.value.splice(index, 1)
  } else {
    selectedImages.value.push(imageUrl)
  }
}

// Add selected images to gallery
const addSelectedToGallery = () => {
  selectedImages.value.forEach(imageUrl => {
    if (!form.value.gallery.includes(imageUrl)) {
      form.value.gallery.push(imageUrl)
    }
  })
  showMediaLibrary.value = false
  multiSelectMode.value = false
  selectedImages.value = []
}

// Cancel multi-select mode
const cancelMultiSelect = () => {
  multiSelectMode.value = false
  selectedImages.value = []
}

// Remove image from gallery
const removeFromGallery = (index) => {
  form.value.gallery.splice(index, 1)
}

// Upload state
const uploading = ref(false)

// Upload image to Firebase Storage
const uploadImage = async (file) => {
  if (!file || !file.type.startsWith('image/')) {
    alert('Please select an image file')
    return
  }

  uploading.value = true
  try {
    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name}`
    const imageRef = storageRef($storage, `images/${fileName}`)
    
    await uploadBytes(imageRef, file)
    
    // Reload media library
    await loadMediaLibrary()
    
    alert('Image uploaded successfully!')
  } catch (error) {
    console.error('Error uploading image:', error)
    alert('Failed to upload image.')
  } finally {
    uploading.value = false
  }
}

// Handle file input
const handleFileInput = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadImage(file)
  }
}

// Handle drag-drop in modal
const handleModalDrop = (event) => {
  event.preventDefault()
  const file = event.dataTransfer.files[0]
  if (file) {
    uploadImage(file)
  }
}

const handleModalDragOver = (event) => {
  event.preventDefault()
}

// Add Image to Editor (URL prompt - kept for backward compatibility)
const addImageToEditor = () => {
  const url = prompt('Enter Image URL:')
  if (url) {
    editor.value?.chain().focus().setImage({ src: url }).run()
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto pb-20">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">{{ isNew ? 'Create New Work' : 'Edit Work' }}</h1>
      <div class="flex gap-3">
        <NuxtLink :to="localePath('/admin/work')" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors">
          Cancel
        </NuxtLink>
        <button 
          @click="showPreview = true"
          class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded transition-colors flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview
        </button>
        <button 
          @click="saveWork" 
          :class="[
            'font-bold py-2 px-6 rounded transition-colors flex items-center',
            saving || slugError
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          ]"
          :disabled="saving || !!slugError"
        >
          <span v-if="saving" class="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></span>
          {{ isNew ? 'Create' : 'Update' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-500">Loading...</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Editor Column -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Title -->
        <div class="bg-white shadow rounded-lg p-6">
          <label class="block text-gray-700 text-sm font-bold mb-2">Title</label>
          <input 
            v-model="form.title"
            class="w-full text-xl text-gray-800 font-bold border-b-2 border-gray-200 focus:border-blue-500 outline-none py-2 px-1 transition-colors" 
            placeholder="Project Title"
          >
        </div>

        <!-- Slug -->
        <div class="bg-white shadow rounded-lg p-6">
          <div class="flex justify-between items-center mb-2">
            <label class="block text-gray-700 text-sm font-bold">URL Slug</label>
            <span class="text-xs text-gray-500">Auto-generated from title</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-gray-500">/work/</span>
            <input 
              v-model="form.slug"
              :class="[
                'flex-1 text-gray-800 border-b-2 outline-none py-2 px-1 transition-colors font-mono',
                slugError 
                  ? 'border-red-500 focus:border-red-600' 
                  : 'border-gray-200 focus:border-blue-500'
              ]"
              placeholder="project-slug"
            >
            <!-- Validation icon -->
            <svg 
              v-if="form.slug && !slugError" 
              class="w-5 h-5 text-green-500 flex-shrink-0" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg 
              v-if="slugError" 
              class="w-5 h-5 text-red-500 flex-shrink-0" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            
            <!-- Generate with Gemini button -->
            <button
              @click="generateSlugWithGemini"
              :disabled="geminiLoading || !form.title"
              class="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-1 rounded flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              title="Generate slug with Gemini AI"
            >
              <svg v-if="!geminiLoading" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span v-if="geminiLoading" class="animate-spin h-3 w-3 mr-1 border-b-2 border-purple-700 rounded-full"></span>
              AI
            </button>
          </div>
          
          <!-- Error message -->
          <p v-if="slugError" class="text-xs text-red-600 mt-2 flex items-start gap-1">
            <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ slugError }}</span>
          </p>
          
          <!-- Help text -->
          <p v-else class="text-xs text-gray-500 mt-2">
            💡 This will be the URL for your work. Edit manually if needed.
          </p>
        </div>

        <!-- Video URL -->
        <div class="bg-white shadow rounded-lg p-6">
          <div class="flex justify-between items-center mb-2">
            <label class="block text-gray-700 text-sm font-bold">Video URL (Optional)</label>
            <span v-if="form.videoType" class="text-xs font-bold px-2 py-1 rounded bg-blue-100 text-blue-800 uppercase">
              {{ form.videoType }}
            </span>
          </div>
          <input 
            v-model="form.videoUrl"
            class="w-full text-gray-800 border-b-2 border-gray-200 focus:border-blue-500 outline-none py-2 px-1 transition-colors" 
            placeholder="https://youtube.com/watch?v=..."
          >
          <p class="text-xs text-gray-500 mt-2">
            Supports YouTube, Vimeo, and Facebook videos.
          </p>
        </div>

        <!-- Editor -->
        <div class="bg-white shadow rounded-lg p-6">
          <div class="flex justify-between items-center mb-4 border-b pb-2">
            <div class="flex items-center gap-4">
              <label class="text-gray-700 text-sm font-bold">Content</label>
              <!-- Language Tabs -->
              <div class="flex bg-gray-100 rounded p-1">
                <button 
                  @click="currentLanguage = 'en'"
                  :class="currentLanguage === 'en' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'"
                  class="px-3 py-1 text-sm font-medium rounded transition-all"
                >
                  English
                </button>
                <button 
                  @click="currentLanguage = 'th'"
                  :class="currentLanguage === 'th' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'"
                  class="px-3 py-1 text-sm font-medium rounded transition-all"
                >
                  Thai
                </button>
              </div>
            </div>

            <div class="flex gap-2">
              <button 
                @click="openMediaLibrary"
                class="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Add Image
              </button>
              <button 
                @click="showGeminiModal = true"
                class="text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Ask Gemini
              </button>
            </div>
          </div>
          
          <!-- Tiptap Toolbar (Basic) -->
          <div v-if="editor" class="text-gray-800 flex flex-wrap gap-2 mb-4 border-b pb-2">
            <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'bg-gray-200': editor.isActive('bold') }" class="p-1 rounded hover:bg-gray-100">Bold</button>
            <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'bg-gray-200': editor.isActive('italic') }" class="p-1 rounded hover:bg-gray-100">Italic</button>
            <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'bg-gray-200': editor.isActive('heading', { level: 2 }) }" class="p-1 rounded hover:bg-gray-100">H2</button>
            <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'bg-gray-200': editor.isActive('bulletList') }" class="p-1 rounded hover:bg-gray-100">List</button>
          </div>

          <editor-content class="text-gray-800" :editor="editor" />
        </div>

        <!-- SEO Section -->
        <div class="bg-white shadow rounded-lg p-6">
          <div class="flex justify-between items-center mb-4 border-b pb-2">
            <div class="flex items-center gap-4">
              <label class="text-gray-700 text-sm font-bold">SEO Metadata</label>
              <!-- Language Tabs -->
              <div class="flex bg-gray-100 rounded p-1">
                <button 
                  @click="currentLanguage = 'en'"
                  :class="currentLanguage === 'en' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'"
                  class="px-3 py-1 text-sm font-medium rounded transition-all"
                >
                  English
                </button>
                <button 
                  @click="currentLanguage = 'th'"
                  :class="currentLanguage === 'th' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'"
                  class="px-3 py-1 text-sm font-medium rounded transition-all"
                >
                  Thai
                </button>
              </div>
            </div>
            
            <!-- Generate with Gemini button -->
            <button 
              @click="generateSEO"
              :disabled="geminiLoading || !form.title"
              class="text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="!geminiLoading" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span v-if="geminiLoading" class="animate-spin h-4 w-4 mr-1 border-b-2 border-purple-700 rounded-full"></span>
              {{ geminiLoading ? 'Generating...' : 'Generate with Gemini' }}
            </button>
          </div>

          <!-- SEO Title -->
          <div class="mb-4">
            <div class="flex justify-between items-center mb-2">
              <label class="block text-gray-700 text-sm font-bold">Meta Title</label>
              <span class="text-xs" :class="form.seo[currentLanguage].title.length > 60 ? 'text-red-600' : 'text-gray-500'">
                {{ form.seo[currentLanguage].title.length }} / 60
              </span>
            </div>
            <input 
              v-model="form.seo[currentLanguage].title"
              class="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 focus:outline-none focus:border-blue-500"
              placeholder="SEO title for search results"
              maxlength="70"
            >
            <p class="text-xs text-gray-500 mt-1">
              Recommended: 50-60 characters. Leave empty to use work title.
            </p>
          </div>

          <!-- SEO Description -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="block text-gray-700 text-sm font-bold">Meta Description</label>
              <span class="text-xs" :class="form.seo[currentLanguage].description.length > 160 ? 'text-red-600' : 'text-gray-500'">
                {{ form.seo[currentLanguage].description.length }} / 160
              </span>
            </div>
            <textarea 
              v-model="form.seo[currentLanguage].description"
              class="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 focus:outline-none focus:border-blue-500 h-24 resize-none"
              placeholder="Brief description for search results and social sharing"
              maxlength="200"
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">
              Recommended: 150-160 characters. This appears in search results and social shares.
            </p>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Status & Category -->
        <div class="bg-white text-gray-800 shadow rounded-lg p-6">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Status</label>
            <select 
              v-model="form.status"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-3">Categories</label>
            <div class="space-y-2">
              <label 
                v-for="category in availableCategories" 
                :key="category"
                class="flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer hover:bg-gray-50"
                :class="form.categories.includes(category) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
              >
                <input 
                  type="checkbox"
                  :value="category"
                  v-model="form.categories"
                  class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                <span class="font-medium text-gray-700">{{ category }}</span>
              </label>
            </div>
            <p class="text-xs text-gray-500 mt-2">
              Select one or more categories
            </p>
          </div>
        </div>

        <!-- Cover Image -->
        <div class="bg-white text-gray-800 shadow rounded-lg p-6">
          <label class="block text-gray-700 text-sm font-bold mb-2">Cover Image</label>
          <div v-if="form.coverImage" class="mb-3 rounded-lg overflow-hidden border">
            <img :src="form.coverImage" class="w-full h-40 object-cover">
          </div>
          <div class="flex gap-2">
            <input 
              v-model="form.coverImage"
              class="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="Image URL"
            >
            <button 
              @click="openMediaLibrary(true)"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Browse Library
            </button>
          </div>
          <a 
            :href="localePath('/admin/media')" 
            target="_blank"
            class="mt-2 block text-center text-sm text-blue-600 hover:underline"
          >
            Open Media Library
          </a>
        </div>

        <!-- Gallery -->
        <div class="bg-white text-gray-800 shadow rounded-lg p-6">
          <div class="flex justify-between items-center mb-3">
            <label class="block text-gray-700 text-sm font-bold">Gallery</label>
            <button 
              @click="openMediaLibrary(false, true)"
              class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add to Gallery
            </button>
          </div>
          
          <!-- Gallery Grid -->
          <div v-if="form.gallery.length === 0" class="text-center py-8 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            <svg class="mx-auto h-12 w-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>No gallery images yet</p>
            <p class="text-xs mt-1">Click "Add to Gallery" to start</p>
          </div>
          <div v-else class="grid grid-cols-2 gap-3">
            <div 
              v-for="(imageUrl, index) in form.gallery" 
              :key="index"
              class="relative group rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all"
            >
              <img 
                :src="imageUrl" 
                :alt="`Gallery image ${index + 1}`"
                class="w-full h-24 object-cover"
              >
              <button
                @click="removeFromGallery(index)"
                class="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove from gallery"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Media Library Modal -->
    <div v-if="showMediaLibrary" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-4">
            <h3 class="text-lg font-bold text-gray-800">Media Library</h3>
            
            <!-- Multi-select toggle (only show for gallery selection) -->
            <button 
              v-if="selectingForGallery && !multiSelectMode"
              @click="multiSelectMode = true"
              class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Select Multiple
            </button>
            
            <!-- Selection counter -->
            <div v-if="multiSelectMode" class="bg-blue-100 text-blue-800 px-3 py-1.5 rounded text-sm font-medium">
              {{ selectedImages.length }} selected
            </div>
          </div>
          
          <button 
            @click="showMediaLibrary = false" 
            class="text-gray-500 hover:text-gray-700"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="mediaLoading || uploading" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p class="mt-4 text-gray-600">{{ uploading ? 'Uploading...' : 'Loading...' }}</p>
          </div>
        </div>

        <div v-else class="flex-1 overflow-y-auto">
          <!-- Upload Zone -->
          <div 
            @drop="handleModalDrop"
            @dragover="handleModalDragOver"
            class="mb-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
            @click="$refs.fileInput.click()"
          >
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p class="mt-2 text-sm text-gray-600">
              <span class="font-semibold text-blue-600">Click to upload</span> or drag and drop
            </p>
            <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            <input 
              ref="fileInput" 
              type="file" 
              accept="image/*" 
              @change="handleFileInput"
              class="hidden"
            >
          </div>

          <!-- Images Grid -->
          <div v-if="mediaImages.length === 0" class="text-center py-12 text-gray-500">
            No images yet. Upload your first image above!
          </div>
          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div 
              v-for="image in mediaImages" 
              :key="image.path"
              @click="insertImageFromLibrary(image.url)"
              :class="[
                'relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all',
                multiSelectMode && selectedImages.includes(image.url) 
                  ? 'border-blue-500 ring-2 ring-blue-300' 
                  : 'border-transparent hover:border-blue-500'
              ]"
            >
              <img 
                :src="image.url" 
                :alt="image.name"
                :class="[
                  'w-full h-32 object-cover transition-opacity',
                  selectingForGallery && form.gallery.includes(image.url) ? 'opacity-50' : ''
                ]"
              >
              
              <!-- Already Added Badge -->
              <div 
                v-if="selectingForGallery && form.gallery.includes(image.url)" 
                class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 z-20"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Already Added
              </div>
              
              <!-- Checkbox for multi-select mode -->
              <div 
                v-if="multiSelectMode" 
                class="absolute top-2 right-2 z-10"
                @click.stop="toggleImageSelection(image.url)"
              >
                <div 
                  :class="[
                    'w-6 h-6 rounded border-2 flex items-center justify-center transition-all',
                    selectedImages.includes(image.url)
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white border-gray-300'
                  ]"
                >
                  <svg 
                    v-if="selectedImages.includes(image.url)"
                    class="w-4 h-4 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <!-- Folder badge -->
              <div v-if="image.folder !== 'Root'" class="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded z-10">
                {{ image.folder }}
              </div>
              
              <!-- Hover overlay (only show when not in multi-select mode) -->
              <div 
                v-if="!multiSelectMode"
                class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center"
              >
                <svg class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p class="text-xs text-gray-600 p-2 truncate">{{ image.name }}</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-4 pt-4 border-t">
          <!-- Multi-select mode actions -->
          <div v-if="multiSelectMode" class="flex justify-between items-center">
            <p class="text-sm text-gray-600">
              Select images to add to gallery
            </p>
            <div class="flex gap-3">
              <button
                @click="cancelMultiSelect"
                class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                @click="addSelectedToGallery"
                :disabled="selectedImages.length === 0"
                :class="[
                  'px-4 py-2 rounded transition-colors font-medium',
                  selectedImages.length > 0
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                ]"
              >
                Add {{ selectedImages.length > 0 ? `${selectedImages.length}` : '' }} to Gallery
              </button>
            </div>
          </div>
          
          <!-- Normal mode tip -->
          <p v-else class="text-sm text-gray-500">
            💡 Tip: You can also drag and drop images directly into the editor!
          </p>
        </div>
      </div>
    </div>

    <!-- Gemini Modal -->
    <div v-if="showGeminiModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-bold mb-4 flex items-center text-purple-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Ask Gemini AI
        </h3>
        <p class="text-sm text-gray-600 mb-4">Describe what you want to write. Gemini will generate content based on your prompt and existing text.</p>
        
        <textarea 
          v-model="geminiPrompt"
          class="w-full border text-gray-800 border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:border-purple-500 h-32"
          placeholder="E.g., Write a compelling introduction for a branding project..."
        ></textarea>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="showGeminiModal = false" 
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="askGemini" 
            class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center"
            :disabled="!geminiPrompt || geminiLoading"
          >
            <span v-if="geminiLoading" class="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></span>
            Generate
          </button>
        </div>
      </div>
    </div>
  </div>
    <!-- Preview Modal -->
    <div v-if="showPreview" class="fixed text-gray-800 inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
        <!-- Preview Header -->
        <div class="flex justify-between items-center p-4 border-b">
          <div class="flex items-center gap-4">
            <h3 class="text-lg font-bold text-gray-800">Preview</h3>
            
            <!-- Device Toggle -->
            <div class="flex bg-gray-100 rounded p-1">
              <button 
                @click="previewDevice = 'desktop'"
                :class="previewDevice === 'desktop' ? 'bg-white shadow text-blue-600' : 'text-gray-500'"
                class="px-3 py-1 text-sm font-medium rounded transition-all flex items-center"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Desktop
              </button>
              <button 
                @click="previewDevice = 'mobile'"
                :class="previewDevice === 'mobile' ? 'bg-white shadow text-blue-600' : 'text-gray-500'"
                class="px-3 py-1 text-sm font-medium rounded transition-all flex items-center"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Mobile
              </button>
            </div>

            <!-- Language Toggle -->
            <div class="flex bg-gray-100 rounded p-1">
              <button 
                @click="previewLanguage = 'en'"
                :class="previewLanguage === 'en' ? 'bg-white shadow text-blue-600' : 'text-gray-500'"
                class="px-3 py-1 text-sm font-medium rounded transition-all"
              >
                EN
              </button>
              <button 
                @click="previewLanguage = 'th'"
                :class="previewLanguage === 'th' ? 'bg-white shadow text-blue-600' : 'text-gray-500'"
                class="px-3 py-1 text-sm font-medium rounded transition-all"
              >
                TH
              </button>
            </div>
          </div>

          <button 
            @click="showPreview = false" 
            class="text-gray-500 hover:text-gray-700"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Preview Content -->
        <div class="flex-1 overflow-auto bg-gray-100 p-8 flex items-start justify-center">
          <div 
            :class="previewDevice === 'mobile' ? 'w-[375px]' : 'w-full max-w-4xl'"
            class="bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300"
          >
            <!-- Cover Image -->
            <div v-if="form.coverImage" class="w-full h-64 overflow-hidden">
              <img :src="form.coverImage" :alt="form.title" class="w-full h-full object-cover">
            </div>

            <!-- Content -->
            <div class="p-8">
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ form.title || 'Untitled Work' }}</h1>
              <div v-if="form.category" class="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mb-6">
                {{ form.category }}
              </div>
              
              <!-- Rendered HTML Content -->
              <div 
                class="prose prose-lg max-w-none"
                v-html="form.content[previewLanguage] || '<p class=\'text-gray-400 italic\'>No content yet...</p>'"
              ></div>
              
              <!-- Gallery -->
              <div v-if="form.gallery.length > 0" class="mt-12">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">Gallery</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div 
                    v-for="(imageUrl, index) in form.gallery" 
                    :key="index"
                    class="rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                  >
                    <img 
                      :src="imageUrl" 
                      :alt="`Gallery image ${index + 1}`"
                      class="w-full h-48 object-cover"
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<style>
/* Basic Prose Mirror Styles for Tiptap */
.ProseMirror {
  outline: none;
}
.ProseMirror p {
  margin-bottom: 1em;
}
.ProseMirror h2 {
  font-size: 1.5em;
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 0.5em;
}
.ProseMirror ul {
  list-style-type: disc;
  padding-left: 1.5em;
  margin-bottom: 1em;
}
.ProseMirror img {
  max-width: 100%;
  border-radius: 0.5rem;
}
</style>
