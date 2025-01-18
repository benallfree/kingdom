const getCurrentRoomState = (dao = $app) => {
  const room = dao.findRecordById(`rooms`, `2ruk2zo3x8k11h5`)
  return JSON.parse(room.getString('state'))
}

const setCurrentRoomState = (state, dao = $app) => {
  const room = dao.findRecordById(`rooms`, `2ruk2zo3x8k11h5`)
  room.set('state', state)
  dao.save(room)
}

module.exports = { getCurrentRoomState, setCurrentRoomState }
