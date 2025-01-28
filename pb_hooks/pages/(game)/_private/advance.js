const __root = `${__hooks}/pages/(game)/_private`
const {
  ROOM_ID,
  DEFAULT_PLACEMENT_TTL,
  DEFAULT_ASSIGNMENT_TTL,
  DEFAULT_WAR_TTL,
} = require(`${__root}/constants`)
const {
  getRoomState,
  setRoomState,
  pushRoomStateDelta,
  getSanitizedBattles,
  getSanitizedGrid,
  getSanitizedRoomState,
  getSanitizedPlayers,
  getDefaultRoomState,
} = require(`${__root}/room`)
const { calculateWarResults } = require(`${__root}/battle`)
const { applyDeltas } = require(`${__root}/util`)
const { dbg } = require(`pocketpages`)

const advance = (userId = null) => {
  const deferred = []

  let roomState
  const advanceGame = (step, dao, mutateRoom = (room) => {}) => {
    dbg(`advance game to ${step}`)
    roomState.step = step
    roomState.stepStartedAt = Date.now()
    mutateRoom(roomState)
    setRoomState(ROOM_ID, roomState, dao)
    deferred.push(() => {
      pushRoomStateDelta(ROOM_ID, {
        [`step`]: roomState.step,
        [`stepStartedAt`]: roomState.stepStartedAt,
        [`stepTtl`]: roomState.stepTtl,
      })
    })
  }

  const stepExpiredGuard = (room) => {
    return room.stepStartedAt + room.stepTtl <= Date.now()
  }

  const shouldAdvanceGame = (room) => stepExpiredGuard(room)

  roomState = getRoomState(ROOM_ID, $app)

  if (shouldAdvanceGame(roomState)) {
    $app.runInTransaction((txn) => {
      roomState = getRoomState(ROOM_ID, txn)
      if (!shouldAdvanceGame(roomState)) return

      // Step has expired, advance game
      switch (roomState.step) {
        case 'placement':
          advanceGame('assignment', txn, (room) => {
            room.stepTtl = DEFAULT_ASSIGNMENT_TTL
          })
          break
        case 'assignment':
          advanceGame('war', txn, (room) => {
            room.stepTtl = DEFAULT_WAR_TTL
            room.battles = calculateWarResults(room)
          })

          deferred.push(() => {
            const clone = () => JSON.parse(JSON.stringify(roomState.battles))
            const playerIds = Object.keys(roomState.players)
            dbg(`pushing public deltas`)
            pushRoomStateDelta(
              ROOM_ID,
              {
                [`battles`]: getSanitizedBattles(roomState),
              },
              (client) => !playerIds.includes(client.get('auth').id)
            )
            dbg(`pushing player deltas`)

            playerIds.forEach((playerId) => {
              dbg(`pushing player ${playerId} deltas`, roomState.battles)
              pushRoomStateDelta(
                ROOM_ID,
                {
                  [`battles`]: getSanitizedBattles(roomState, playerId),
                },
                (client) => client.get('auth').id === playerId
              )
            })
          })
          break
        case 'war':
          if (roomState.roundNum >= roomState.maxRounds) {
            advanceGame('end', txn, (room) => {
              room.battles = []
              Object.entries(room.grid).forEach(([idx, cell]) => {
                cell.attackedBy = []
              })
            })
          } else {
            advanceGame('placement', txn, (room) => {
              dbg({ room })
              room.stepTtl = DEFAULT_PLACEMENT_TTL
              room.roundNum += 1
              Object.entries(room.grid).forEach(([idx, cell]) => {
                cell.attackedBy = []
              })
              Object.entries(room.players).forEach(([playerId, player]) => {
                player.shards += room.shardsPerRound
              })
              room.battles.forEach((battle) => {
                dbg({ battle })

                applyDeltas(room, battle.deltas.public)
                applyDeltas(room, battle.deltas.private)
              })
              room.battles = []
            })
          }
          deferred.push(() => {
            const playerIds = Object.keys(roomState.players)

            // Push public deltas to non-players
            pushRoomStateDelta(
              ROOM_ID,
              {
                [`roundNum`]: roomState.roundNum,
                [`grid`]: getSanitizedGrid(roomState),
                [`battles`]: [],
              },
              (client) => !playerIds.includes(client.get('auth').id)
            )

            // Push player deltas to players
            playerIds.forEach((playerId) => {
              pushRoomStateDelta(
                ROOM_ID,
                {
                  [`roundNum`]: roomState.roundNum,
                  [`grid`]: getSanitizedGrid(roomState, playerId),
                  [`battles`]: getSanitizedBattles(roomState, playerId),
                  [`players`]: getSanitizedPlayers(roomState, playerId),
                },
                (client) => client.get('auth').id === playerId
              )
            })
          })
          break
        case 'end':
          roomState = getDefaultRoomState(ROOM_ID)
          advanceGame('placement', txn)
          break
      }
    })
  }
  deferred.forEach((fn) => fn())

  return { roomState: getSanitizedRoomState(roomState, userId) }
}

module.exports = {
  advance,
}
