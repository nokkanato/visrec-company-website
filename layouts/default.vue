<script setup>
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const { locale, locales, t } = useI18n()
const route = useRoute()

// Menu state
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// Dynamic header background based on route
const headerBgClass = computed(() => {
  if (route.path.includes('/about')) {
    return 'bg-visrec-pearl'
  }
  return 'bg-visrec-gray'
})

// Dynamic logo based on route
const logoPath = computed(() => {
  if (route.path.includes('/about')) {
    return '/assets/logo/vrblack.svg'
  }
  return '/assets/logo/vrwhite.svg'
})

// Dynamic hamburger color based on route
const hamburgerColorClass = computed(() => {
  if (route.path.includes('/about')) {
    return 'bg-visrec-gray'
  }
  return 'bg-white'
})

// Dynamic drawer background based on route
const drawerBgClass = computed(() => {
  if (route.path.includes('/about')) {
    return 'bg-visrec-pearl'
  }
  return 'bg-visrec-gray'
})

// Dynamic drawer text color based on route
const drawerTextClass = computed(() => {
  if (route.path.includes('/about')) {
    return 'text-visrec-gray'
  }
  return 'text-white'
})
// Determine SEO key based on route
const seoKey = route.path === '/' ? 'homepage' : route.path.includes('/about') ? 'about' : 'homepage'
const seoData = t(`seo.${seoKey}`)
const organization = t('seo.organization') || { address: {} }

useHead({
  title: seoData.title,
  meta: [
    { name: 'description', content: seoData.description },
    { name: 'keywords', content: seoData.keywords }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: organization.name,
        legalName: organization.legalName,
        url: organization.url,
        logo: organization.logo,
        sameAs: organization.sameAs,
        contactPoint: {
          '@type': 'ContactPoint',
          email: organization.email,
          address: {
            '@type': 'PostalAddress',
            addressLocality: organization?.address?.city ?? '',
            addressCountry: organization?.address?.country ?? ''
          }
        },
        description: organization.description
      })
    }
  ]
})

</script>

<template>
  <div class="min-h-screen  text-white">
    <div class="bg-visrec-orange">

      <!-- Navigation -->
      <header class="mt-2 w-full pt-4 rounded-t-[50px]" :class="headerBgClass">
        <div class="  w-[90%] mx-auto flex items-center justify-between px-6 py-6">
          <NuxtLink :to="localePath('/')" class="flex items-center gap-2">
            <img :src="logoPath" alt="VisRec Logo" class="w-20 md:w-24" />
          </NuxtLink>

          <div class="flex items-center gap-4">
            <!-- Language Switcher - Hidden on mobile -->
            <div class="hidden md:flex items-center gap-2 rounded-full p-1" :class="route.path.includes('/about') ? 'bg-visrec-pearl' : ''">
              <NuxtLink
                v-for="loc in locales"
                :key="loc.code"
                :to="switchLocalePath(loc.code)"
                class="px-3 py-1 rounded-full text-sm font-medium transition-all duration-300"
                :class="locale === loc.code 
                  ? 'bg-visrec-orange text-white' 
                  : route.path.includes('/about')
                    ? 'text-gray-600 hover:text-gray-900'
                    : 'text-gray-400 hover:text-white'"
              >
                {{ loc.code.toUpperCase() }}
              </NuxtLink>
            </div>
            
            <!-- Animated Hamburger Button -->
            <button @click="toggleMenu" class="relative w-10 h-10 flex items-center justify-center group">
              <div class="w-6 h-5 relative flex flex-col justify-between">
                <span 
                  class="w-full h-0.5 rounded-full transition-all duration-300 origin-center"
                  :class="[hamburgerColorClass, isMenuOpen ? 'rotate-45 translate-y-2' : '']"
                ></span>
                <span 
                  class="w-full h-0.5 rounded-full transition-all duration-300"
                  :class="[hamburgerColorClass, isMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100']"
                ></span>
                <span 
                  class="w-full h-0.5 rounded-full transition-all duration-300 origin-center"
                  :class="[hamburgerColorClass, isMenuOpen ? '-rotate-45 -translate-y-2' : '']"
                ></span>
              </div>
            </button>
          </div>
        </div>
      </header>

      <!-- Slide-in Menu -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
      >
        <div v-if="isMenuOpen" class="fixed top-0 right-0 h-screen w-full md:w-96 z-50 shadow-2xl" :class="drawerBgClass">
          <div class="p-8">
            <!-- Close button -->
            <button @click="toggleMenu" class="absolute top-8 right-8 w-10 h-10 flex items-center justify-center">
              <div class="w-6 h-5 relative flex flex-col justify-between">
                <span class="w-full h-0.5 rounded-full rotate-45 translate-y-2" :class="hamburgerColorClass"></span>
                <span class="w-full h-0.5 rounded-full -rotate-45 -translate-y-2" :class="hamburgerColorClass"></span>
              </div>
            </button>

            <!-- Menu Content -->
            <nav class="mt-20 space-y-6">
              <NuxtLink 
                :to="localePath('/work')" 
                @click="toggleMenu"
                class="block text-3xl font-bold hover:text-visrec-orange transition-colors"
                :class="drawerTextClass"
              >
                {{ $t('nav.work') }}
              </NuxtLink>
              <NuxtLink 
                :to="localePath('/about')" 
                @click="toggleMenu"
                class="block text-3xl font-bold hover:text-visrec-orange transition-colors"
                :class="drawerTextClass"
              >
                {{ $t('nav.about') }}
              </NuxtLink>
              <NuxtLink 
                :to="localePath('/')" 
                @click="toggleMenu"
                class="block text-3xl font-bold hover:text-visrec-orange transition-colors"
                :class="drawerTextClass"
              >
                {{ $t('nav.contact') }}
              </NuxtLink>

              <!-- Custom Language Switcher -->
              <div class="pt-8 border-t" :class="route.path.includes('/about') ? 'border-gray-300' : 'border-gray-700'">
                <p class="text-sm mb-4" :class="route.path.includes('/about') ? 'text-gray-500' : 'text-gray-400'">Language / ภาษา</p>
                <div class="inline-flex rounded-full p-1" :class="route.path.includes('/about') ? 'bg-gray-200' : 'bg-gray-800'">
                  <NuxtLink
                    v-for="loc in locales"
                    :key="loc.code"
                    :to="switchLocalePath(loc.code)"
                    @click="toggleMenu"
                    class="px-8 py-2.5 rounded-full text-base font-bold transition-all duration-300"
                    :class="locale === loc.code 
                      ? 'bg-visrec-orange text-white shadow-md' 
                      : route.path.includes('/about')
                        ? 'text-gray-500 hover:text-gray-700'
                        : 'text-gray-400 hover:text-white'"
                  >
                    {{ loc.code.toUpperCase() }}
                  </NuxtLink>
                </div>
              </div>

              <!-- Social Links -->
              <div class="pt-8 border-t" :class="route.path.includes('/about') ? 'border-gray-300' : 'border-gray-700'">
                <p class="text-sm mb-4" :class="route.path.includes('/about') ? 'text-gray-500' : 'text-gray-400'">Follow us</p>
                <div class="flex gap-4">
                  <a href="#" class="hover:text-visrec-orange transition-colors" :class="route.path.includes('/about') ? 'text-gray-500' : 'text-gray-400'">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                  <a href="#" class="hover:text-visrec-orange transition-colors" :class="route.path.includes('/about') ? 'text-gray-500' : 'text-gray-400'">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </Transition>

      <!-- Overlay -->
      <Transition
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-300"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div 
          v-if="isMenuOpen" 
          @click="toggleMenu"
          class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        ></div>
      </Transition>
    </div>

    <!-- Main Content -->
    <main class="">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-visrec-orange  border-t border-gray-800 ">
      <div class="container mx-auto px-6 py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Brand -->
          <div>
            <h3 class="text-2xl text-visrec-gray font-bold mb-4">VisRec</h3>
            <p class="text-visrec-pearl text-gray-400">Creative filmmakers crafting unique visual stories.</p>
          </div>

          <!-- Links -->
          <div>
            <h4 class="font-semibold mb-4 text-visrec-gray ">Navigation</h4>
            <div class="space-y-2 ">
              <NuxtLink :to="localePath('/work')" class="block text-gray-400 text-visrec-pearl hover:text-white  transition-colors">
                {{ $t('nav.work') }}
              </NuxtLink>
              <NuxtLink :to="localePath('/about')" class="block text-visrec-pearl text-gray-400 hover:text-white transition-colors">
                {{ $t('nav.about') }}
              </NuxtLink>
              <NuxtLink :to="localePath('/')" class="block text-visrec-pearl text-gray-400 hover:text-white transition-colors">
                {{ $t('nav.contact') }}
              </NuxtLink>
            </div>
          </div>

          <!-- Contact -->
          <div>
            <h4 class="font-semibold mb-4 text-visrec-gray ">Contact</h4>
            <a href="mailto:hello@visrec.studio" class="text-gray-400 text-visrec-pearl hover:text-orange-500 transition-colors">
              {{ $t('footer.email') }}
            </a>
          </div>
        </div>

        <div class="mt-12 pt-8 border-t text-visrec-gray  border-gray-800 text-center text-gray-400 text-sm">
          {{ $t('footer.rights') }}
        </div>
      </div>
    </footer>
  </div>
</template>
