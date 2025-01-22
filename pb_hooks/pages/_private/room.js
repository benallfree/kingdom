const getRoomState = (dao = $app) => {
  const room = dao.findRecordById(`rooms`, `2ruk2zo3x8k11h5`)
  const storedState = JSON.parse(room.getString('state'))
  const normalizedState = {
    grid: {},
    players: {},
    roundNum: 0,
    roundStartedAt: +new Date(),
    maxRounds: 10,
    roundTtl: 1000 * 60 * 5,
    prizeIdx: Math.floor(Math.random() * 100) + 1,
    ...storedState,
  }
  return normalizedState
}

const setRoomState = (state, dao = $app) => {
  const room = dao.findRecordById(`rooms`, `2ruk2zo3x8k11h5`)
  room.set('state', state)
  dao.save(room)
}

const pushRoomState = (roomId, state, extraFilter = (client) => true) => {
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
  const player = state.players[user.id]
  delete state.players
  state.players = { [user.id]: player }
  delete state.prizeIdx
  return state
}

module.exports = {
  getRoomState,
  setRoomState,
  pushRoomState,
  sanitizeRoomState,
}
