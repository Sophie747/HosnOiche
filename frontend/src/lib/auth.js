import { ref } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'

export function useSafeAuth0() {
  const hasAuth0Config = Boolean(import.meta.env.VITE_AUTH0_DOMAIN && import.meta.env.VITE_AUTH0_CLIENT_ID)

  if (!hasAuth0Config) {
    return {
      isLoading: ref(false),
      isAuthenticated: ref(false),
      error: ref(null),
      user: ref(null),
      loginWithRedirect: () => {
        console.warn('Auth0 is not configured. Set VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID first.')
      },
      logout: () => {
        // no-op when Auth0 is not configured
      },
    }
  }

  return useAuth0()
}
