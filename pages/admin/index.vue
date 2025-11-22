<script setup>
definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Admin Dashboard',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Stats Card 1 -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-gray-500 text-sm font-medium uppercase">Total Posts</h3>
        <p class="text-3xl font-bold text-gray-800 mt-2">12</p>
      </div>
      
      <!-- Stats Card 2 -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-gray-500 text-sm font-medium uppercase">SEO Score</h3>
        <p class="text-3xl font-bold text-green-600 mt-2">98/100</p>
      </div>
    </div>

    <div class="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div class="flex">
        <div class="ml-3">
          <p class="text-sm text-yellow-700">
            <span class="font-bold">Note:</span> This admin area is hidden from search engines.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
