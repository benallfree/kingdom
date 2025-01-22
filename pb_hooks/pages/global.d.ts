type PlayerState = {
  coins: number
  health: number
}

type CellState = {
  playerId: string
  health: number
  hasPrize: boolean
}

type RoomStatePublic = {
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

type RoomStatePrivate = {
  prizeIdx: number
}

type RoomState = { public: RoomStatePublic; private: RoomStatePrivate }
