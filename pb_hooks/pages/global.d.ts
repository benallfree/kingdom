type PlayerState = {
  shards: number
  health: number
}

type CellState = {
  playerId: string
  health: number
  strength: number
  attackedBy: Record<string, boolean>
  selfDestructAt: number
}

type Delta = Record<string, any>

type BattleState = {
  vs: [number, number]
  outcome: -1 | 0 | 1
  deltas: {
    private: Delta
    public: Delta
    [key: string]: Delta
  }
}

type Prize = {
  idx: number
  description: string
  found: string
  banner: string
}

type RoomState = {
  meta: {
    name: string
    mod: {
      title: string
      textColor: string
      bgColor: string
      cta: {
        link: string
        text: string
        bgColor: string
        textColor: string
      }
    }
  }
  prize: Prize
  grid: Record<string, CellState>
  players: Record<string, PlayerState>
  roundNum: number
  roundStartedAt: number
  maxRounds: number
  step: 'placement' | 'assignment' | 'war' | 'end'
  stepStartedAt: number
  stepTtl: number
  cellTtl: number
  battles: Record<string, BattleState>
  chat: {
    ttl: number
    max: number
    messages: Record<string, { text: string }>
  }
}

type ClientRoomState = {
  grid: Record<string, CellState & { busy: boolean }>
}
