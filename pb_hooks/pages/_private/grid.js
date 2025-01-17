const getCurrentGrid = (dao = $app) => {
  const room = dao.findRecordById(`rooms`, `2ruk2zo3x8k11h5`)
  return JSON.parse(room.getString('grid'))
}

const setCurrentGrid = (grid, dao = $app) => {
  const room = dao.findRecordById(`rooms`, `2ruk2zo3x8k11h5`)
  room.set('grid', grid)
  dao.save(room)
}

module.exports = { getCurrentGrid, setCurrentGrid }
