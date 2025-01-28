const __root = `${__hooks}/pages/(game)/_private`
const {
  DEFAULT_MAX_ROUNDS,
  DEFAULT_PLACEMENT_TTL,
  DEFAULT_HEALTH,
  DEFAULT_SHARDS,
  DEFAULT_SHARDS_PER_ROUND,
} = require(`${__root}/constants`)

const getDefaultRoomState = (roomId) => {
  return {
    shardsPerRound: DEFAULT_SHARDS_PER_ROUND,
    grid: {},
    players: {},
    roundNum: 1,
    maxRounds: DEFAULT_MAX_ROUNDS,
    roundStartedAt: +new Date(),
    step: 'placement',
    stepStartedAt: +new Date(),
    stepTtl: DEFAULT_PLACEMENT_TTL,
    prize: {
      idx: Math.floor(Math.random() * 100) + 1,
      description:
        'One of these cells has 0.00018 BTC. Find it and defend it from other players.',
      found: 'You found the BTC! Defend it from other players.',
      banner: `    <div class="hero bg-base-200">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <h1 class="text-5xl font-bold">Progressive BTC Payout Rules</h1>
          <div class="text-2xl">
            Current Payout: 0.00018 BTC (~$5 USD at current BTC price)
          </div>
          <p class="py-6">
            How it works: We hid some BTC in one of the cells. If you can find
            it and defend the cell from other players, you win the pot.
          </p>
        </div>
      </div>
    </div>`,
    },
  }
}

const getRoomState = (roomId, dao = $app) => {
  const room = dao.findRecordById(`rooms`, roomId)
  const storedState = JSON.parse(room.getString('state'))
  return {
    ...getDefaultRoomState(roomId),
    ...storedState,
  }
}

const setRoomState = (roomId, state, dao = $app) => {
  const { dbg } = require('pocketpages')
  const room = dao.findRecordById(`rooms`, roomId)
  room.set('state', JSON.stringify(state))
  dao.save(room)
}

const pushRoomStateDelta = (roomId, deltas, extraFilter = (client) => true) => {
  const { dbg } = require('pocketpages')

  const key = `rooms/${roomId}/delta`
  const serializedState = JSON.stringify(deltas)
  const message = new SubscriptionMessage({
    name: key,
    data: serializedState,
  })
  const clients = $app.subscriptionsBroker().clients()

  const filteredClients = Object.entries(clients).filter(
    ([id, client]) => client.hasSubscription(key) && extraFilter(client)
  )
  filteredClients.forEach(([id, client]) => {
    dbg(`sending to ${id}: ${serializedState}`)
    client.send(message)
  })
}

const getSanitizedBattles = (roomState_readonly, userId = null) =>
  Object.entries(roomState_readonly.battles || []).map(
    ([idx, battle_readonly]) => getSanitizedBattle(battle_readonly, userId)
  )

const getSanitizedBattle = (battle_readonly, userId = null) => {
  const { dbg } = require('pocketpages')
  dbg(`sanitizing battle`, battle_readonly)
  const battle = {
    ...pick(battle_readonly, 'vs', 'outcome'),
    deltas: pick(battle_readonly.deltas, 'public', userId),
  }
  return battle
}

const pick = (obj, ...keys) => {
  const result = {}
  if (!obj) return result
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

const getSanitizedGridCell = (roomState_readonly, idx, userId = null) => {
  const cell_readonly = roomState_readonly.grid[idx]
  const hasPrize = idx == roomState_readonly.prize?.idx
  const cell = {
    ...pick(cell_readonly, 'playerId'),
  }
  if (cell_readonly.attackedBy?.length > 0) {
    const attackedBy =
      cell_readonly.attackedBy?.filter(
        (idx) => roomState_readonly.grid[idx]?.playerId === userId
      ) || []
    if (attackedBy.length > 0) {
      cell.attackedBy = attackedBy
    }
  }
  if (hasPrize && cell_readonly.playerId) {
    cell.hasPrize = true
  }
  if (cell_readonly.playerId === userId) {
    cell.health = cell_readonly.health
  }
  return cell
}

const getSanitizedGrid = (roomState_readonly, userId = null) => {
  const grid = {}
  Object.entries(roomState_readonly.grid).forEach(([idx, cell_readonly]) => {
    const cell = getSanitizedGridCell(roomState_readonly, idx, userId)
    if (Object.keys(cell).length > 0) {
      grid[idx] = cell
    }
  })

  return grid
}

const getSanitizedPlayer = (roomState_readonly, userId = null) => {
  const player = roomState_readonly.players[userId]
  return {
    health: DEFAULT_HEALTH,
    shards: DEFAULT_SHARDS,
    ...pick(player, 'health', 'shards'),
  }
}

const getSanitizedPlayers = (roomState_readonly, userId = null) => {
  if (!userId) return {}
  return { [userId]: getSanitizedPlayer(roomState_readonly, userId) }
}

const getSanitizedRoomState = (roomState_readonly, userId = null) => {
  const { dbg } = require('pocketpages')
  const state = {
    ...pick(
      roomState_readonly,
      'roundNum',
      'maxRounds',
      'roundStartedAt',
      'step',
      'stepStartedAt',
      'stepTtl'
    ),
    prize: pick(roomState_readonly.prize, 'description', 'found', 'banner'),
    grid: getSanitizedGrid(roomState_readonly, userId),
    players: getSanitizedPlayers(roomState_readonly, userId),
    battles: getSanitizedBattles(roomState_readonly, userId),
  }

  return state
}

module.exports = {
  getRoomState,
  setRoomState,
  pushRoomStateDelta,
  getSanitizedRoomState,
  getSanitizedGrid,
  getSanitizedPlayers,
  getSanitizedBattles,
  getSanitizedPlayer,
  getSanitizedGridCell,
  getDefaultRoomState,
}
