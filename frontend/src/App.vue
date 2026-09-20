<script setup>
import { watch } from 'vue'
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import AppFooter from '@/components/AppFooter.vue'
import LoginButton from '@/components/LoginButton.vue'
import LogoutButton from '@/components/LogoutButton.vue'
import { useGameStore } from '@/stores/gameStore'
import { useSafeAuth0 } from '@/lib/auth'

const store = useGameStore()

const { isLoading, isAuthenticated, error, user } = useSafeAuth0()
const hasAuth0Config = Boolean(import.meta.env.VITE_AUTH0_DOMAIN && import.meta.env.VITE_AUTH0_CLIENT_ID)

watch(
  isAuthenticated,
  (authenticated) => {
    if (authenticated) {
      store.fetchInitialData()
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-100 font-sans text-gray-800">
    <div v-if="isLoading" class="flex flex-1 items-center justify-center text-lg font-medium">
      Loading your session...
    </div>

    <div v-else-if="isAuthenticated && user">
      <NavBar />

      <div class="mx-auto max-w-4xl w-full px-4 py-4">
        <div class="flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-white p-4 shadow-sm">
          <div>
            <p class="text-sm font-medium text-gray-500">Signed in</p>
            <p class="text-lg font-semibold text-green-800">{{ user.email || user.name }}</p>
          </div>
          <LogoutButton />
        </div>
      </div>

      <RouterView />
      <AppFooter />
    </div>

    <div v-else class="flex flex-1 items-center justify-center bg-gradient-to-br from-green-50 to-white p-6">
      <div class="w-full max-w-md rounded-2xl border border-green-100 bg-white p-8 shadow-lg">
        <p class="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-green-700">Hosn Oiche</p>
        <h1 class="mb-5 text-3xl font-bold text-gray-900">Welcome</h1>

        <p v-if="error" class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {{ error.message }}
        </p>

        <p v-if="!hasAuth0Config" class="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-700">
          Auth0 is not configured yet. Add VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID to your environment.
        </p>

        <p class="mb-6 text-gray-600">
          Sign in to view your dashboard, start games, and track scores.
        </p>

        <div class="flex flex-col gap-3 sm:flex-row">
          <LoginButton label="Create account" :screen-hint="'signup'" class="flex-1" />
          <LoginButton label="Log in" class="flex-1" />
        </div>
      </div>
    </div>
  </div>
</template>
