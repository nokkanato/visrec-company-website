<script setup>
const { locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

useHead({
  bodyAttrs: {
    class: 'bg-visrec-orange'
  },
  link: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: '/assets/favicon/vrblack.svg'
    },
    ...computed(() => {
      return locales.value.map(l => ({
        rel: 'alternate',
        hreflang: l.iso,
        href: `https://visrec.com${switchLocalePath(l.code)}`
      }))
    }).value
  ]
})
</script>

<template>
  <div class="bg-visrec-gray min-h-screen">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
