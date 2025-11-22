<script setup>
const localePath = useLocalePath()
const route = useRoute()
const { user, logout, initAuth } = useAuth()

// Initialize auth state
onMounted(() => {
  initAuth()
})

const handleLogout = async () => {
  try {
    await logout()
    navigateTo(localePath('/admin/login'))
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-800 text-white flex flex-col">
      <div class="p-4 text-2xl font-bold border-b border-gray-700">
        Admin Panel
      </div>
      <nav class="flex-1 p-4 space-y-2">
        <NuxtLink 
          :to="localePath('/admin')" 
          class="block py-2 px-4 rounded transition-colors duration-200"
          active-class="bg-blue-600 text-white"
          exact-active-class="bg-blue-600 text-white"
          :class="route.path === localePath('/admin') ? '' : 'hover:bg-gray-700'"
        >
          <span class="flex items-center">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Dashboard
          </span>
        </NuxtLink>
        <NuxtLink 
          :to="localePath('/admin/blog')" 
          class="block py-2 px-4 rounded transition-colors duration-200"
          active-class="bg-blue-600 text-white"
          :class="route.path.startsWith(localePath('/admin/blog')) ? '' : 'hover:bg-gray-700'"
        >
          <span class="flex items-center">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
            </svg>
            Blog Management
          </span>
        </NuxtLink>
        <NuxtLink 
          :to="localePath('/admin/work')" 
          class="block py-2 px-4 rounded transition-colors duration-200"
          active-class="bg-blue-600 text-white"
          :class="route.path.startsWith(localePath('/admin/work')) ? '' : 'hover:bg-gray-700'"
        >
          <span class="flex items-center">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            Work
          </span>
        </NuxtLink>
        <NuxtLink 
          :to="localePath('/admin/seo')" 
          class="block py-2 px-4 rounded transition-colors duration-200"
          active-class="bg-blue-600 text-white"
          exact-active-class="bg-blue-600 text-white"
          :class="route.path === localePath('/admin/seo') ? '' : 'hover:bg-gray-700'"
        >
          <span class="flex items-center">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            SEO Settings
          </span>
        </NuxtLink>
        <NuxtLink 
          :to="localePath('/admin/media')" 
          class="block py-2 px-4 rounded transition-colors duration-200"
          active-class="bg-blue-600 text-white"
          exact-active-class="bg-blue-600 text-white"
          :class="route.path === localePath('/admin/media') ? '' : 'hover:bg-gray-700'"
        >
          <span class="flex items-center">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Media Library
          </span>
        </NuxtLink>
        <NuxtLink 
          :to="localePath('/admin/translations')" 
          class="block py-2 px-4 rounded transition-colors duration-200"
          active-class="bg-blue-600 text-white"
          exact-active-class="bg-blue-600 text-white"
          :class="route.path === localePath('/admin/translations') ? '' : 'hover:bg-gray-700'"
        >
          <span class="flex items-center">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
            </svg>
            Translations
          </span>
        </NuxtLink>
      </nav>
      
      <!-- User Info & Logout -->
      <div class="border-t border-gray-700">
        <div v-if="user" class="p-4">
          <div class="flex items-center mb-3">
            <!-- Avatar with fallback -->
            <div class="w-10 h-10 rounded-full mr-3 flex-shrink-0 overflow-hidden bg-gray-600">
              <img 
                v-if="user.photoURL" 
                :src="user.photoURL" 
                class="w-full h-full object-cover" 
                :alt="user.displayName || 'User'"
                @error="$event.target.style.display='none'"
              >
              <!-- Blank avatar fallback -->
              <svg v-if="!user.photoURL" class="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white truncate">{{ user.displayName || 'User' }}</p>
              <p class="text-xs text-gray-400 truncate">{{ user.email }}</p>
            </div>
          </div>
          <button
            @click="handleLogout"
            class="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-200 flex items-center justify-center"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Logout
          </button>
        </div>
        <NuxtLink 
          :to="localePath('/')" 
          class="block py-2 px-4 mx-4 mb-4 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors duration-200"
        >
          <span class="flex items-center">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Site
          </span>
        </NuxtLink>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-8">
      <slot />
    </main>
  </div>
</template>

