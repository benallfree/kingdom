const __root = `${__hooks}/pages/(game)/_private`
const { applyDeltas } = require(`${__root}/util`)
const { healthToStrength } = require(`${__root}/room`)
const { DEFAULT_CELL_SELF_DESTRUCT_TTL } = require(`${__root}/constants`)

const calculateWarResults = (roomState_readonly) => {
  const { shuffle, dbg } = require('pocketpages')
  const room = JSON.parse(JSON.stringify(roomState_readonly))

  const protected = {}
  const allAttacks = shuffle(
    Object.entries(room.grid).reduce((acc, [defenderIdx, defenderCell]) => {
      Object.entries(defenderCell.attackedBy || {}).forEach(
        ([attackerIdx, isAttacking]) => {
          if (isAttacking) {
            acc.push([+attackerIdx, +defenderIdx])
          }
        }
      )
      return acc
    }, [])
  )
  //   dbg(`allAttacks`, allAttacks)

  const battles = []
  allAttacks.forEach(([attackerIdx, defenderIdx]) => {
    if (protected[attackerIdx] || protected[defenderIdx]) return
    // dbg(`\n===================\nCalculating battle ${p1Idx} vs ${p2Idx}`)
    const attackerCell = room.grid[attackerIdx]
    const defenderCell = room.grid[defenderIdx]
    const attackerId = attackerCell.playerId
    const defenderId = defenderCell.playerId
    if (!attackerId || !defenderId) {
      //   dbg(`No battle, one of the players is dead`, { p1Id, p2Id })
      return
    } // no battle, one of the players is dead
    const attacker = room.players[attackerId]
    const defender = room.players[defenderId]
    // dbg(`p1(${p1Id}): ${p1.health}`)
    // dbg(`p2(${p2Id}): ${p2.health}`)
    // dbg(`c1(${p1Idx}): ${p1Cell.health}`)
    // dbg(`c2(${p2Idx}): ${p2Cell.health}`)

    // The damage is the minimum of the two healths
    const damage = Math.min(attackerCell.health, defenderCell.health)
    // dbg(`damage: ${damage}`)
    const outcome =
      attackerCell.health > defenderCell.health
        ? -1
        : attackerCell.health < defenderCell.health
          ? 1
          : 0

    const attackerWins = outcome < 0
    const defenderWins = outcome > 0
    const draw = outcome === 0
    // dbg(`outcome: ${outcome}`)

    const attackerHealth = attacker.health - damage + (attackerWins ? 1 : 0)
    const defenderHealth = defender.health - damage
    const attackerCellHealth = attackerCell.health - damage
    const defenderCellHealth =
      defenderCell.health - damage + (attackerWins ? 1 : 0)

    protected[attackerIdx] = defenderWins || draw
    protected[defenderIdx] = attackerWins || draw

    const now = Date.now()
    const deltas = {
      private: {
        grid: {
          [`${attackerIdx}`]: {
            health: attackerCellHealth,
            selfDestructAt: now + room.cellTtl,
          },
          [`${defenderIdx}`]: {
            health: defenderCellHealth,
            selfDestructAt: attackerWins ? now + room.cellTtl : null,
          },
        },
        players: {
          [`${attackerId}`]: {
            health: attackerHealth,
          },
          [`${defenderId}`]: {
            health: defenderHealth,
          },
        },
      },
      public: {
        grid: {
          [`${attackerIdx}`]: {
            playerId: attackerWins ? attackerId : null,
            strength: healthToStrength(attackerCellHealth),
          },
          [`${defenderIdx}`]: {
            playerId: defenderWins
              ? defenderId
              : attackerWins
                ? attackerId
                : null,
            strength: healthToStrength(defenderCellHealth),
          },
        },
      },
      [attackerId]: {
        players: {
          [`${attackerId}`]: {
            health: attackerHealth,
          },
        },
        grid: {
          [`${attackerIdx}`]: {
            health: attackerWins ? attackerCellHealth : null,
            selfDestructAt: now + room.cellTtl,
          },
          [`${defenderIdx}`]: {
            health: attackerWins ? defenderCellHealth : null,
            selfDestructAt: attackerWins ? now + room.cellTtl : null,
          },
        },
      },
      [defenderId]: {
        players: {
          [`${defenderId}`]: {
            health: defenderHealth,
          },
        },
        grid: {
          [`${defenderIdx}`]: {
            health: defenderWins ? defenderCellHealth : null,
          },
        },
      },
    }
    const battle = {
      vs: [attackerIdx, defenderIdx],
      outcome,
      damage,
      deltas,
    }
    // dbg(`battle`, battle)

    applyDeltas(room, deltas.public)
    applyDeltas(room, deltas.private)

    battles.push(battle)
  })

  // Cull idle cells
  const idleCells = shuffle(Object.entries(room.grid))
  dbg(`idleCells`, idleCells)
  idleCells.forEach(([idx, cell]) => {
    if (!cell.playerId) return
    if (cell.selfDestructAt > Date.now()) return
    room.players[cell.playerId].health -= cell.health
    battles.push({
      vs: [idx],
      outcome: 2,
      damage: cell.health,
      deltas: {
        private: {
          grid: { [`${idx}`]: null },
        },
        public: {
          grid: { [`${idx}`]: null },
        },
        [cell.playerId]: {
          grid: { [`${idx}`]: null },
          players: {
            [`${cell.playerId}`]: {
              health: room.players[cell.playerId].health,
            },
          },
        },
      },
    })
  })

  return battles
}

module.exports = {
  calculateWarResults,
}
