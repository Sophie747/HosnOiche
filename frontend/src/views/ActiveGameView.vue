<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
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
    auth: { interestedIn: ['round:create', 'round:delete', 'game:end'] }
  })

  socket.on('round:create', () => {
    store.fetchInitialData()
  })

  socket.on('round:delete', () => {
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
    currentRound.value[player] = undefined
  })
}

const handleSubmitRound = () => {
  store.submitRound(currentRound.value)
  resetInputs()
}

const totals = computed(() => {
  const sums = {}
  if (!store.activeGame) return sums

  store.activeGame.players.forEach((player) => {
    sums[player] = 0
  })
  store.activeGame.rounds.forEach((round) => {
    store.activeGame.players.forEach((player) => {
      sums[player] += Number(round[player]) || 0
    })
  })
  return sums
})

const leaders = computed(() => {
  if (!store.activeGame || store.activeGame.rounds.length === 0) return []

  const max = Math.max(...store.activeGame.players.map((player) => totals.value[player]))
  return store.activeGame.players.filter((player) => totals.value[player] === max)
})

const formatScore = (value) => (Number.isInteger(value) ? value : value.toFixed(1))

const displayedRounds = computed(() => {
  if (!store.activeGame) return []
  return [...store.activeGame.rounds].reverse()
})

const getOriginalRoundIndex = (displayIndex) => {
  if (!store.activeGame) return displayIndex
  return store.activeGame.rounds.length - 1 - displayIndex
}

const handleDeleteRound = (displayIndex) => {
  const originalIndex = getOriginalRoundIndex(displayIndex)
  if (!window.confirm(`Delete round ${originalIndex + 1}? This cannot be undone.`)) return
  store.deleteRound(originalIndex)
}

const handleEndGame = async () => {
  if (store.activeGame.rounds.length === 0) {
    if (!window.confirm('There were no rounds played. Do you want to abandon this game?')) return
    await store.abandonGame()
  } else {
    await store.endGame()
    await store.fetchInitialData()
  }
  router.push('/')
}
</script>

<template>
  <main
    v-if="store.activeGame"
    class="flex-grow max-w-4xl mx-auto w-full p-4 my-6 grid gap-6 md:grid-cols-3 min-w-0"
  >
    <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-1 h-fit min-w-0">
      <h2 class="text-xl font-bold text-green-700 border-b-2 border-green-700 pb-2 mb-4">
        Round {{ store.activeGame.rounds.length + 1 }} Entry
      </h2>

      <form @submit.prevent="handleSubmitRound" class="space-y-4">
        <article class="space-y-3">
          <div v-for="player in store.activeGame.players" :key="player">
            <label :for="player" class="block text-sm font-medium text-gray-700 mb-1"
              >{{ player }}:</label
            >
              <div class="flex items-center gap-2 min-w-0 w-full">
                  <input
                  type="number"
                  inputmode="decimal"
                  :id="player"
                  v-model="currentRound[player]"
                  required
                  min="0"
                    max="31"
                    step="0.5"
                  placeholder="0"
                  class="flex-1 min-w-0 border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
                <button type="button" @click="currentRound[player] = 30.5" class="flex-shrink-0 px-3 py-2 rounded bg-green-50 hover:bg-green-100">🐦</button>
                <button type="button" @click="currentRound[player] = 31" class="flex-shrink-0 px-3 py-2 rounded bg-green-50 hover:bg-green-100">👖</button>
              </div>
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

    <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-2 min-w-0">
      <h2 class="text-xl font-bold text-green-700 border-b-2 border-green-700 pb-2 mb-4">
        Current Standings
      </h2>

      <div class="w-full overflow-x-auto max-h-[55vh]">
        <table class="table-auto w-full text-left border-collapse min-w-max">
          <thead>
            <tr class="bg-green-50 text-green-800 border-b border-green-200">
              <th class="p-3 font-semibold sticky top-0 bg-green-50 z-10">Round</th>
              <th
                v-for="player in store.activeGame.players"
                :key="player"
                class="p-3 font-semibold sticky top-0 bg-green-50 z-10"
              >
                <span v-if="leaders.includes(player)" class="mr-1" title="Currently leading">👑</span
                >{{ player }}
              </th>
              <th class="p-3 sticky top-0 bg-green-50 z-10"><span class="sr-only">Delete</span></th>
            </tr>
          </thead>
          <tbody class="text-gray-600">
            <tr v-if="store.activeGame.rounds.length === 0">
              <td
                class="p-3 text-center text-gray-400 italic"
                :colspan="store.activeGame.players.length + 2"
              >
                No rounds played yet.
              </td>
            </tr>
            <tr
              v-for="(round, displayIndex) in displayedRounds"
              :key="getOriginalRoundIndex(displayIndex)"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="p-3 font-bold">{{ getOriginalRoundIndex(displayIndex) + 1 }}</td>
              <td v-for="player in store.activeGame.players" :key="player" class="p-3">
                {{ round[player] }}
              </td>
              <td class="p-3 text-right">
                <button
                  type="button"
                  @click="handleDeleteRound(displayIndex)"
                  :aria-label="`Delete round ${getOriginalRoundIndex(displayIndex) + 1}`"
                  :title="`Delete round ${getOriginalRoundIndex(displayIndex) + 1}`"
                  class="text-gray-300 hover:text-red-600 font-bold px-2 transition-colors"
                >
                  ✕
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-green-50 text-green-800 border-t-2 border-green-200">
              <th class="p-3 font-bold sticky bottom-0 bg-green-50 z-10">Total</th>
              <td
                v-for="player in store.activeGame.players"
                :key="player"
                class="p-3 font-bold sticky bottom-0 bg-green-50 z-10"
              >
                {{ formatScore(totals[player]) }}
              </td>
              <td class="p-3 sticky bottom-0 bg-green-50 z-10"></td>
            </tr>
          </tfoot>
        </table>
      </div>

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
