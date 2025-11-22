<script setup>
definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const localePath = useLocalePath()
const router = useRouter()

const isNew = route.params.id === 'new'
const id = route.params.id

// Mock Data for Edit
const form = ref({
  title: '',
  category: '',
  status: 'Draft',
  description: '',
  coverImage: ''
})

if (!isNew) {
  // Simulate fetching data
  form.value = {
    title: 'Project Alpha',
    category: 'Web Design',
    status: 'Published',
    description: 'This is a detailed description of Project Alpha.',
    coverImage: 'https://via.placeholder.com/800x400'
  }
}

const saveWork = () => {
  // Simulate save
  alert('Work saved successfully! (Mock)')
  router.push(localePath('/admin/work'))
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">{{ isNew ? 'Create New Work' : 'Edit Work' }}</h1>
      <NuxtLink :to="localePath('/admin/work')" class="text-gray-600 hover:text-gray-900">
        Back to List
      </NuxtLink>
    </div>

    <div class="bg-white shadow-md rounded-lg p-6">
      <form @submit.prevent="saveWork">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Title -->
          <div class="col-span-2">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="title">
              Title
            </label>
            <input 
              v-model="form.title"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" 
              id="title" 
              type="text" 
              placeholder="Project Title"
              required
            >
          </div>

          <!-- Category -->
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2" for="category">
              Category
            </label>
            <select 
              v-model="form.category"
              class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 bg-white" 
              id="category"
            >
              <option value="" disabled>Select Category</option>
              <option value="Web Design">Web Design</option>
              <option value="App Development">App Development</option>
              <option value="Branding">Branding</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2" for="status">
              Status
            </label>
            <select 
              v-model="form.status"
              class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 bg-white" 
              id="status"
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>

          <!-- Description -->
          <div class="col-span-2">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="description">
              Description
            </label>
            <textarea 
              v-model="form.description"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 h-32" 
              id="description" 
              placeholder="Project Description"
            ></textarea>
          </div>
          
          <!-- Cover Image (Simple URL for now) -->
          <div class="col-span-2">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="coverImage">
              Cover Image URL
            </label>
            <div class="flex gap-2">
              <input 
                v-model="form.coverImage"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" 
                id="coverImage" 
                type="text" 
                placeholder="https://..."
              >
              <a 
                :href="localePath('/admin/media')" 
                target="_blank"
                class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded flex items-center whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Open Media
              </a>
            </div>
            <p class="text-xs text-gray-500 mt-1">Tip: Open Media Library to upload and copy image URL.</p>
          </div>
        </div>

        <div class="flex items-center justify-end">
          <button 
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition-colors" 
            type="submit"
          >
            {{ isNew ? 'Create Work' : 'Update Work' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
