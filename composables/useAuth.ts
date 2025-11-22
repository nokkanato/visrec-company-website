import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, type User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

export const useAuth = () => {
    const nuxtApp = useNuxtApp()
    const user = useState<User | null>('user', () => null)
    const isAllowed = useState<boolean>('isAllowed', () => false)
    const loading = useState<boolean>('authLoading', () => true)

    // Check if user is in allowlist with active: true
    const checkAllowlist = async (email: string): Promise<boolean> => {
        if (!process.client || !nuxtApp.$db) return false

        try {
            const allowlistRef = doc(nuxtApp.$db, 'allowlist', email)
            const allowlistSnap = await getDoc(allowlistRef)

            if (allowlistSnap.exists()) {
                const data = allowlistSnap.data()
                return data.active === true
            }
            return false
        } catch (error) {
            console.error('Error checking allowlist:', error)
            return false
        }
    }

    // Initialize auth state listener
    const initAuth = () => {
        if (!process.client || !nuxtApp.$auth) {
            loading.value = false
            return
        }

        onAuthStateChanged(nuxtApp.$auth, async (firebaseUser) => {
            user.value = firebaseUser

            if (firebaseUser && firebaseUser.email) {
                isAllowed.value = await checkAllowlist(firebaseUser.email)
            } else {
                isAllowed.value = false
            }

            loading.value = false
        })
    }

    // Login with Google
    const loginWithGoogle = async () => {
        if (!process.client || !nuxtApp.$auth) {
            throw new Error('Auth not available')
        }

        try {
            const provider = new GoogleAuthProvider()
            const result = await signInWithPopup(nuxtApp.$auth, provider)

            if (result.user.email) {
                const allowed = await checkAllowlist(result.user.email)

                if (!allowed) {
                    await signOut(nuxtApp.$auth)
                    throw new Error('You are not authorized to access the admin panel.')
                }

                return result.user
            }
        } catch (error: any) {
            console.error('Login error:', error)
            throw error
        }
    }

    // Logout
    const logout = async () => {
        if (!process.client || !nuxtApp.$auth) return

        try {
            await signOut(nuxtApp.$auth)
            user.value = null
            isAllowed.value = false
        } catch (error) {
            console.error('Logout error:', error)
            throw error
        }
    }

    return {
        user,
        isAllowed,
        loading,
        loginWithGoogle,
        logout,
        initAuth
    }
}
