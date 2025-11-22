<script setup>
definePageMeta({
  layout: 'admin'
})

const localePath = useLocalePath()

// Mock data
const works = ref([
  { id: 1, title: 'Project Alpha', category: 'Web Design', status: 'Published', date: '2023-10-01' },
  { id: 2, title: 'Mobile App Beta', category: 'App Development', status: 'Draft', date: '2023-10-05' },
  { id: 3, title: 'Brand Identity', category: 'Branding', status: 'Published', date: '2023-10-10' },
])
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Work Portfolio</h1>
      <NuxtLink :to="localePath('/admin/work/new')" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create New Work
      </NuxtLink>
    </div>

    <div class="bg-white shadow-md rounded-lg overflow-hidden my-6">
      <table class="min-w-full table-auto">
        <thead>
          <tr class="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
            <th class="py-3 px-6 text-left">Title</th>
            <th class="py-3 px-6 text-left">Category</th>
            <th class="py-3 px-6 text-left">Status</th>
            <th class="py-3 px-6 text-left">Date</th>
            <th class="py-3 px-6 text-center">Actions</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm font-light">
          <tr v-for="work in works" :key="work.id" class="border-b border-gray-200 hover:bg-gray-50 transition-colors">
            <td class="py-3 px-6 text-left whitespace-nowrap">
              <span class="font-medium text-gray-800">{{ work.title }}</span>
            </td>
            <td class="py-3 px-6 text-left">
              <span>{{ work.category }}</span>
            </td>
            <td class="py-3 px-6 text-left">
              <span :class="work.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'" class="py-1 px-3 rounded-full text-xs font-medium">
                {{ work.status }}
              </span>
            </td>
            <td class="py-3 px-6 text-left">
              {{ work.date }}
            </td>
            <td class="py-3 px-6 text-center">
              <div class="flex item-center justify-center space-x-2">
                <NuxtLink :to="localePath(`/admin/work/${work.id}`)" class="p-1 hover:bg-gray-100 rounded text-blue-600 hover:text-blue-800 transition-colors" title="Edit">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </NuxtLink>
                <button class="p-1 hover:bg-gray-100 rounded text-red-600 hover:text-red-800 transition-colors" title="Delete">
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
