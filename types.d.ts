declare enum Directions {LEFT='LEFT', RIGHT='RIGHT', UP='UP', DOWN='DOWN'}

declare enum MatchStatus {ACTIVE='ACTIVE',WIN='WIN',LOSE='LOSE', SETUP='SETUP'}

declare enum TileType {
    GAP='GAP',
    NETWORK_LINE='NETWORK_LINE',
    GRID='GRID'
}

declare enum StatusEffect {
    HP, HP5, CDR, CDR5, ARM, MOVES, ABILITY_LOCK
}

interface Player {
    name:string
    id:string
    teamId: string
    x:number
    y:number
    hp: number
    maxHp: number
    move: number
    maxMove: number
    rune: string
    gear: Array<Gear>
    abilities: Array<Ability>
    passives: Array<Passive>
    armor: number
}

interface Ability {
    name:string
    range: number
    radius: number
    cdr: number
    damage: number
    effect: StatusEffect
}

interface Gear {
    name: string
    armor: number
    passive: Passive
    attack: number
    peirce: number
}

interface Passive {
    stacks: number
    effect: StatusEffect
    isNegative: boolean
    stacksTargetSelf: boolean
    isAura: boolean
}

interface Tile {
    x: number
    y: number
    type: TileType
    subType: string
    playerId: string
    minionId: string
    firewallId: string
    hubId: string
    minionSpawnerId: string
}

interface Team {
    id: string
    color: string
    score: number
    leadPlayerId: string
}

interface Session {
    sessionId: string,
    hostPlayerId: string,
    activePlayerId: string,
    status: MatchStatus,
    players: Array<Player>,
    teams: Array<Team>,
    map: Array<Array<Tile>>,
    ticks: number,
    turnTickLimit: number,
    turn: number
}

interface RState {
    isConnected: boolean
    currentUser: Player
    activeSession: Session
}