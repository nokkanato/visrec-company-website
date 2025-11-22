<script setup>
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'

const { $db } = useNuxtApp()
const { t, locale } = useI18n()

// Bilingual SEO
const seoTitle = computed(() => locale.value === 'th' ? 'ผลงานของเรา - VisRec Studio' : 'Our Work - VisRec Studio')
const seoDescription = computed(() => 
  locale.value === 'th' 
    ? 'สำรวจผลงานการสร้างภาพยนตร์และการผลิตสร้างสรรค์ของเรา'
    : 'Explore our portfolio of creative filmmaking and production work.'
)

useHead({
  title: seoTitle,
  meta: [
    { name: 'description', content: seoDescription },
    { name: 'keywords', content: 'filmmaking, production, creative work, content, advertisement, music video, CSR' },
    
    // Open Graph
    { property: 'og:title', content: seoTitle },
    { property: 'og:description', content: seoDescription },
    { property: 'og:image', content: 'https://visrec.studio/og-work.jpg' },
    { property: 'og:url', content: 'https://visrec.studio/work' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'VisRec Studio' },
    
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: seoTitle },
    { name: 'twitter:description', content: seoDescription },
    { name: 'twitter:image', content: 'https://visrec.studio/og-work.jpg' }
  ],
  link: [
    { rel: 'canonical', href: 'https://visrec.studio/work' }
  ]
})

const works = ref([])
const loading = ref(true)
const selectedCategory = ref('All')

const categories = ['All', 'Content', 'Advertisement', 'Music Video', 'CSR', 'Internal']

// Fetch published works
const fetchWorks = async () => {
  loading.value = true
  try {
    const worksRef = collection($db, 'work')
    
    // Try with orderBy first
    let q = query(
      worksRef,
      where('status', '==', 'Published'),
      orderBy('createdAt', 'desc')
    )
    
    let querySnapshot
    try {
      querySnapshot = await getDocs(q)
    } catch (indexError) {
      // If orderBy fails (missing index), try without it
      console.warn('OrderBy failed, trying without:', indexError)
      q = query(worksRef, where('status', '==', 'Published'))
      querySnapshot = await getDocs(q)
    }
    
    works.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    console.log('Loaded works:', works.value.length)
  } catch (error) {
    console.error('Error fetching works:', error)
    alert('Failed to load works. Check console for details.')
  } finally {
    loading.value = false
  }
}

// Filtered works based on category
const filteredWorks = computed(() => {
  if (selectedCategory.value === 'All') {
    return works.value
  }
  return works.value.filter(work => {
    // Handle both legacy single category and new categories array
    const categories = work.categories || (work.category ? [work.category] : [])
    return categories.includes(selectedCategory.value)
  })
})

// Get category color
const getCategoryColor = (category) => {
  return 'bg-visrec-orange text-visrec-pearl'
}

// Custom directive for scroll animations
const vAnimateOnScroll = {
  mounted: (el, binding) => {
    // Add initial state classes
    el.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-700')
    
    // Add delay if provided
    if (binding.value) {
      el.style.transitionDelay = `${binding.value}ms`
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.classList.remove('opacity-0', 'translate-y-8')
          el.classList.add('opacity-100', 'translate-y-0')
          observer.unobserve(el)
        }
      })
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    })
    
    observer.observe(el)
  }
}

// Video Modal State
const showVideoModal = ref(false)
const currentVideoUrl = ref('')
const currentVideoType = ref('')

const openVideo = (work) => {
  if (work.videoUrl) {
    currentVideoUrl.value = work.videoUrl
    currentVideoType.value = work.videoType || 'youtube' // Default to youtube if not set
    showVideoModal.value = true
  }
}

onMounted(() => {
  fetchWorks()
})
</script>

<template>
  <div class="min-h-screen bg-visrec-gray">
    <!-- Hero Section -->
    <section class="relative bg-visrec-gray  text-white py-20 overflow-hidden">
      <div class="absolute inset-0 bg-visrec-gray opacity-10"></div>
      <div class="container mx-auto px-4 relative z-10">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            {{ $t('work.hero.title') }}
          </h1>
          <p class="text-xl md:text-2xl text-blue-100 mb-8 animate-fade-in">
            {{ $t('work.hero.subtitle') }}
          </p>
        </div>
      </div>
      
      <!-- Decorative elements -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-visrec-orange opacity-5 rounded-full -mr-32 -mt-32 animate-float"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-visrec-orange opacity-5 rounded-full -ml-48 -mb-48 animate-float-delayed"></div>
    </section>

    <!-- Filter Section -->
    <section class="bg-visrec-gray sticky top-0 z-40 ">
      <div class="container mx-auto px-4 py-4">
        <div class="flex flex-wrap justify-center gap-3">
          <button
            v-for="(category, index) in categories"
            :key="category"
            @click="selectedCategory = category"
            v-animate-on-scroll="index * 100"
            :class="[
              'px-6 py-2 rounded-full font-medium transition-all duration-300',
              selectedCategory === category
                ? 'bg-visrec-orange text-visrec-pearl shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
            ]"
          >
            {{ category }}
          </button>
        </div>
      </div>
    </section>

    <!-- Works Grid -->
    <section class="container mx-auto px-4 py-16">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-500">Loading works...</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredWorks.length === 0" class="text-center py-20">
        <p class="text-xl text-gray-500">No works found in this category.</p>
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="(work, index) in filteredWorks"
          :key="work.id"
          v-animate-on-scroll="index * 100"
          class="group bg-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-700"
        >
          <!-- Cover Image - Rectangle -->
          <NuxtLink :to="`/work/${work.slug || work.id}`" class="block">
            <div class="relative aspect-[4/3] overflow-hidden bg-visrec-gray">
              <img
                v-if="work.coverImage"
                :src="work.coverImage"
                :alt="work.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <span class="text-4xl">📷</span>
              </div>
              
              <!-- Category Badges -->
              <div class="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
                <span 
                  v-for="cat in (work.categories || [work.category])" 
                  :key="cat"
                  :class="[
                    'px-2 py-1 text-xs font-semibold rounded-md shadow-sm',
                    getCategoryColor(cat)
                  ]"
                >
                  {{ cat }}
                </span>
              </div>

              <!-- Play Button Overlay -->
              <div 
                v-if="work.videoUrl"
                class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 z-20"
                @click.prevent="openVideo(work)"
              >
                <div class="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 hover:bg-visrec-orange hover:text-white text-visrec-gray cursor-pointer">
                  <svg class="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </NuxtLink>

          <!-- Content -->
          <div class="p-5">
            <!-- Title -->
            <NuxtLink :to="`/work/${work.slug || work.id}`">
              <h3 class="text-lg font-bold text-visrec-gray mb-3 line-clamp-2  transition-colors">
                {{ work.title }}
              </h3>
            </NuxtLink>

            <!-- CTA Button -->
            <NuxtLink
              :to="`/work/${work.slug || work.id}`"
              class="inline-flex items-center justify-center w-full px-4 py-2.5 bg-visrec-gray text-visrec-pearl text-sm font-semibold rounded-lg transition-all duration-300 group-hover:shadow-lg hover:opacity-90"
            >
              <span>{{ $t('work.ui.viewProject') }}</span>
              <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
    <!-- Video Modal -->
    <VideoModal
      :is-open="showVideoModal"
      :video-url="currentVideoUrl"
      :video-type="currentVideoType"
      @close="showVideoModal = false"
    />
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 1s ease-out;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(0, 20px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float 8s ease-in-out infinite;
  animation-delay: 2s;
}
</style>
