/// <reference types="pocketbase-jsvm" />

module.exports = function (api) {
  const { auth, echo, params, require } = api
  if (!auth) {
    throw new BadRequestError('Unauthorized')
  }

  const { idx } = params

  if (!idx) {
    throw new BadRequestError('Missing idx')
  }

  const { getCurrentGrid, setCurrentGrid } = require('grid')

  let grid = {}
  $app.runInTransaction((txApp) => {
    grid = getCurrentGrid(txApp)
    if (grid[idx]?.playerId) {
      throw new BadRequestError(`Cell ${idx} already has a player`)
    }
    grid[idx] = { ...grid[idx], playerId: auth.id }
    setCurrentGrid(grid, txApp)
  })

  return {
    grid,
  }
}
