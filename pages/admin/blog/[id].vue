<script setup>
definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const route = useRoute()
const isNew = route.params.id === 'new'

const post = ref({
  title: '',
  slug: '',
  content: '',
  seoTitle: '',
  seoDescription: ''
})

if (!isNew) {
  // Mock fetch existing post
  post.value = {
    title: 'First Blog Post',
    slug: 'first-blog-post',
    content: 'This is the content of the first blog post.',
    seoTitle: 'First Blog Post - SEO',
    seoDescription: 'Description for SEO.'
  }
}

const savePost = () => {
  alert('Post saved! (Mock)')
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">{{ isNew ? 'Create New Post' : 'Edit Post' }}</h1>

    <form @submit.prevent="savePost" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="title">
          Title
        </label>
        <input v-model="post.title" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="title" type="text" placeholder="Post Title">
      </div>
      
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="slug">
          Slug
        </label>
        <input v-model="post.slug" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="slug" type="text" placeholder="post-slug">
      </div>

      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="content">
          Content
        </label>
        <textarea v-model="post.content" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-48" id="content" placeholder="Post content..."></textarea>
      </div>

      <hr class="my-6 border-gray-300">
      <h2 class="text-xl font-bold text-gray-800 mb-4">SEO Settings</h2>

      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="seoTitle">
          SEO Title
        </label>
        <input v-model="post.seoTitle" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="seoTitle" type="text" placeholder="SEO Title">
      </div>

      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="seoDescription">
          SEO Description
        </label>
        <textarea v-model="post.seoDescription" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="seoDescription" placeholder="Meta description..."></textarea>
      </div>

      <div class="flex items-center justify-between">
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
          Save Post
        </button>
      </div>
    </form>
  </div>
</template>
