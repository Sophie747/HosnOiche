<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { io } from 'socket.io-client'
import { useGameStore } from '@/stores/gameStore'
import { useRouter } from 'vue-router'

const store = useGameStore()
const router = useRouter()
const currentRound = ref({})
let socket = null

onMounted(() => {
  if (!store.activeGame) {
    router.push('/')
    return
  }
  resetInputs()

  socket = io({
    auth: { interestedIn: ['round:create', 'game:end'] }
  })

  socket.on('round:create', () => {
    store.fetchInitialData()
  })

  socket.on('game:end', (data) => {
    store.fetchInitialData()
    router.push('/')
  })
})

onBeforeUnmount(() => {
  if (socket) {
    socket.disconnect()
  }
})

const resetInputs = () => {
  currentRound.value = {}
  store.activeGame.players.forEach((player) => {
    currentRound.value[player] = 0
  })
}

const handleSubmitRound = () => {
  store.submitRound(currentRound.value)
  resetInputs()
}

const handleEndGame = async () => {
  await store.endGame()
  await store.fetchInitialData()
  router.push('/')
}
</script>

<template>
  <main
    v-if="store.activeGame"
    class="flex-grow max-w-4xl mx-auto w-full p-4 my-6 grid gap-6 md:grid-cols-3"
  >
    <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-1 h-fit">
      <h2 class="text-xl font-bold text-green-700 border-b-2 border-green-700 pb-2 mb-4">
        Round {{ store.activeGame.rounds.length + 1 }} Entry
      </h2>

      <form @submit.prevent="handleSubmitRound" class="space-y-4">
        <article class="space-y-3">
          <div v-for="player in store.activeGame.players" :key="player">
            <label :for="player" class="block text-sm font-medium text-gray-700 mb-1"
              >{{ player }}:</label
            >
            <input
              type="number"
              :id="player"
              v-model="currentRound[player]"
              required
              min="0"
              max="31"
              step="1"
              placeholder="0"
              class="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
        </article>

        <button
          type="submit"
          class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow transition-colors mt-4"
        >
          Submit Round
        </button>
      </form>
    </section>

    <section
      class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-2 overflow-x-auto"
    >
      <h2 class="text-xl font-bold text-green-700 border-b-2 border-green-700 pb-2 mb-4">
        Current Standings
      </h2>

      <table class="w-full text-left border-collapse min-w-full">
        <thead>
          <tr class="bg-green-50 text-green-800 border-b border-green-200">
            <th class="p-3 font-semibold">Round</th>
            <th v-for="player in store.activeGame.players" :key="player" class="p-3 font-semibold">
              {{ player }}
            </th>
          </tr>
        </thead>
        <tbody class="text-gray-600">
          <tr v-if="store.activeGame.rounds.length === 0">
            <td
              class="p-3 text-center text-gray-400 italic"
              :colspan="store.activeGame.players.length + 1"
            >
              No rounds played yet.
            </td>
          </tr>
          <tr
            v-for="(round, index) in store.activeGame.rounds"
            :key="index"
            class="border-b border-gray-100 hover:bg-gray-50"
          >
            <td class="p-3 font-bold">{{ index + 1 }}</td>
            <td v-for="player in store.activeGame.players" :key="player" class="p-3">
              {{ round[player] }}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="mt-6 flex justify-end">
        <button
          @click="handleEndGame"
          class="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-6 rounded-md shadow transition-colors"
        >
          End Game & Save
        </button>
      </div>
    </section>
  </main>
</template>
