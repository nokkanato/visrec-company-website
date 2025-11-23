<script setup>
import { ref } from 'vue'

useHead({
  title: 'Contact - VisRec Studio',
  meta: [
    { name: 'description', content: 'Get in touch with VisRec Studio for your next video production project.' }
  ]
})

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const handleSubmit = () => {
  const subject = encodeURIComponent(`[Inquiry] ${form.value.subject}`)
  const body = encodeURIComponent(`Name: ${form.value.name}\nEmail: ${form.value.email}\n\nMessage:\n${form.value.message}`)
  window.location.href = `mailto:sattamate@visrec.studio?subject=${subject}&body=${body}`
}

// Animation directive
const vAnimateOnScroll = {
  mounted: (el, binding) => {
    el.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-700')
    if (binding.value) el.style.transitionDelay = `${binding.value}ms`
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.classList.remove('opacity-0', 'translate-y-8')
          el.classList.add('opacity-100', 'translate-y-0')
          observer.unobserve(el)
        }
      })
    }, { threshold: 0.1 })
    observer.observe(el)
  }
}
</script>

<template>
  <div class="min-h-screen bg-visrec-gray text-visrec-pearl pt-20">
    <div class="container mx-auto px-4 py-12 md:py-24">
      
      <!-- Header -->
      <div class="text-center mb-16 md:mb-24">
        <h1 
          v-animate-on-scroll="0"
          class="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-visrec-orange to-white"
        >
          Let's Talk
        </h1>
        <p 
          v-animate-on-scroll="200"
          class="text-xl text-gray-400 max-w-2xl mx-auto"
        >
          Have a project in mind? We'd love to hear from you.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 max-w-6xl mx-auto">
        
        <!-- Contact Info -->
        <div v-animate-on-scroll="300" class="space-y-12">
          <div>
            <h3 class="text-2xl font-bold text-visrec-orange mb-4">Contact Details</h3>
            <div class="space-y-4 text-lg text-gray-300">
              <p class="flex items-center gap-3">
                <svg class="w-6 h-6 text-visrec-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <a href="mailto:sattamate@visrec.studio" class="hover:text-white transition-colors">sattamate@visrec.studio</a>
              </p>
              <p class="flex items-center gap-3">
                <svg class="w-6 h-6 text-visrec-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <span>Bangkok, Thailand</span>
              </p>
            </div>
          </div>

          <div>
            <h3 class="text-2xl font-bold text-visrec-orange mb-4">Follow Us</h3>
            <div class="flex gap-6">
              <a href="https://www.facebook.com/visrec.studio" target="_blank" class="w-12 h-12 rounded-full bg-white bg-opacity-10 flex items-center justify-center hover:bg-visrec-orange hover:text-white transition-all duration-300">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.instagram.com/visrec" target="_blank" class="w-12 h-12 rounded-full bg-white bg-opacity-10 flex items-center justify-center hover:bg-visrec-orange hover:text-white transition-all duration-300">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Contact Form -->
        <div v-animate-on-scroll="400" class="bg-white bg-opacity-5 p-8 rounded-2xl border border-white border-opacity-10">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Name</label>
              <input 
                v-model="form.name"
                type="text" 
                required
                class="w-full bg-black bg-opacity-30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-visrec-orange focus:ring-1 focus:ring-visrec-orange transition-colors"
                placeholder="Your Name"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <input 
                v-model="form.email"
                type="email" 
                required
                class="w-full bg-black bg-opacity-30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-visrec-orange focus:ring-1 focus:ring-visrec-orange transition-colors"
                placeholder="your@email.com"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Subject</label>
              <input 
                v-model="form.subject"
                type="text" 
                required
                class="w-full bg-black bg-opacity-30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-visrec-orange focus:ring-1 focus:ring-visrec-orange transition-colors"
                placeholder="Project Inquiry"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Message</label>
              <textarea 
                v-model="form.message"
                rows="4" 
                required
                class="w-full bg-black bg-opacity-30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-visrec-orange focus:ring-1 focus:ring-visrec-orange transition-colors"
                placeholder="Tell us about your project..."
              ></textarea>
            </div>

            <button 
              type="submit"
              class="w-full bg-visrec-orange text-white font-bold py-4 rounded-lg hover:bg-white hover:text-visrec-orange transition-all duration-300 shadow-lg transform hover:-translate-y-1"
            >
              Send Message
            </button>
          </form>
        </div>

      </div>
    </div>
  </div>
</template>
