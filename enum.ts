import AppStyles from "./client/AppStyles";

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

export enum MatchStatus {ACTIVE='ACTIVE',WIN='WIN', SETUP='SETUP', LOSE='LOSE'}
export enum Directions {LEFT='LEFT', RIGHT='RIGHT', UP='UP', DOWN='DOWN'}
export const FourCoordinates = {
    RIGHT:{x:1,y:0},
    LEFT: {x:-1,y:0},
    DOWN: {x:0,y:1},
    UP: {x:0,y:-1}
}
export const FourCoordinatesArray = [
    {x:1,y:0},
    {x:-1,y:0},
    {x:0,y:1},
    {x:0,y:-1}
]
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

export enum StatusEffect {
    HP='HP', HP5='HP5', CDR='CDR', CDR5='CDR5', MOVES_MINUS_1='MOVES_MINUS_1', ABILITY_LOCK='ABILITY_LOCK', NONE='NONE', PIERCE='PIERCE', CAPTURE='CAPTURE',EDIT_STREAM='EDIT_STREAM',PULL='PULL'
}

export const MaxRespawnTurns = 3

export const Virii = ['red', 'green', 'blue']

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
    teamColor: AppStyles.colors.grey1,
    virusColor: '',
    isFirewall: false,
    isSpawner: false,
    isCharacterSpawn: false,
    captureTicks: 0,
    maxCaptureTicks: 2,
    isCapturableBy: {}
}

export const Characters = [
    {
        rune: 'a',
        id: 'Icer',
        hp: 3,
        maxHp: 3,
        move: 30,
        maxMove: 30,
        abilities: [
            {
                name:'Attack',
                range: 3,
                radius: 0,
                cdr: 0,
                maxCdr: 1,
                damage: 1,
                effect: StatusEffect.NONE,
                description: 'Basic attack, range 3.'
            },
            {
                name:'Long Shot',
                range: 6,
                radius: 0,
                cdr:0,
                maxCdr: 3,
                damage: 2,
                effect: StatusEffect.PIERCE,
                description: 'Long range shot that pierces armor.'
            },
            {
                name:'Snare',
                range: 2,
                radius: 0,
                cdr:0,
                maxCdr: 3,
                damage: 0,
                effect: StatusEffect.MOVES_MINUS_1,
                description: 'Network snare that causes the target to lose movement.'
            },
            {
                name:'Canister Shot',
                range: 2,
                radius: 1,
                cdr:0,
                maxCdr: 3,
                damage: 1,
                effect: StatusEffect.PIERCE,
                description: 'A short range blast that pierces armor.'
            },
        ],
        passives: [],
        armor: 0,
        sight: 5
    },
    {
        rune: 'b',
        id: 'Technician',
        hp: 4,
        maxHp: 4,
        move: 30,
        maxMove: 30,
        abilities: [
            {
                name:'Attack',
                range: 1,
                radius: 0,
                cdr:0,
                maxCdr: 1,
                damage: 1,
                effect: StatusEffect.PIERCE,
                description: 'Basic melee attack. Pierces armor.'
            },
            {
                name:'Capture',
                range: 0,
                radius: 0,
                cdr:0,
                maxCdr: 1,
                damage: 0,
                effect: StatusEffect.CAPTURE,
                description: 'Captures a network node.'
            },
            {
                name:'Edit',
                range: 0,
                radius: 0,
                cdr:0,
                maxCdr: 1,
                damage: 0,
                effect: StatusEffect.EDIT_STREAM,
                description: 'Changes the type of a network emitter.'
            },
            {
                name:'Attract',
                range: 2,
                radius: 0,
                cdr:0,
                maxCdr: 3,
                damage: 1,
                effect: StatusEffect.PULL,
                description: 'Pulls the target towards you.'
            },
        ],
        passives: [],
        armor: 2,
        sight: 3
    }
]