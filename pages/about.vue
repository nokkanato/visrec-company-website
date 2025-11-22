<script setup>
useHead({
  title: 'About - VisRec Studio',
  meta: [
    { name: 'description', content: 'Learn about VisRec Studio - Bangkok-based production company' }
  ]
})

// Team members data
const team = ref([
  {
    name: 'Sattamate Karnasuta',
    role: 'General Manager',
    gray: 'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/employee%2Fdann1.jpg?alt=media&token=ad17735f-3081-45d8-aaa0-d2a90f9dcdac',
    color: 'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/employee%2Fdann1.jpg?alt=media&token=ad17735f-3081-45d8-aaa0-d2a90f9dcdac'
  },
  {
    name: 'Atulit Kwatra',
    role: 'Director / Screen Writer',
    gray: 'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/employee%2Fak1.jpg?alt=media&token=9e62b6fa-ea87-491f-9e5a-ea9b8ba18be9',
    color: 'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/employee%2Fak2.jpg?alt=media&token=6dcfaa6b-0f88-42c2-beac-12b39398f203'
  },
  {
    name: 'Kanokpatai Kanato',
    role: 'Strategist',
    gray: 'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/employee%2Fnok1.JPG?alt=media&token=cebbc7bb-5e14-451b-94ba-c0bf91e3b8c9',
    color: 'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/employee%2Fnok1.JPG?alt=media&token=cebbc7bb-5e14-451b-94ba-c0bf91e3b8c9'
  },
  {
    name: 'Joshua D Smith',
    role: 'Production Manager',
    gray: 'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/employee%2Fjosh11.jpg?alt=media&token=a46ae33a-7c38-409c-afcc-c5ce119d73f5',
    color: 'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/employee%2Fjosh1.jpg?alt=media&token=32fbb9e1-115b-401f-9961-f1707f1e2984'
  }
])

// Scroll animation setup
const section1Ref = ref(null)
const section2Ref = ref(null)
const section3Ref = ref(null)
const section4Ref = ref(null)
const isSection1Visible = ref(false)
const isSection2Visible = ref(false)
const isSection3Visible = ref(false)
const isSection4Visible = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === section1Ref.value && !isSection1Visible.value) {
            isSection1Visible.value = true
          } else if (entry.target === section2Ref.value && !isSection2Visible.value) {
            isSection2Visible.value = true
          } else if (entry.target === section3Ref.value && !isSection3Visible.value) {
            isSection3Visible.value = true
          } else if (entry.target === section4Ref.value && !isSection4Visible.value) {
            isSection4Visible.value = true
          }
        }
      })
    },
    { threshold: 0.2 }
  )

  if (section1Ref.value) observer.observe(section1Ref.value)
  if (section2Ref.value) observer.observe(section2Ref.value)
  if (section3Ref.value) observer.observe(section3Ref.value)
  if (section4Ref.value) observer.observe(section4Ref.value)
})
</script>

<template>
  <!-- Section 1: Introduction -->
  <section class="bg-visrec-pearl pt-2 pt-10 pb-16  md:py-16 px-4">
    <div ref="section1Ref" class="max-w-7xl pt-8 md:pt-24 mx-auto grid md:grid-cols-2 gap-8 items-center" :class="{ 'animate-fade-in-up': isSection1Visible }">
      <!-- Text Block -->
      <div class="space-y-6">
        <h2 class="text-4xl font-bold text-gray-900">{{ $t('about.section1.title') }}</h2>
        <p class="text-gray-700 leading-relaxed text-xl">
          {{ $t('about.section1.description') }}
        </p>
      </div>

      <!-- Image Block -->
      <div class="rounded-md">
        <img
          src="https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/about%2Fabout1.png?alt=media&token=298fb8ff-c042-4725-87c4-15ed729a6afd"
          alt="Camera screen"
          class="w-full h-auto object-cover rounded-md shadow-md grayscale contrast-[1.2] brightness-[1.1]"
        />
      </div>
    </div>
  </section>

  <!-- Section 2: Our Team -->
  <div class="bg-visrec-gray  h-[100%] ">
    <div class="bg-visrec-pearl">
      <section class=" bg-visrec-gray rounded-[50px] py-4 md:py-14 px-4">
        <div ref="section2Ref" class="max-w-6xl mx-auto pt-4 md:pt-4 text-center" :class="{ 'animate-fade-in-up': isSection2Visible }">
          <h2 class="text-4xl font-extrabold text-visrec-orange mb-12">{{ $t('about.section2.title') }}</h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div
              v-for="(member, index) in team"
              :key="index"
              class="cursor-pointer group relative flex flex-col items-center text-center rounded-lg overflow-hidden"
            >
              <!-- Wrapper for hover image swap -->
              <div class="relative w-full h-72">
                <!-- Grayscale Image (default) -->
                <img
                  :src="member.gray"
                  alt="Grayscale"
                  class="absolute inset-0 w-full h-full object-cover filter grayscale transition-opacity duration-500 opacity-100 group-hover:opacity-0"
                />
                <!-- Color Image (on hover) -->
                <img
                  :src="member.color"
                  alt="Color"
                  class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                />
              </div>

              <h3 class="mt-4 text-lg font-semibold text-visrec-pearl">{{ member.name }}</h3>
              <p class="text-gray-300">{{ member.role }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>

  <!-- Section 3: Why VisRec? -->
  <section class="bg-visrec-pearl pt-4 md:pt-24">
    <div ref="section3Ref" :class="{ 'animate-fade-in-up': isSection3Visible }">
      <!-- Top image with grain effect -->
      <div class="flex justify-center">
        <div class="w-full max-w-7xl rounded-md hidden md:block">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/about%2Fabout22.png?alt=media&token=b9d44429-5a74-4600-b0d4-f42637b9c4bb"
            alt="Why VisRec"
            class="w-full h-auto object-cover grayscale contrast-[1.2] brightness-[1.1]"
          />
        </div>
      </div>

      <!-- Text block -->
      <div class="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 px-6 py-16">
        <!-- Left Heading -->
        <div class="md:col-span-1">
          <h2 class="text-4xl font-bold text-gray-900 leading-tight">
            {{ $t('about.section3.title1') }} <br />
            {{ $t('about.section3.title2') }}
          </h2>
        </div>

        <!-- Right List -->
        <div class="md:col-span-2 space-y-8 text-md md:text-xl">
          <div class="flex items-start gap-4">
            <div class="text-visrec-orange font-semibold text-xl md:text-2xl">①</div>
            <p class="text-gray-800">
              {{ $t('about.section3.point1') }}
            </p>
          </div>

          <div class="flex items-start gap-4">
            <div class="text-visrec-orange font-semibold text-xl md:text-2xl">②</div>
            <p class="text-gray-800">
              {{ $t('about.section3.point2') }}
            </p>
          </div>

          <div class="flex items-start gap-4">
            <div class="text-visrec-orange font-semibold text-xl md:text-2xl">③</div>
            <p class="text-gray-800">
              {{ $t('about.section3.point3') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
  <!-- Section 4: Get in Touch -->
  <section class="bg-visrec-pearl py-16 md:py-32 px-4">
    <div ref="section4Ref" class="max-w-4xl mx-auto text-center space-y-8" :class="{ 'animate-fade-in-up': isSection4Visible }">
      <h2 class="text-4xl md:text-6xl font-bold text-gray-900">{{ $t('about.section4.h2') }}</h2>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        {{ $t('about.section4.p') }}
      </p>
      <a
        href="mailto:sattamate@visrec.studio"
        class="inline-block bg-visrec-orange text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-red-600 transition-colors duration-300"
      >
        {{ $t('about.section4.button') }}
      </a>
    </div>
  </section>
</template>
