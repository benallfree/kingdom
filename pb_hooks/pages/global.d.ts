type PlayerState = {
  shards: number
  health: number
}

type CellState = {
  playerId: string
  health: number
  hasPrize: boolean
  attackedBy: string[]
}

type RoomState = {
  prizeDescription: string
  prizeIdx: number
  grid: Record<string, CellState>
  players: Record<string, PlayerState>
  roundNum: number
  roundStartedAt: number
  maxRounds: number
  step: 'placement' | 'assignment' | 'resolution'
  stepStartedAt: number
  stepTtl: number
}

type ClientRoomState = {
  grid: Record<string, CellState & { busy: boolean }>
}
