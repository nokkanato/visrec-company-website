<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  videoUrl: String,
  videoType: String
})

const emit = defineEmits(['close'])

// Close on escape key
const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

// Lock body scroll when open
watch(() => props.isOpen, (val) => {
  if (process.client) {
    document.body.style.overflow = val ? 'hidden' : ''
    if (val) {
      window.addEventListener('keydown', handleKeydown)
    } else {
      window.removeEventListener('keydown', handleKeydown)
    }
  }
})

// Extract video ID/Embed URL
const embedUrl = computed(() => {
  if (!props.videoUrl) return ''

  if (props.videoType === 'youtube') {
    // Handle youtube.com/watch?v=ID and youtu.be/ID
    let id = ''
    if (props.videoUrl.includes('v=')) {
      id = props.videoUrl.split('v=')[1].split('&')[0]
    } else if (props.videoUrl.includes('youtu.be/')) {
      id = props.videoUrl.split('youtu.be/')[1].split('?')[0]
    }
    return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`
  }

  if (props.videoType === 'vimeo') {
    // Handle vimeo.com/ID
    const id = props.videoUrl.split('vimeo.com/')[1].split('/')[0]
    return `https://player.vimeo.com/video/${id}?autoplay=1`
  }

  if (props.videoType === 'facebook') {
    // Use Facebook Embed Player
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(props.videoUrl)}&show_text=0&autoplay=1`
  }

  return ''
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
        @click.self="emit('close')"
      >
        <!-- Close Button -->
        <button 
          @click="emit('close')"
          class="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50 p-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Video Container -->
        <div class="w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl relative">
          <iframe
            v-if="embedUrl"
            :src="embedUrl"
            class="w-full h-full absolute inset-0"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
          <div v-else class="flex items-center justify-center h-full text-white">
            <p>Video URL not supported</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
