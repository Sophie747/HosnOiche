<script setup>
import { useSafeAuth0 } from '@/lib/auth'

const props = defineProps({
  label: {
    type: String,
    default: 'Log in',
  },
  screenHint: {
    type: String,
    default: '',
  },
})

const { loginWithRedirect } = useSafeAuth0()
const hasAuth0Config = Boolean(import.meta.env.VITE_AUTH0_DOMAIN && import.meta.env.VITE_AUTH0_CLIENT_ID)

const handleLogin = () => {
  if (props.screenHint) {
    loginWithRedirect({ authorizationParams: { screen_hint: props.screenHint } })
    return
  }

  loginWithRedirect()
}
</script>

<template>
  <button
    type="button"
    :disabled="!hasAuth0Config"
    @click="handleLogin"
    class="rounded-md bg-green-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
  >
    {{ label }}
  </button>
</template>
