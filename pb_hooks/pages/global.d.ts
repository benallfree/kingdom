type RoomState = {
  grid: Record<string, { playerId: string }>
  players: Record<string, { name: string }>
  roundNum: number
  roundExpiry: number
  maxRounds: number
  roundTtl: number
}
