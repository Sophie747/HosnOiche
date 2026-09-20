<script setup>
import { useSafeAuth0 } from '@/lib/auth'

const { logout } = useSafeAuth0()

const hasAuth0Config = Boolean(import.meta.env.VITE_AUTH0_DOMAIN && import.meta.env.VITE_AUTH0_CLIENT_ID)

const handleLogout = () => {
  logout({
    logoutParams: {
      returnTo: window.location.origin,
    },
  })
}
</script>

<template>
  <button
    type="button"
    :disabled="!hasAuth0Config"
    @click="handleLogout"
    class="rounded-md border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
  >
    Log out
  </button>
</template>
