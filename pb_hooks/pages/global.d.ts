type PlayerState = {
  coins: number
  health: number
}

type CellState = {
  playerId: string
  health: number
  hasPrize: boolean
}

type RoomState = {
  prizeDescription: string
  prizeIdx: number
  grid: Record<string, CellState>
  players: Record<string, PlayerState>
  roundNum: number
  roundStartedAt: number
  maxRounds: number
  roundTtl: number
}

type ClientRoomState = {
  grid: Record<string, CellState & { joining: boolean }>
}
