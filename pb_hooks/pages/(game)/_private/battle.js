const __root = `${__hooks}/pages/(game)/_private`
const { applyDeltas } = require(`${__root}/util`)

const calculateWarResults = (roomState_readonly) => {
  const { shuffle, dbg } = require('pocketpages')
  const room = JSON.parse(JSON.stringify(roomState_readonly))

  const protected = {}
  const allAttacks = shuffle(
    Object.entries(room.grid).reduce((acc, [p2Idx, cell]) => {
      cell.attackedBy?.forEach((p1Idx) => {
        acc.push([+p1Idx, +p2Idx])
      })
      return acc
    }, [])
  )
  //   dbg(`allAttacks`, allAttacks)

  const battles = []
  allAttacks.forEach(([p1Idx, p2Idx]) => {
    if (protected[p1Idx] || protected[p2Idx]) return
    // dbg(`\n===================\nCalculating battle ${p1Idx} vs ${p2Idx}`)
    const p1Cell = room.grid[p1Idx]
    const p2Cell = room.grid[p2Idx]
    const p1Id = p1Cell.playerId
    const p2Id = p2Cell.playerId
    if (!p1Id || !p2Id) {
      //   dbg(`No battle, one of the players is dead`, { p1Id, p2Id })
      return
    } // no battle, one of the players is dead
    const p1 = room.players[p1Id]
    const p2 = room.players[p2Id]
    // dbg(`p1(${p1Id}): ${p1.health}`)
    // dbg(`p2(${p2Id}): ${p2.health}`)
    // dbg(`c1(${p1Idx}): ${p1Cell.health}`)
    // dbg(`c2(${p2Idx}): ${p2Cell.health}`)

    // The damage is the minimum of the two healths
    const damage = Math.min(p1Cell.health, p2Cell.health)
    // dbg(`damage: ${damage}`)
    const outcome =
      p1Cell.health > p2Cell.health ? -1 : p1Cell.health < p2Cell.health ? 1 : 0
    // dbg(`outcome: ${outcome}`)

    const p1Health = p1.health - damage + (outcome < 0 ? 1 : 0)
    const p2Health = p2.health - damage + (outcome > 0 ? 1 : 0)
    const c1Health = p1Cell.health - damage + (outcome > 0 ? 1 : 0) || null
    const c2Health = p2Cell.health - damage + (outcome < 0 ? 1 : 0) || null

    if (outcome <= 0) {
      protected[p2Idx] = true
    }
    if (outcome >= 0) {
      protected[p1Idx] = true
    }

    const deltas = {
      private: {
        [`grid.${p1Idx}.health`]: c1Health,
        [`grid.${p2Idx}.health`]: c2Health,
        [`players.${p1Id}.health`]: p1Health,
        [`players.${p2Id}.health`]: p2Health,
      },
      public: {
        [`grid.${p1Idx}.playerId`]:
          outcome < 0 ? p1Id : outcome > 0 ? p2Id : null,
        [`grid.${p2Idx}.playerId`]:
          outcome < 0 ? p1Id : outcome > 0 ? p2Id : null,
      },
      [p1Id]: {
        [`players.${p1Id}.health`]: p1Health,
        [`grid.${p1Idx}.health`]: outcome < 0 ? c1Health : null,
        [`grid.${p2Idx}.health`]: outcome < 0 ? c2Health : null,
      },
      [p2Id]: {
        [`players.${p2Id}.health`]: p2Health,
        [`grid.${p1Idx}.health`]: outcome > 0 ? c1Health : null,
        [`grid.${p2Idx}.health`]: outcome > 0 ? c2Health : null,
      },
    }
    const battle = {
      vs: [p1Idx, p2Idx],
      outcome,
      damage,
      deltas,
    }
    // dbg(`battle`, battle)

    applyDeltas(room, deltas.public)
    applyDeltas(room, deltas.private)

    // dbg(`outcome: ${outcome}`)
    // dbg(`p1(${p1Id}): ${p1.health}`)
    // dbg(`p2(${p2Id}): ${p2.health}`)
    // dbg(`c1(${p1Cell.playerId}): ${p1Cell.health}`)
    // dbg(`c2(${p2Cell.playerId}): ${p2Cell.health}`)

    battles.push(battle)
  })

  return battles
}

module.exports = {
  calculateWarResults,
}
