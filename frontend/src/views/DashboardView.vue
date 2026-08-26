<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { io } from 'socket.io-client'
import { useGameStore } from '@/stores/gameStore'
import { useRouter } from 'vue-router'
import StatCard from '@/components/StatCard.vue'

const store = useGameStore()
const router = useRouter()
let socket = null

onMounted(() => {
  socket = io({
    auth: { interestedIn: ['game:create', 'game:end'] }
  })

  socket.on('game:create', () => store.fetchInitialData())
  socket.on('game:end', () => store.fetchInitialData())
})

onBeforeUnmount(() => {
  if (socket) {
    socket.disconnect()
  }
})

const playerStats = computed(() => {
  const stats = {}

  store.pastGames.forEach((game) => {
    const gameTotals = {}
    game.players.forEach((p) => (gameTotals[p] = 0))

    game.rounds.forEach((round) => {
      game.players.forEach((p) => {
        const score = round[p] || 0
        gameTotals[p] += score

        if (!stats[p]) {
          stats[p] = {
            totalPoints: 0,
            roundsPlayed: 0,
            gamesPlayed: 0,
            wins: 0,
            highestRound: -9999,
          }
        }

        stats[p].totalPoints += score
        stats[p].roundsPlayed += 1
        if (score > stats[p].highestRound) {
          stats[p].highestRound = score
        }
      })
    })

    game.players.forEach((p) => {
      if (stats[p]) stats[p].gamesPlayed += 1
    })

    let maxScore = -9999
    let winners = []
    for (const p in gameTotals) {
      if (gameTotals[p] > maxScore) {
        maxScore = gameTotals[p]
        winners = [p]
      } else if (gameTotals[p] === maxScore) {
        winners.push(p)
      }
    }
    winners.forEach((w) => {
      if (stats[w]) stats[w].wins += 1
    })
  })

  return Object.keys(stats).map((player) => {
    const data = stats[player]
    return {
      name: player,
      totalPoints: data.totalPoints,
      avgPerRound: data.roundsPlayed > 0 ? (data.totalPoints / data.roundsPlayed).toFixed(1) : 0,
      wins: data.wins,
      gamesPlayed: data.gamesPlayed,
      highestRound: data.highestRound,
    }
  })
})

const topPoints = computed(
  () => [...playerStats.value].sort((a, b) => b.totalPoints - a.totalPoints)[0]
)
const topAvg = computed(
  () => [...playerStats.value].sort((a, b) => b.avgPerRound - a.avgPerRound)[0]
)
const topWins = computed(() => [...playerStats.value].sort((a, b) => b.wins - a.wins)[0])
const topRound = computed(
  () => [...playerStats.value].sort((a, b) => b.highestRound - a.highestRound)[0]
)

const sortedLeaderboard = computed(() => {
  return [...playerStats.value].sort((a, b) => b.wins - a.wins || b.totalPoints - a.totalPoints)
})
</script>

<template>
  <main class="flex-grow max-w-5xl mx-auto w-full p-4 my-6">
    <div class="flex justify-between items-center border-b-2 border-green-700 pb-3 mb-6">
      <h2 class="text-2xl font-bold text-green-700">Dashboard & Statistics</h2>
      <button
        v-if="store.activeGame"
        @click="router.push('/active')"
        class="bg-green-100 text-green-800 px-4 py-2 rounded-md font-bold hover:bg-green-200 transition-colors text-sm shadow-sm"
      >
        Resume Active Game
      </button>
    </div>

    <div
      v-if="store.pastGames.length === 0"
      class="bg-white p-10 rounded-lg shadow-sm border border-gray-200 text-center text-gray-500"
    >
      <span class="text-4xl mb-4 block">🃏</span>
      <p class="text-lg">No games played yet.</p>
      <button
        @click="router.push('/setup')"
        class="mt-4 bg-green-600 text-white px-6 py-2 rounded-md font-bold hover:bg-green-700 transition-colors"
      >
        Start the first game!
      </button>
    </div>

    <div v-else class="space-y-8">
      <section class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          v-if="topWins"
          title="Most Wins 🏆"
          :playerName="topWins.name"
          :statValue="`${topWins.wins} wins`"
          theme="yellow"
        />
        <StatCard
          v-if="topPoints"
          title="Total Points 📈"
          :playerName="topPoints.name"
          :statValue="`${topPoints.totalPoints} pts`"
          theme="green"
        />
        <StatCard
          v-if="topAvg"
          title="Best Average 🎯"
          :playerName="topAvg.name"
          :statValue="`${topAvg.avgPerRound} / round`"
          theme="blue"
        />
        <StatCard
          v-if="topRound"
          title="Best Round 🔥"
          :playerName="topRound.name"
          :statValue="`${topRound.highestRound} pts`"
          theme="purple"
        />
      </section>

      <div class="grid md:grid-cols-3 gap-6">
        <section
          class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-2 overflow-x-auto"
        >
          <h3 class="text-lg font-bold mb-4 text-gray-800 border-b pb-2">All-Time Leaderboard</h3>
          <table class="w-full text-left border-collapse min-w-full text-sm">
            <thead>
              <tr class="bg-gray-50 text-gray-600 border-b border-gray-200">
                <th class="p-3 font-semibold">Rank</th>
                <th class="p-3 font-semibold">Player</th>
                <th class="p-3 font-semibold">Wins</th>
                <th class="p-3 font-semibold">Total Pts</th>
                <th class="p-3 font-semibold">Avg/Rnd</th>
                <th class="p-3 font-semibold">Games</th>
              </tr>
            </thead>
            <tbody class="text-gray-700">
              <tr
                v-for="(stat, index) in sortedLeaderboard"
                :key="stat.name"
                class="border-b border-gray-100 hover:bg-green-50 transition-colors"
              >
                <td class="p-3 font-bold text-gray-400">#{{ index + 1 }}</td>
                <td class="p-3 font-bold text-gray-900">{{ stat.name }}</td>
                <td class="p-3 font-semibold text-green-700">{{ stat.wins }}</td>
                <td class="p-3">{{ stat.totalPoints }}</td>
                <td class="p-3">{{ stat.avgPerRound }}</td>
                <td class="p-3 text-gray-500">{{ stat.gamesPlayed }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-1">
          <h3 class="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Recent Games</h3>
          <ul class="space-y-3 max-h-96 overflow-y-auto pr-2">
            <li
              v-for="(game, index) in [...store.pastGames]"
              :key="index"
              class="bg-gray-50 p-3 rounded-md border border-gray-100 shadow-sm text-sm"
            >
              <div class="font-bold text-gray-800 flex justify-between">
                <span>Game {{ store.pastGames.length - index }}</span>
                <span class="text-xs text-gray-400 font-normal"
                  >{{ game.rounds.length }} rounds</span
                >
              </div>
              <div class="text-gray-600 mt-1">
                {{ game.players.join(', ') }}
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </main>
</template>
