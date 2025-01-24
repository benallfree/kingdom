module.exports = (api) => {
  const { dbg, resolve } = api
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

  room = getRoomState($app)
  if (stepExpiredGuard(room)) {
    $app.runInTransaction((txn) => {
      room = getRoomState(txn)
      if (stepExpiredGuard(room)) return

      // Step has expired, advance game
      switch (room.step) {
        case 'placement':
          advanceGame('assignment', txn)
          break
        case 'assignment':
          // advanceGame('action', txn)
          break
        case 'action':
          break
      }
    })
  }
  deferred.forEach((fn) => fn())

  dbg(`advance game`)
}
