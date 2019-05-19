export const ApiUrl= 'wss://services.cryptonomical.com:3334'
export const ReducerActions= {
    PLAYER_AVAILABLE: 'ma',
    MATCH_UPDATE: 'mu',
    MATCH_TICK: 'mt',
    PLAYER_READY: 'pr',
    PLAYER_ENTERED: 'pe',
    PLAYER_JOIN: 'pj',
    PLAYER_MAP_REPLACE: 'pmp',
    PLAYER_LEFT: 'pl',
    NEW_PHRASE: 'np',
    MATCH_START: 'ms',
    MATCH_WIN: 'mw',
    MATCH_LOST: 'ml',
    MATCH_CLEANUP: 'mc',
    PHRASE_CORRECT: 'pc',
    TIMER_TICK:'tt',
    INIT_SERVER: 'is',
    CONNECTION_ERROR: 'ce',
    CONNECTED: 'c',
    SET_USER: 'su',
    PLAYER_REPLACE: 'prp',
    START_SP: 'st'
}

export const PlayerRune = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']

export enum MatchStatus {ACTIVE='ACTIVE',WIN='WIN', SETUP='SETUP'}
export enum Directions {LEFT='LEFT', RIGHT='RIGHT', UP='UP', DOWN='DOWN'}
export const FourCoordinates = {
    RIGHT:{x:1,y:0},
    LEFT: {x:-1,y:0},
    DOWN: {x:0,y:1},
    UP: {x:0,y:-1}
}
export const FourCoordinatesArray = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]
export const EightCoordinates = {
    RIGHT:{x:1,y:0},
    UPRIGHT: {x:1, y:-1},
    UP: {x:0,y:-1},
    UPLEFT: {x:-1, y:-1},
    LEFT: {x:-1,y:0},
    DOWNLEFT: {x: -1, y:1},
    DOWN: {x:0,y:1},
    DOWNRIGHT: {x:1, y:1}
}
export const EightCoordinatesArray = [{x:1,y:0},{x:1,y:-1},{x:0,y:-1},{x:-1,y:-1},{x:-1,y:0},{x:-1, y:1},{x:0,y:1},{x:1,y:1}]
    
export enum TileType {
    GAP='GAP',
    NETWORK_LINE='NETWORK_LINE',
    GRID='GRID',
    HUB='HUB'
}

export const TileSubType = {
    GAP: ['a','b','c','d','F','G','H','I','J','K','L','M'],
    GRID: ['A','N','O','P','Q','R','S','T','w','x','y'],
    NETWORK_LINE: ['B','C','D','E','W','X','Y','Z'],
    HUB: ['q','r','s','t','u','v','1','2','U','V']
}

export const EmptyTile = {
    x: 0,
    y: 0,
    type: TileType.GRID,
    subType: '',
    playerId: '',
    minionId: '',
    firewallId: '',
    minionSpawnerId: '',
    hubId:''
}

export const Characters = [
    {
        rune: 'a',
        id: 'sniper',
    }
]