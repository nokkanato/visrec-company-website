<script setup>
import { ref, onMounted, computed } from 'vue'
import { ref as storageRef, uploadBytes, getDownloadURL, listAll, deleteObject, getMetadata, updateMetadata } from 'firebase/storage'

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

useHead({
  title: 'Media Library - Admin',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

const { $storage } = useNuxtApp()
const uploading = ref(false)
const images = ref([])
const folders = ref([])
const loading = ref(true)
const error = ref(null)
const dragActive = ref(false)
const currentPath = ref('images/')

// Modal States
const showNewFolderModal = ref(false)
const newFolderName = ref('')
const showEditModal = ref(false)
const editingImage = ref(null)
const editForm = ref({
  alt: ''
})

// Computed Breadcrumbs
const breadcrumbs = computed(() => {
  const parts = currentPath.value.split('/').filter(p => p)
  const crumbs = [{ name: 'Root', path: 'images/' }]
  
  let accumulatedPath = 'images/'
  const subParts = parts.slice(1)
  
  subParts.forEach(part => {
    accumulatedPath += `${part}/`
    crumbs.push({ name: part, path: accumulatedPath })
  })
  
  return crumbs
})

// Fetch images and folders
const fetchImages = async () => {
  loading.value = true
  error.value = null
  images.value = []
  folders.value = []
  
  try {
    const listRef = storageRef($storage, currentPath.value)
    const res = await listAll(listRef)
    
    // Process Folders
    folders.value = res.prefixes.map(folderRef => ({
      name: folderRef.name,
      fullPath: folderRef.fullPath,
      path: folderRef.fullPath + '/'
    }))
    
    // Process Files with Metadata
    const promises = res.items.map(async (itemRef) => {
      if (itemRef.name === '.keep') return null
      
      const [url, metadata] = await Promise.all([
        getDownloadURL(itemRef),
        getMetadata(itemRef)
      ])

      return {
        name: itemRef.name,
        fullPath: itemRef.fullPath,
        url: url,
        alt: metadata.customMetadata?.alt || ''
      }
    })
    
    const results = await Promise.all(promises)
    images.value = results.filter(img => img !== null)
    
  } catch (e) {
    console.error('Error fetching images:', e)
    error.value = 'Failed to load images.'
  } finally {
    loading.value = false
  }
}

// Navigate to folder
const navigateTo = (path) => {
  currentPath.value = path
  fetchImages()
}

// Create Folder
const createFolder = async () => {
  if (!newFolderName.value) return
  
  const safeName = newFolderName.value.replace(/[^a-zA-Z0-9-_]/g, '_')
  const newPath = `${currentPath.value}${safeName}/.keep`
  
  try {
    const fileRef = storageRef($storage, newPath)
    await uploadBytes(fileRef, new Blob(['']))
    newFolderName.value = ''
    showNewFolderModal.value = false
    await fetchImages()
  } catch (e) {
    console.error('Error creating folder:', e)
    error.value = 'Failed to create folder.'
  }
}

// Delete Folder
const deleteFolder = async (folder) => {
  if (!confirm(`Are you sure you want to delete folder "${folder.name}" and ALL its contents?`)) return

  loading.value = true
  try {
    await deleteFolderRecursive(folder.fullPath)
    await fetchImages()
  } catch (e) {
    console.error('Error deleting folder:', e)
    error.value = 'Failed to delete folder.'
    loading.value = false
  }
}

const deleteFolderRecursive = async (path) => {
  const folderRef = storageRef($storage, path)
  const res = await listAll(folderRef)
  
  const filePromises = res.items.map(item => deleteObject(item))
  await Promise.all(filePromises)
  
  const folderPromises = res.prefixes.map(prefix => deleteFolderRecursive(prefix.fullPath))
  await Promise.all(folderPromises)
}

// Handle File Upload
const handleFileUpload = async (event) => {
  const files = event.target.files || event.dataTransfer.files
  if (!files.length) return

  uploading.value = true
  error.value = null

  try {
    for (const file of files) {
      const fileRef = storageRef($storage, `${currentPath.value}${Date.now()}_${file.name}`)
      await uploadBytes(fileRef, file)
    }
    await fetchImages()
  } catch (e) {
    console.error('Error uploading file:', e)
    error.value = 'Failed to upload file.'
  } finally {
    uploading.value = false
    dragActive.value = false
  }
}

// Delete Image
const deleteImage = async (image) => {
  if (!confirm(`Are you sure you want to delete ${image.name}?`)) return

  try {
    const fileRef = storageRef($storage, image.fullPath)
    await deleteObject(fileRef)
    await fetchImages()
  } catch (e) {
    console.error('Error deleting image:', e)
    error.value = 'Failed to delete image.'
  }
}

// Edit Image (Open Modal)
const openEditModal = (image) => {
  editingImage.value = image
  editForm.value = {
    alt: image.alt
  }
  showEditModal.value = true
}

// Save Image Changes (Metadata only)
const saveImageChanges = async () => {
  if (!editingImage.value) return
  
  loading.value = true
  showEditModal.value = false
  
  try {
    const fileRef = storageRef($storage, editingImage.value.fullPath)
    
    // Update Metadata (Alt Text)
    await updateMetadata(fileRef, {
      customMetadata: {
        alt: editForm.value.alt
      }
    })
    
    await fetchImages()
  } catch (e) {
    console.error('Error updating image:', e)
    error.value = 'Failed to update image.'
  } finally {
    loading.value = false
    editingImage.value = null
  }
}

// Copy URL
const copyUrl = (url) => {
  navigator.clipboard.writeText(url)
  alert('URL copied to clipboard!')
}

// Drag and Drop handlers
const onDragEnter = (e) => {
  e.preventDefault()
  dragActive.value = true
}

const onDragLeave = (e) => {
  e.preventDefault()
  dragActive.value = false
}

const onDrop = (e) => {
  e.preventDefault()
  handleFileUpload(e)
}

onMounted(() => {
  fetchImages()
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Media Library</h1>
      <button 
        @click="showNewFolderModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        New Folder
      </button>
    </div>

    <!-- Breadcrumbs -->
    <nav class="flex mb-6 text-gray-600 text-sm" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1 md:space-x-3">
        <li v-for="(crumb, index) in breadcrumbs" :key="crumb.path" class="inline-flex items-center">
          <div class="flex items-center">
            <svg v-if="index > 0" class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
            <button 
              @click="navigateTo(crumb.path)"
              class="inline-flex items-center text-sm font-medium hover:text-blue-600 transition-colors"
              :class="index === breadcrumbs.length - 1 ? 'text-gray-800 font-semibold pointer-events-none' : 'text-gray-500'"
            >
              <svg v-if="index === 0" class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
              {{ crumb.name }}
            </button>
          </div>
        </li>
      </ol>
    </nav>

    <!-- Error Message -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 relative" role="alert">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline"> {{ error }}</span>
    </div>

    <!-- Upload Area -->
    <div 
      class="border-2 border-dashed rounded-lg p-8 text-center mb-8 transition-colors duration-200"
      :class="dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'"
      @dragenter="onDragEnter"
      @dragover.prevent
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <div v-if="uploading" class="text-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p class="text-gray-600">Uploading...</p>
      </div>
      <div v-else>
        <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <div class="mt-4 flex text-sm text-gray-600 justify-center">
          <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
            <span>Upload a file</span>
            <input id="file-upload" name="file-upload" type="file" class="sr-only" multiple @change="handleFileUpload">
          </label>
          <p class="pl-1">or drag and drop</p>
        </div>
        <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
      </div>
    </div>

    <!-- Gallery -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-500">Loading content...</p>
    </div>
    
    <div v-else-if="images.length === 0 && folders.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
      <p class="text-gray-500">This folder is empty. Upload images or create a subfolder.</p>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <!-- Folders -->
      <div 
        v-for="folder in folders" 
        :key="folder.fullPath" 
        class="group relative bg-blue-50 rounded-lg shadow border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer aspect-square flex flex-col items-center justify-center"
        @click="navigateTo(folder.path)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-blue-400 group-hover:text-blue-500 transition-colors" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
        </svg>
        <p class="mt-2 font-medium text-gray-700 group-hover:text-gray-900">{{ folder.name }}</p>
        
        <button 
          @click.stop="deleteFolder(folder)" 
          class="absolute top-2 right-2 p-1.5 bg-white rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
          title="Delete Folder"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <!-- Images -->
      <div v-for="image in images" :key="image.fullPath" class="group relative bg-white rounded-lg shadow overflow-hidden aspect-square">
        <img :src="image.url" :alt="image.alt || image.name" class="w-full h-full object-cover group-hover:opacity-75 transition-opacity duration-200">
        
        <!-- Alt Badge -->
        <div v-if="image.alt" class="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded">
          ALT
        </div>

        <!-- Overlay Actions -->
        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div class="flex space-x-2">
            <button 
              @click="openEditModal(image)" 
              class="p-2 bg-white rounded-full hover:bg-blue-50 text-blue-600 transition-colors"
              title="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button 
              @click="copyUrl(image.url)" 
              class="p-2 bg-white rounded-full hover:bg-gray-100 text-gray-800 transition-colors"
              title="Copy URL"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button 
              @click="deleteImage(image)" 
              class="p-2 bg-white rounded-full hover:bg-red-50 text-red-600 transition-colors"
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <p class="text-white text-xs truncate">{{ image.name }}</p>
        </div>
      </div>
    </div>

    <!-- New Folder Modal -->
    <div v-if="showNewFolderModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-bold mb-4">Create New Folder</h3>
        <input 
          v-model="newFolderName" 
          type="text" 
          placeholder="Folder Name" 
          class="w-full border border-gray-300 text-gray-700 rounded px-3 py-2 mb-4 focus:outline-none focus:border-blue-500"
          @keyup.enter="createFolder"
        >
        <div class="flex justify-end space-x-3">
          <button 
            @click="showNewFolderModal = false" 
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="createFolder" 
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            :disabled="!newFolderName"
          >
            Create
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Image Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-bold mb-4">Edit Alt Text</h3>
        
        <div class="mb-4">
          <p class="text-sm text-gray-500 mb-2">File: <span class="font-medium text-gray-700">{{ editingImage?.name }}</span></p>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
          <input 
            v-model="editForm.alt" 
            type="text" 
            placeholder="Describe the image"
            class="w-full border border-gray-300 text-gray-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          >
        </div>

        <div class="flex justify-end space-x-3">
          <button 
            @click="showEditModal = false" 
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="saveImageChanges" 
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
