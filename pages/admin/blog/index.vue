<script setup>
definePageMeta({
  layout: 'admin'
})

const localePath = useLocalePath()

// Mock data
const posts = ref([
  { id: 1, title: 'First Blog Post', status: 'Published', date: '2023-10-01' },
  { id: 2, title: 'Upcoming Features', status: 'Draft', date: '2023-10-05' },
])
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Blog Posts</h1>
      <NuxtLink :to="localePath('/admin/blog/new')" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Create New Post
      </NuxtLink>
    </div>

    <div class="bg-white shadow-md rounded my-6">
      <table class="min-w-full table-auto">
        <thead>
          <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th class="py-3 px-6 text-left">Title</th>
            <th class="py-3 px-6 text-left">Status</th>
            <th class="py-3 px-6 text-left">Date</th>
            <th class="py-3 px-6 text-center">Actions</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm font-light">
          <tr v-for="post in posts" :key="post.id" class="border-b border-gray-200 hover:bg-gray-100">
            <td class="py-3 px-6 text-left whitespace-nowrap">
              <span class="font-medium">{{ post.title }}</span>
            </td>
            <td class="py-3 px-6 text-left">
              <span :class="post.status === 'Published' ? 'bg-green-200 text-green-600' : 'bg-yellow-200 text-yellow-600'" class="py-1 px-3 rounded-full text-xs">
                {{ post.status }}
              </span>
            </td>
            <td class="py-3 px-6 text-left">
              {{ post.date }}
            </td>
            <td class="py-3 px-6 text-center">
              <div class="flex item-center justify-center">
                <NuxtLink :to="localePath(`/admin/blog/${post.id}`)" class="w-4 mr-2 transform hover:text-purple-500 hover:scale-110">
                  Edit
                </NuxtLink>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
