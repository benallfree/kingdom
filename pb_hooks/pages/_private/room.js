const getRoomState = (dao = $app) => {
  const roomPublic = dao.findRecordById(`rooms`, `2ruk2zo3x8k11h5`)
  const roomPrivate = dao.findFirstRecordByData(
    `rooms_private`,
    `room`,
    `2ruk2zo3x8k11h5`
  )
  return {
    publicState: JSON.parse(roomPublic.getString('state')),
    privateState: JSON.parse(roomPrivate.getString('state')),
  }
}

const setPublicRoomState = (statePublic, dao = $app) => {
  const room = dao.findRecordById(`rooms`, `2ruk2zo3x8k11h5`)
  room.set('state', statePublic)
  dao.save(room)
}

module.exports = { getRoomState, setPublicRoomState }
