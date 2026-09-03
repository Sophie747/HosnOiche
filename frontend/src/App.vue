<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useGameStore } from '@/stores/gameStore'
import { useAuth0 } from '@auth0/auth0-vue'

const store = useGameStore()
onMounted(() => {
  store.fetchInitialData()
})

const {
  isLoading,
  isAuthenticated,
  error,
  loginWithRedirect,
  logout: auth0Logout,
  user
} = useAuth0()

const signup = () =>
  loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })

const login = () => loginWithRedirect()

const logout = () =>
  auth0Logout({ logoutParams: { returnTo: window.location.origin } })
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-100 text-gray-800 font-sans">
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="isAuthenticated && user">
      <NavBar />

      <div v-else-if="isAuthenticated && user">
        <p>Logged in as {{ user.email }}</p>
        <h1>User Profile</h1>
        <pre>{{ JSON.stringify(user, null, 2) }}</pre>
        <button @click="logout">Logout</button>
      </div>

      <RouterView />
      <AppFooter />
    </div>

    <div v-else>
      <p v-if="error">Error: {{ error.message }}</p>
      <button @click="signup">Signup</button>
      <button @click="login">Login</button>
    </div>
  </div>
</template>
