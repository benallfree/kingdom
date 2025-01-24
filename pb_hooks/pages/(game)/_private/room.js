const getRoomState = (dao = $app) => {
  const room = dao.findRecordById(`rooms`, `2ruk2zo3x8k11h5`)
  const storedState = JSON.parse(room.getString('state'))
  const normalizedState = {
    grid: {},
    players: {},
    roundNum: 1,
    maxRounds: 10,
    roundStartedAt: +new Date(),
    step: 'placement',
    stepStartedAt: +new Date(),
    stepTtl: 1000 * 60 * 5000,
    maxRounds: 10,
    prizeIdx: Math.floor(Math.random() * 100) + 1,
    prizeDescription:
      'One of these cells has 0.00018 BTC. Find it and defend it from other players.',
    prizeFound: 'You found the BTC! Defend it from other players.',
    prize: {
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
    ...storedState,
  }
  return normalizedState
}

const setRoomState = (state, dao = $app) => {
  const room = dao.findRecordById(`rooms`, `2ruk2zo3x8k11h5`)
  room.set('state', state)
  dao.save(room)
}

const pushRoomStateDelta = (roomId, state, extraFilter = (client) => true) => {
  const key = `rooms/${roomId}/delta`
  const serializedState = JSON.stringify(state)
  // const {dbg} = require('pocketpages')
  const message = new SubscriptionMessage({
    name: key,
    data: serializedState,
  })
  const clients = $app.subscriptionsBroker().clients()

  const dbg = (...args) => console.log(JSON.stringify(args))
  dbg({ state, clients }, typeof clients)
  const filteredClients = Object.entries(clients).filter(
    ([id, client]) => client.hasSubscription(key) && extraFilter(client)
  )
  filteredClients.forEach(([id, client]) => {
    dbg(`sending to ${id}: ${serializedState}`)
    client.send(message)
  })
}

const sanitizeRoomState = (state, user) => {
  Object.entries(state.grid).forEach(([idx, cell]) => {
    if (idx == state.prizeIdx) {
      cell.hasPrize = true
    }
    if (cell.playerId === user.id) return
    delete cell.hasPrize
    delete cell.health
    if (Object.keys(cell).length === 0) {
      delete state.grid[idx]
    }
  })

  delete state.prizeIdx
  const player = state.players[user.id]
  state.players = { [user.id]: player }

  return state
}

module.exports = {
  getRoomState,
  setRoomState,
  pushRoomStateDelta,
  sanitizeRoomState,
}
