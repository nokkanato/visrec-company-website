<script setup>
const { t } = useI18n()
useHead({
  title: t('seo.homepage.title'),
  meta: [
    { name: 'description', content: t('seo.homepage.description') },
    { name: 'keywords', content: t('seo.homepage.keywords') }
  ]
})

// Scroll animation setup
const section1Ref = ref(null)
const section2Ref = ref(null)
const section3Ref = ref(null)

const isSection1Visible = ref(false)
const isSection2Visible = ref(false)
const isSection3Visible = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // Only trigger animation once when element comes into view
        if (entry.isIntersecting) {
          if (entry.target === section1Ref.value && !isSection1Visible.value) {
            isSection1Visible.value = true
          } else if (entry.target === section2Ref.value && !isSection2Visible.value) {
            isSection2Visible.value = true
          } else if (entry.target === section3Ref.value && !isSection3Visible.value) {
            isSection3Visible.value = true
          }
        }
      })
    },
    { threshold: 0.2 }
  )

  if (section1Ref.value) observer.observe(section1Ref.value)
  if (section2Ref.value) observer.observe(section2Ref.value)
  if (section3Ref.value) observer.observe(section3Ref.value)
})

// Mock client logos - replace with actual Firebase storage URLs
const clients = [
  { name: 'Client 1', logo: 'https://via.placeholder.com/150x80/333/fff?text=Client+1' },
  { name: 'Client 2', logo: 'https://via.placeholder.com/150x80/333/fff?text=Client+2' },
  { name: 'Client 3', logo: 'https://via.placeholder.com/150x80/333/fff?text=Client+3' },
  { name: 'Client 4', logo: 'https://via.placeholder.com/150x80/333/fff?text=Client+4' },
  { name: 'Client 5', logo: 'https://via.placeholder.com/150x80/333/fff?text=Client+5' },
  { name: 'Client 6', logo: 'https://via.placeholder.com/150x80/333/fff?text=Client+6' },
];

// New items array for slider
const items = [
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/mock%2FScreenshot%202568-03-27%20at%2014.33.08.png?alt=media&token=93c898c1-1eb4-49a5-8bce-707afbb640dc',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/mock%2FScreenshot%202568-03-27%20at%2014.33.19.png?alt=media&token=e31e6261-a10a-4dc8-ba94-174df1651aa1',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/mock%2FScreenshot%202568-03-27%20at%2014.33.30.png?alt=media&token=b9e67fb3-9000-4283-a01f-dce89dacffc2',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/mock%2FScreenshot%202568-03-27%20at%2014.33.42.png?alt=media&token=9e320459-f5c4-44ae-8aba-ce528906b42d',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/mock%2FScreenshot%202568-03-27%20at%2014.33.58.png?alt=media&token=09dca859-b6df-4dee-8b17-7f08dc38c4f5',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/mock%2FScreenshot%202568-03-27%20at%2014.34.12.png?alt=media&token=6f1c18b2-69f0-4299-abdf-02ba5a267892',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/mock%2FScreenshot%202568-03-27%20at%2014.34.32.png?alt=media&token=728f2da9-7aab-4143-be9d-38d47764a3',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/mock%2FScreenshot%202568-03-27%20at%2014.35.00.png?alt=media&token=6fed4d67-a554-4bb1-a897-620d1caba02d',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/mock%2FScreenshot%202568-03-27%20at%2014.35.13.png?alt=media&token=2971d756-c95c-4bcf-8240-79c0ebdd02b9',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/mock%2FScreenshot%202568-03-27%20at%2014.37.21.png?alt=media&token=334ca0c5-9183-492a-9c5e-694d6ec9cf58',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/mock%2FScreenshot%202568-03-27%20at%2014.41.52.png?alt=media&token=ee261276-18e7-4172-b5d5-b7f602977527'
];

const logos = [
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/logo%2F1.png?alt=media&token=b74c3f77-807e-4ea2-b454-670914100258',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/logo%2F2.png?alt=media&token=3b5d5030-8719-4d69-a6fe-8909f72c7456',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/logo%2Fvml.png?alt=media&token=ae73ec64-394d-4bbe-8cf6-80c21ab363ee',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/logo%2F4.png?alt=media&token=15568610-3ab9-4b77-beae-cb0876287655',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/logo%2Fnt.png?alt=media&token=e3cf9ff0-a50b-4113-8772-c936a70b3834',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/logo%2Fmeta.png?alt=media&token=48c65263-6441-4da8-9fe1-5f3c90cf6cc3',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/logo%2Fkfc.png?alt=media&token=242b1961-bd09-459b-a2cd-a77a5aba1842',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/logo%2Flays.png?alt=media&token=0c266321-3b6d-417e-8493-b8fde0904e71',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/logo%2Ftopsfoodhall.png?alt=media&token=38ba4e73-6ae2-47fc-8b7c-fe6a43326381',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/logo%2Fnestle.png?alt=media&token=2852ac51-88da-425e-a0af-9e959e9549ee',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/logo%2Fngg.png?alt=media&token=7e4742e3-c638-465a-98dd-7fdd940f0ff2',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/logo%2Fyakinikulike.png?alt=media&token=d646303d-66f3-435f-ad1b-37b5f92f8622',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/logo%2Fsripanpri.png?alt=media&token=e83929e3-5d80-416d-8721-2d61e2531dff',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/logo%2Fmitsubishi.png?alt=media&token=e6b9b0db-c722-4a4e-b6fc-c80b6d68f2fc',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/logo%2F16.png?alt=media&token=664dbebe-4e08-4b8d-93c5-991490c3af72',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/logo%2Fthaipost.png?alt=media&token=252e7671-817a-4a13-b9fb-cc5c0bc4f328',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/logo%2F20.png?alt=media&token=62c58820-3b18-4555-824d-5b5527fd6156',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/logo%2F19.png?alt=media&token=db6f4a3e-fbd1-45b7-bc92-f14de2c82f80',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/logo%2F21.png?alt=media&token=8865a446-0f2a-4e3d-a2db-dc686a62dc96',
  'https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/logo%2Fdragonfly.png?alt=media&token=f702a549-b452-4ffd-afee-d2311fdd2b42'
];
</script>

<template>

  <!-- New Section 1: Hero Text & Slider -->
  <section class="bg-visrec-gray  flex-1 pt-8 md:pt-20 bg-cover bg-center bg-no-repeat">
    <div class="relative z-10 px-6 py-8 md:py-20 md:max-w-[90%] mx-auto flex flex-col md:flex-row gap-8 items-center">
      <!-- Left text block -->
      <div ref="section1Ref" class="w-full md:w-[50%] xl:w-[40%]" :class="{ 'animate-fade-in-up': isSection1Visible }">
        <h1 class="text-xl md:text-4xl sm:text-6xl font-bold leading-tight">
          <span class="text-3xl md:text-5xl text-visrec-orange inline-block">VisRec</span>{{ $t('homepage.section1.title') }}
        </h1>
        <p class="mt-6 text-lg text-gray-300">
          {{ $t('homepage.section1.description') }}
        </p>
        <div class="mt-6 flex gap-4">
          <button class="bg-visrec-orange cursor-pointer text-visrec-pearl px-3 md:px-6 py-2 rounded-full font-bold hover:bg-gray-200 hover:scale-105 transition-all duration-300 text-md md:text-xl">{{ $t('homepage.section1.contact') }}</button>
          <button class="border-2 cursor-pointer text-white px-3 md:px-6 py-2 rounded-full font-medium hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 md:text-xl">{{ $t('homepage.section1.services') }}</button>
        </div>
      </div>

      <!-- Right image block -->
      <div class="w-full md:w-[60%] hidden md:block">
        <img src="https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/bg-vr.png?alt=media&token=3669f437-e1ab-4d42-b3bc-318f00c5b8cb" alt="Studio visual" class="rounded-xl  w-full h-auto" />
      </div>
    </div>
    <!-- Slider -->
    <div class="relative w-full overflow-hidden">
      <div ref="slider" class="flex gap-4 whitespace-nowrap transition-transform duration-500 ease-in-out overflow-x-auto scroll-smooth">
        <div v-for="(item, index) in items" :key="index" class="min-w-[250px] h-40 bg-gray-200 rounded-lg overflow-hidden shadow-md">
          <img :src="item" alt="Slide Image" class="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  </section>

  <!-- Section 2: Client Showcase -->
  <section class="bg-visrec-pearl text-visrec-gray md:px-6  sm:py-16 mt-16 sm:mt-10 rounded-[20px] sm:rounded-[50px]">
    <div ref="section2Ref" class=" sm:py-12 py-4" :class="{ 'animate-fade-in-up': isSection2Visible }">
      <div class="mx-auto max-w-[90%]  px-0 md:px-8">
        <h2 class="text-center text:md lg:text-xl  sm:text-lg/8 font-semibold text-gray-900" v-html="$t('homepage.section2.title')"></h2>
        <!-- Mobile  Slider -->
        <div class="block sm:hidden py-12 px-4 relative w-full overflow-hidden">
          <div
            ref="sliderr"
            class="flex gap-6  whitespace-nowrap transition-transform duration-100 ease-in-out overflow-x-auto scroll-smooth"
          >
            <div
              v-for="(item, index) in logos"
              :key="index"
              class="min-w-[100px] h-[100px]  gap-6  overflow-hidden "
            >
              <img
                :src="item"
                alt="Slide Image"
                class="w-full h-full object-contain filter grayscale hover:grayscale-0 transition"
              />
            </div>
          </div>
        </div>
        <!-- Desktop -->
        <div class="hidden sm:block pt-6">
          <div class=" grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
            <div
              v-for="(logo, index) in logos"
              :key="index"
              class="flex items-center justify-center p-2 md:p-4  rounded "
            >
              <img
                :src="logo"
                alt="Client Logo"
                class="max-h-24 object-contain grayscale hover:grayscale-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 3: Partnership -->
  <section class="bg-visrec-gray rounded-t-[50px] flex-1  ">
    <div class="relative z-10 px-6 py-20  md:max-w-[90%] mx-auto flex flex-col md:flex-row gap-8 items-center">
      <div class="w-full lg:w-[60%] block sm:hidden">
        <h1 class="text-xl pb-12 md:text-4xl sm:text-6xl text-visrec-pearl font-bold leading-tight ">
          <span class="text-3xl md:text-5xl text-visrec-orange">VisRec</span>{{ $t('homepage.section3.title') }}
        </h1>
        <img src="https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/IMG_6443.jpg?alt=media&token=6a2d8a64-b5ce-4c76-8e87-47369e07bb4b" alt="Studio visual" class="grayscale rounded-xl  w-full h-auto" />
      </div>
      <!-- Left text block -->
      <div ref="section3Ref" class="w-full md:w-[50%]  xl:w-[40%]" :class="{ 'animate-fade-in-up': isSection3Visible }">
        <h1 class="hidden sm:block text-visrec-pearl text-xl md:text-4xl sm:text-6xl font-bold leading-tight ">
          <span class="text-3xl md:text-5xl text-visrec-orange">VisRec</span>{{ $t('homepage.section3.title') }}
        </h1>
        <p class="mt-6 text:md sm:text-lg text-visrec-pearl">
          {{ $t('homepage.section3.description') }}<br />
        </p>
        <div class="mt-6 flex gap-4">
          <button class="bg-visrec-orange cursor-pointer text-visrec-pearl px-3 md:px-6 py-2 rounded-full font-bold hover:bg-gray-200 hover:scale-105 transition-all duration-300 text-md md:text-xl">{{ $t('homepage.section3.works') }}</button>
          <button class="border-2 cursor-pointer text-white px-3 md:px-6 py-2 rounded-full font-medium hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 md:text-xl">{{ $t('homepage.section3.contact') }}</button>
        </div>
      </div>

      <!-- Right image block -->
      <div class="w-full md:w-[50%] lg:w-[60%] hidden md:block">
        <img src="https://firebasestorage.googleapis.com/v0/b/visual-record.firebasestorage.app/o/IMG_6443.jpg?alt=media&token=6a2d8a64-b5ce-4c76-8e87-47369e07bb4b" alt="Studio visual" class="grayscale rounded-xl  w-full h-auto" />
      </div>
    </div>
  </section>

</template>
