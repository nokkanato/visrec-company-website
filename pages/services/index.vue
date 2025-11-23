<script setup>
import { onMounted, computed } from 'vue'

const { t } = useI18n()
const localePath = useLocalePath()

// Custom directive for scroll animations (reused from work page)
const vAnimateOnScroll = {
  mounted: (el, binding) => {
    el.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-700')
    
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

const scopeOfWorks = computed(() => [
  {
    id: '01',
    title: t('services.scope.step1.title'),
    description: t('services.scope.step1.desc')
  },
  {
    id: '02',
    title: t('services.scope.step2.title'),
    description: t('services.scope.step2.desc')
  },
  {
    id: '03',
    title: t('services.scope.step3.title'),
    description: t('services.scope.step3.desc')
  },
  {
    id: '04',
    title: t('services.scope.step4.title'),
    description: t('services.scope.step4.desc')
  }
])

const services = computed(() => [
  {
    id: '01',
    title: t('services.overview.cat1.title'),
    items: [
      {
        label: t('services.overview.cat1.item1'),
        subItems: [t('services.overview.cat1.sub1_1'), t('services.overview.cat1.sub1_2')]
      },
      {
        label: t('services.overview.cat1.item2')
      }
    ]
  },
  {
    id: '02',
    title: t('services.overview.cat2.title'),
    items: [
      { label: t('services.overview.cat2.item1') }
    ]
  },
  {
    id: '03',
    title: t('services.overview.cat3.title'),
    items: [
      { label: t('services.overview.cat3.item1') },
      { label: t('services.overview.cat3.item2') },
      { label: t('services.overview.cat3.item3') },
      { label: t('services.overview.cat3.item4') }
    ]
  },
  {
    id: '04',
    title: t('services.overview.cat4.title'),
    items: [
      { label: t('services.overview.cat4.item1') },
      { label: t('services.overview.cat4.item2') },
      { label: t('services.overview.cat4.item3') },
      { label: t('services.overview.cat4.item4') }
    ]
  },
  {
    id: '05',
    title: t('services.overview.cat5.title'),
    items: [
      { label: t('services.overview.cat5.item1') },
      { label: t('services.overview.cat5.item2') }
    ]
  },
  {
    id: '06',
    title: t('services.overview.cat6.title'),
    items: [
      { label: t('services.overview.cat6.item1') },
      { label: t('services.overview.cat6.item2') },
      { label: t('services.overview.cat6.item3') }
    ]
  }
])

useHead({
  title: t('services.hero.title') + ' - VisRec Studio',
  meta: [
    { name: 'description', content: t('services.hero.subtitle') }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-visrec-gray text-visrec-pearl overflow-hidden">
    <!-- Hero Section -->
    <section class="relative py-20 md:py-32 container mx-auto px-4">
      <div class="max-w-4xl mx-auto text-center">
        <h1 
          v-animate-on-scroll="0"
          class="text-6xl md:text-8xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-visrec-orange to-orange-300"
        >
          {{ $t('services.hero.title') }}
        </h1>
        <p 
          v-animate-on-scroll="200"
          class="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto"
        >
          {{ $t('services.hero.subtitle') }}
        </p>
      </div>

      <!-- Decorative Bubbles -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-visrec-orange opacity-5 rounded-full -mr-32 -mt-32 animate-float"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-visrec-orange opacity-5 rounded-full -ml-48 -mb-48 animate-float-delayed"></div>
    </section>

    <!-- Scope of Works -->
    <section class="py-16 bg-black bg-opacity-20">
      <div class="container mx-auto px-4">
        <h2 
          v-animate-on-scroll="0"
          class="text-4xl md:text-5xl font-bold text-visrec-orange mb-16 text-center uppercase tracking-wide"
        >
          {{ $t('services.scope.title') }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          <!-- Connecting Line (Desktop) -->
          <div class="hidden lg:block absolute top-8 left-0 w-full h-0.5 bg-gradient-to-r from-visrec-orange via-orange-500 to-visrec-orange opacity-30"></div>

          <div 
            v-for="(step, index) in scopeOfWorks" 
            :key="step.id"
            v-animate-on-scroll="index * 150"
            class="relative group"
          >
            <!-- Step Number -->
            <div class="w-16 h-16 bg-visrec-gray border-2 border-visrec-orange rounded-full flex items-center justify-center text-2xl font-bold text-visrec-orange mb-6 mx-auto relative z-10 group-hover:bg-visrec-orange group-hover:text-visrec-pearl transition-colors duration-300 shadow-[0_0_20px_rgba(233,68,46,0.3)]">
              {{ step.id }}
            </div>
            
            <div class="text-center px-4">
              <h3 class="text-xl font-bold text-white mb-3">{{ step.title }}</h3>
              <p class="text-gray-400 text-sm leading-relaxed">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Overview -->
    <section class="py-24 container mx-auto px-4">
      <h2 
        v-animate-on-scroll="0"
        class="text-4xl md:text-5xl font-bold text-visrec-orange mb-16 text-center uppercase tracking-wide"
      >
        {{ $t('services.overview.title') }}
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="(service, index) in services" 
          :key="service.id"
          v-animate-on-scroll="index * 100"
          class="bg-white bg-opacity-5 rounded-xl p-8 hover:bg-opacity-10 transition-all duration-300 border border-white border-opacity-5 hover:border-visrec-orange hover:border-opacity-50 group"
        >
          <div class="flex items-start justify-between mb-6">
            <h3 class="text-xl font-bold text-visrec-orange uppercase tracking-wider group-hover:text-white transition-colors">
              <span class="text-sm opacity-50 block mb-1">{{ service.id }}</span>
              {{ service.title }}
            </h3>
          </div>

          <ul class="space-y-3">
            <li v-for="(item, i) in service.items" :key="i" class="text-gray-300 text-sm">
              <div class="font-medium">{{ item.label }}</div>
              <ul v-if="item.subItems" class="pl-4 mt-1 space-y-1 border-l border-gray-700">
                <li v-for="sub in item.subItems" :key="sub" class="text-gray-500 text-xs">
                  {{ sub }}
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20 text-center">
      <div v-animate-on-scroll="0">
        <h2 class="text-3xl font-bold mb-8">{{ $t('services.cta.title') }}</h2>
        <NuxtLink 
          :to="localePath('/contact')" 
          class="inline-block bg-visrec-orange text-visrec-pearl px-10 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-visrec-orange transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          {{ $t('services.cta.button') }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.animate-float {
  animation: float 6s ease-in-out infinite;
}
.animate-float-delayed {
  animation: float 6s ease-in-out infinite 3s;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}
</style>
