type PlayerState = {
  coins: number
  health: number
}

type CellState = {
  playerId: string
  health: number
}

type RoomState = {
  grid: Record<string, CellState>
  players: Record<string, PlayerState>
  roundNum: number
  roundExpiry: number
  maxRounds: number
  roundTtl: number
}

type ClientRoomState = {
  grid: Record<string, CellState & { joining: boolean }>
}
