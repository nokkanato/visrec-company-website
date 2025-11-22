<script setup>
definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const seoSettings = ref({
  defaultTitle: 'My Nuxt App',
  defaultDescription: 'A great Nuxt application.',
  ogImage: 'https://example.com/og-image.jpg'
})

const saveSettings = () => {
  alert('SEO Settings saved! (Mock)')
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Global SEO Settings</h1>

    <form @submit.prevent="saveSettings" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="defaultTitle">
          Default Site Title
        </label>
        <input v-model="seoSettings.defaultTitle" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="defaultTitle" type="text">
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="defaultDescription">
          Default Meta Description
        </label>
        <textarea v-model="seoSettings.defaultDescription" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="defaultDescription"></textarea>
      </div>

      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="ogImage">
          Default OG Image URL
        </label>
        <input v-model="seoSettings.ogImage" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="ogImage" type="text">
      </div>

      <div class="flex items-center justify-between">
        <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
          Save Settings
        </button>
      </div>
    </form>
  </div>
</template>
