<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'

const store = useGameStore()
const router = useRouter()

const handleAbandon = () => {
  if (confirm('Are you sure you want to abandon this game? No scores will be saved.')) {
    store.abandonGame()
    router.push('/')
  }
}
</script>

<template>
  <header class="bg-green-800 text-white p-4 shadow-md">
    <div class="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
      <h1 class="text-2xl font-bold tracking-wide">Hosn Oiche - Score Tracker</h1>
      <nav>
        <ul class="flex gap-6 font-semibold items-center text-sm md:text-base">
          <li>
            <RouterLink
              to="/"
              class="hover:text-green-300 transition-colors"
              active-class="text-green-300"
              >Dashboard</RouterLink
            >
          </li>
          <li v-if="!store.activeGame">
            <RouterLink
              to="/setup"
              class="hover:text-green-300 transition-colors"
              active-class="text-green-300"
              >Start New Game</RouterLink
            >
          </li>
          <li v-if="store.activeGame">
            <RouterLink
              to="/active"
              class="hover:text-green-300 transition-colors"
              active-class="text-green-300"
              >Active Game</RouterLink
            >
          </li>
          <li v-if="store.activeGame">
            <button
              @click.prevent="handleAbandon"
              class="text-red-300 hover:text-red-100 transition-colors"
            >
              Abandon Game
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>
