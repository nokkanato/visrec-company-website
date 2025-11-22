<script setup>
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore'

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const localePath = useLocalePath()
const { $db } = useNuxtApp()

const works = ref([])
const loading = ref(true)
const error = ref(null)

// Fetch Works
const fetchWorks = async () => {
  loading.value = true
  error.value = null
  try {
    const q = query(collection($db, 'work'), orderBy('updatedAt', 'desc'))
    const querySnapshot = await getDocs(q)
    works.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (e) {
    console.error('Error fetching works:', e)
    error.value = 'Failed to load works.'
  } finally {
    loading.value = false
  }
}

// Delete Work
const deleteWork = async (work) => {
  if (!confirm(`Are you sure you want to delete "${work.title}"?`)) return

  try {
    await deleteDoc(doc($db, 'work', work.id))
    await fetchWorks()
  } catch (e) {
    console.error('Error deleting work:', e)
    alert('Failed to delete work.')
  }
}

onMounted(() => {
  fetchWorks()
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Work Portfolio</h1>
      <NuxtLink :to="localePath('/admin/work/new')" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create New Work
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-500">Loading projects...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 relative" role="alert">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline"> {{ error }}</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="works.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <p class="text-gray-500 text-lg">No projects found.</p>
      <p class="text-gray-400 text-sm mt-2">Get started by creating a new work item.</p>
    </div>

    <!-- List -->
    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden my-6">
      <table class="min-w-full table-auto">
        <thead>
          <tr class="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
            <th class="py-3 px-6 text-left">Title</th>
            <th class="py-3 px-6 text-left">Category</th>
            <th class="py-3 px-6 text-left">Status</th>
            <th class="py-3 px-6 text-left">Last Updated</th>
            <th class="py-3 px-6 text-center">Actions</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm font-light">
          <tr v-for="work in works" :key="work.id" class="border-b border-gray-200 hover:bg-gray-50 transition-colors">
            <td class="py-3 px-6 text-left whitespace-nowrap">
              <div class="flex items-center">
                <div v-if="work.coverImage" class="h-10 w-10 rounded overflow-hidden mr-3 flex-shrink-0">
                  <img :src="work.coverImage" class="h-full w-full object-cover">
                </div>
                <span class="font-medium text-gray-800">{{ work.title }}</span>
              </div>
            </td>
            <td class="py-3 px-6 text-left">
              <!-- Multiple categories -->
              <div v-if="work.categories && work.categories.length > 0" class="flex flex-wrap gap-1">
                <span 
                  v-for="cat in work.categories" 
                  :key="cat"
                  class="bg-gray-100 text-gray-600 py-1 px-3 rounded-full text-xs"
                >
                  {{ cat }}
                </span>
              </div>
              <!-- Legacy single category fallback -->
              <span v-else-if="work.category" class="bg-gray-100 text-gray-600 py-1 px-3 rounded-full text-xs">
                {{ work.category }}
              </span>
              <!-- No category -->
              <span v-else class="text-gray-400 text-xs italic">
                No category
              </span>
            </td>
            <td class="py-3 px-6 text-left">
              <span :class="work.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'" class="py-1 px-3 rounded-full text-xs font-medium">
                {{ work.status }}
              </span>
            </td>
            <td class="py-3 px-6 text-left">
              {{ work.updatedAt ? new Date(work.updatedAt).toLocaleDateString() : '-' }}
            </td>
            <td class="py-3 px-6 text-center">
              <div class="flex item-center justify-center space-x-2">
                <NuxtLink :to="localePath(`/admin/work/${work.id}`)" class="p-1 hover:bg-gray-100 rounded text-blue-600 hover:text-blue-800 transition-colors" title="Edit">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </NuxtLink>
                <button 
                  @click="deleteWork(work)" 
                  class="p-1 hover:bg-gray-100 rounded text-red-600 hover:text-red-800 transition-colors" 
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
