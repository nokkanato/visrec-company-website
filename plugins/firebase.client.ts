import { initializeApp } from 'firebase/app'
import { getStorage } from 'firebase/storage'

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()

    const firebaseConfig = {
        apiKey: config.public.firebaseApiKey,
        authDomain: config.public.firebaseAuthDomain,
        projectId: config.public.firebaseProjectId,
        storageBucket: config.public.firebaseStorageBucket,
        messagingSenderId: config.public.firebaseMessagingSenderId,
        appId: config.public.firebaseAppId
    }

    // Initialize Firebase
    const app = initializeApp(firebaseConfig)
    const storage = getStorage(app)

    return {
        provide: {
            storage
        }
    }
})
