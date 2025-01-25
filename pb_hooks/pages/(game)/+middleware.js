module.exports = (api) => {
  const { dbg, resolve } = api
  const { ROOM_ID } = resolve('constants')
  const { getRoomState, setRoomState } = resolve('room')

  const deferred = []

  let room
  const advanceGame = (step, txn) => {
    room.step = step
    room.stepStartedAt = Date.now()
    room.stepTtl = 1000 * 60 * 5
    setRoomState(room, txn)
    deferred.push(() => {
      pushRoomStateDelta(room.id, {
        [`step`]: room.step,
        [`stepStartedAt`]: room.stepStartedAt,
        [`stepTtl`]: room.stepTtl,
      })
    })
  }

  const stepExpiredGuard = (room) => {
    return room.stepExpiresAt <= Date.now()
  }

  room = getRoomState(ROOM_ID, $app)
  if (stepExpiredGuard(room)) {
    $app.runInTransaction((txn) => {
      room = getRoomState(ROOM_ID, txn)
      if (stepExpiredGuard(room)) return

      // Step has expired, advance game
      switch (room.step) {
        case 'placement':
          advanceGame('assignment', txn)
          break
        case 'assignment':
          advanceGame('war', txn)
          calculateWarResults(room)
          break
        case 'war':
          advanceGame('placement', txn)
          break
      }
    })
  }
  deferred.forEach((fn) => fn())

  dbg(`advance game`)
}
