<script setup>
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'

const route = useRoute()
const { $db } = useNuxtApp()
const { locale } = useI18n()

const work = ref(null)
const loading = ref(true)
const showLightbox = ref(false)
const currentImageIndex = ref(0)

// Fetch work data
const fetchWork = async () => {
  loading.value = true
  try {
    const slugOrId = route.params.slug
    const worksRef = collection($db, 'work')
    
    // First try to find by slug
    const slugQuery = query(
      worksRef,
      where('slug', '==', slugOrId),
      where('status', '==', 'Published')
    )
    
    let docSnap = null
    const slugSnapshot = await getDocs(slugQuery)
    
    if (!slugSnapshot.empty) {
      // Found by slug
      docSnap = slugSnapshot.docs[0]
    } else {
      // Fallback: try by ID (for legacy items)
      const docRef = doc($db, 'work', slugOrId)
      const idDocSnap = await getDoc(docRef)
      
      if (idDocSnap.exists() && idDocSnap.data().status === 'Published') {
        docSnap = idDocSnap
      }
    }
    
    if (docSnap && docSnap.exists()) {
      const data = docSnap.data()
      
      work.value = {
        id: docSnap.id,
        ...data
      }
      
      // Get SEO data based on locale with fallbacks
      const seoTitle = work.value.seo?.[locale.value]?.title || work.value.title
      const seoDescription = work.value.seo?.[locale.value]?.description || `View ${work.value.title} - ${work.value.categories?.join(', ') || work.value.category || 'Creative work'}`
      const ogImage = work.value.coverImage || 'https://visrec.studio/og-default.jpg'
      const siteUrl = 'https://visrec.studio'
      const pageUrl = `${siteUrl}/work/${route.params.slug}`
      
      // Set comprehensive SEO
      useHead({
        title: `${seoTitle} - VisRec Studio`,
        meta: [
          // Basic meta
          { name: 'description', content: seoDescription },
          { name: 'keywords', content: work.value.categories?.join(', ') || work.value.category || '' },
          
          // Open Graph
          { property: 'og:title', content: seoTitle },
          { property: 'og:description', content: seoDescription },
          { property: 'og:image', content: ogImage },
          { property: 'og:url', content: pageUrl },
          { property: 'og:type', content: 'article' },
          { property: 'og:site_name', content: 'VisRec Studio' },
          
          // Twitter Card
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'twitter:title', content: seoTitle },
          { name: 'twitter:description', content: seoDescription },
          { name: 'twitter:image', content: ogImage },
          
          // Additional
          { name: 'author', content: 'VisRec Studio' }
        ],
        link: [
          { rel: 'canonical', href: pageUrl }
        ]
      })
    } else {
      throw new Error('Work not found')
    }
  } catch (error) {
    console.error('Error fetching work:', error)
    // Redirect to 404 or work listing
    navigateTo('/work')
  } finally {
    loading.value = false
  }
}

// Get content based on current locale
const currentContent = computed(() => {
  if (!work.value) return ''
  
  const content = work.value.content
  
  // Handle legacy string content
  if (typeof content === 'string') {
    return content
  }
  
  // Handle bilingual content object
  if (typeof content === 'object' && content !== null) {
    return content[locale.value] || content.en || ''
  }
  
  return ''
})

// Video Embed URL
const embedUrl = computed(() => {
  if (!work.value?.videoUrl) return ''
  const url = work.value.videoUrl
  const type = work.value.videoType || 'youtube'

  if (type === 'youtube') {
    let id = ''
    if (url.includes('v=')) {
      id = url.split('v=')[1].split('&')[0]
    } else if (url.includes('youtu.be/')) {
      id = url.split('youtu.be/')[1].split('?')[0]
    }
    return `https://www.youtube.com/embed/${id}?rel=0`
  }

  if (type === 'vimeo') {
    const id = url.split('vimeo.com/')[1].split('/')[0]
    return `https://player.vimeo.com/video/${id}`
  }

  if (type === 'facebook') {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0`
  }

  return ''
})

// Lightbox functions
const openLightbox = (index) => {
  currentImageIndex.value = index
  showLightbox.value = true
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  showLightbox.value = false
  document.body.style.overflow = 'auto'
}

const nextImage = () => {
  if (work.value.gallery && currentImageIndex.value < work.value.gallery.length - 1) {
    currentImageIndex.value++
  }
}

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

// Keyboard navigation
const handleKeydown = (e) => {
  if (!showLightbox.value) return
  
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowRight') nextImage()
  if (e.key === 'ArrowLeft') prevImage()
}

onMounted(() => {
  fetchWork()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = 'auto'
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Loading...</p>
      </div>
    </div>

    <!-- Work Content -->
    <div v-else-if="work" class="bg-visrec-gray">
      <!-- Hero Cover Image -->
      <section class="relative h-[60vh] md:h-[70vh] overflow-hidden ">
        <img
          v-if="work.coverImage"
          :src="work.coverImage"
          :alt="work.title"
          class="w-full h-full object-cover opacity-90"
        >
        <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        
        <!-- Title Overlay -->
        <div class="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div class="container mx-auto">
            <!-- Category Badges -->
            <div v-if="work.categories && work.categories.length > 0" class="flex flex-wrap gap-2 mb-4">
              <span 
                v-for="cat in work.categories" 
                :key="cat"
                class="inline-block bg-white bg-opacity-20 backdrop-blur-md px-4 py-2 rounded-full text-white font-semibold"
              >
                {{ cat }}
              </span>
            </div>
            <!-- Legacy single category fallback -->
            <div v-else-if="work.category" class="inline-block bg-white bg-opacity-20 backdrop-blur-md px-4 py-2 rounded-full mb-4">
              <span class="text-white font-semibold">{{ work.category }}</span>
            </div>
            <h1 class="text-4xl md:text-6xl font-bold text-white mb-4 max-w-4xl">
              {{ work.title }}
            </h1>
          </div>
        </div>
      </section>

      <!-- Video Section -->
      <section v-if="embedUrl" class="container mx-auto px-4 mt-16 relative z-10 mb-6">
        <div class="max-w-4xl mx-auto bg-black rounded-xl overflow-hidden shadow-2xl aspect-video">
          <iframe
            :src="embedUrl"
            class="w-full h-full"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      </section>

      <!-- Content Section -->
      <section class="container mx-auto px-4 py-4 md:py-16">
        <div class="max-w-4xl mx-auto">
          <!-- Rich Text Content -->
          <div 
            v-if="currentContent"
            class="prose prose-lg max-w-none mb-16"
            v-html="currentContent"
          ></div>
          
          <div v-else class="text-center py-12 text-gray-400 italic">
            No content available
          </div>
        </div>
      </section>

      <!-- Gallery Section -->
      <section v-if="work.gallery && work.gallery.length > 0" class="bg-gray-50 py-16">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">Stills</h2>
          
          <!-- Gallery Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            <div
              v-for="(image, index) in work.gallery"
              :key="index"
              @click="openLightbox(index)"
              class="group relative aspect-video rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              <img
                :src="image"
                :alt="`Gallery image ${index + 1}`"
                class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              >
              
              <!-- Hover Overlay -->
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                <svg class="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Back Button -->
      <section class="container mx-auto px-4 py-12">
        <div class="text-center">
          <NuxtLink
            to="/work"
            class="inline-flex items-center gap-2 bg-gradient-to-r bg-visrec-orange text-visrec-pearl px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to All Work
          </NuxtLink>
        </div>
      </section>
    </div>

    <!-- Lightbox Modal -->
    <Teleport to="body">
      <div
        v-if="showLightbox && work && work.gallery"
        class="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
        @click="closeLightbox"
      >
        <!-- Close Button -->
        <button
          @click="closeLightbox"
          class="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
        >
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Image Counter -->
        <div class="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-lg font-semibold z-10">
          {{ currentImageIndex + 1 }} / {{ work.gallery.length }}
        </div>

        <!-- Previous Button -->
        <button
          v-if="currentImageIndex > 0"
          @click.stop="prevImage"
          class="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
        >
          <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Image -->
        <div class="max-w-7xl max-h-[90vh] px-16" @click.stop>
          <img
            :src="work.gallery[currentImageIndex]"
            :alt="`Gallery image ${currentImageIndex + 1}`"
            class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          >
        </div>

        <!-- Next Button -->
        <button
          v-if="currentImageIndex < work.gallery.length - 1"
          @click.stop="nextImage"
          class="absolute right-4 text-white hover:text-gray-300 transition-colors z-10"
        >
          <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Hint Text -->
        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm">
          Press ESC to close • Use arrow keys to navigate
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Prose styling for rich content */
:deep(.prose) {
  color: #eaddda;
}

:deep(.prose h2) {
  font-size: 2em;
  font-weight: 700;
  margin-top: 2em;
  margin-bottom: 1em;
  color: #eaddda;
}

:deep(.prose p) {
  margin-bottom: 1.5em;
  line-height: 1.75;
}

:deep(.prose img) {
  border-radius: 0.5rem;
  margin: 2em auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

:deep(.prose ul) {
  list-style-type: disc;
  padding-left: 1.5em;
  margin-bottom: 1.5em;
}

:deep(.prose li) {
  margin-bottom: 0.5em;
}
</style>
