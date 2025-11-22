export default defineNuxtRouteMiddleware((to, from) => {
    // Skip middleware for login page
    if (to.path.includes('/admin/login')) {
        return
    }

    const { user, isAllowed, loading } = useAuth()

    // Wait for auth to initialize
    if (loading.value) {
        return
    }

    // If not logged in, redirect to login
    if (!user.value) {
        return navigateTo('/admin/login')
    }

    // If logged in but not in allowlist, redirect to login with error
    if (!isAllowed.value) {
        return navigateTo('/admin/login')
    }
})
