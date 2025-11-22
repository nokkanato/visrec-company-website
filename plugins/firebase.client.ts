import { initializeApp } from 'firebase/app'
import { getStorage } from 'firebase/storage'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()

    const firebaseConfig = {
        apiKey: config.public.firebaseApiKey as string,
        authDomain: config.public.firebaseAuthDomain as string,
        projectId: config.public.firebaseProjectId as string,
        storageBucket: config.public.firebaseStorageBucket as string,
        messagingSenderId: config.public.firebaseMessagingSenderId as string,
        appId: config.public.firebaseAppId as string
    }

    // Initialize Firebase
    const app = initializeApp(firebaseConfig)
    const storage = getStorage(app)
    const db = getFirestore(app)
    const auth = getAuth(app)

    return {
        provide: {
            storage,
            db,
            auth
        }
    }
})
