import { ReducerActions, MatchStatus, TileType } from '../../../enum'
import * as TestGround from '../../assets/TestGround.json'

const appReducer = (state = getInitialState(), action:any) => {
    switch (action.type) {
        case ReducerActions.CONNECTED: 
            return { ...state, isConnected: true}
        case ReducerActions.CONNECTION_ERROR: 
            return { ...state, isConnected: false}
        case ReducerActions.MATCH_UPDATE: 
            return { ...state, activeSession: action.session }
        case ReducerActions.PLAYER_ENTERED:
            state.activeSession.players.push(action.currentUser)
            return { ...state, activeSession: {...state.activeSession}}
        case ReducerActions.PLAYER_LEFT:
            state.activeSession.players.filter((player:any) => player.id !== action.currentUser.id)
            return { ...state, activeSession: {...state.activeSession}}
        case ReducerActions.SET_USER: 
            return { ...state, currentUser: action.currentUser }
        case ReducerActions.START_SP: 
            return { ...state, currentUser: action.currentUser, activeSession: getSPSession(action.currentUser)}
        case ReducerActions.MATCH_CLEANUP: 
            return { ...state, activeSession: null, currentUser:null}
        default:
            return state
    }
};

export default appReducer;

const getInitialState = () => {
    return {
        activeSession: {
            players: new Array<any>()
        },
        isConnected: false,
        currentUser: {
            
        }
    }
}

const getSPSession = (currentUser:Player) => {
    //TODO: add AI players
    let initPlayers = [currentUser]
    const players = initPlayers.map((player:Player, i) => {
        return {
            ...player,
            x: -1,
            y: -1,
            hp: 5,
            maxHp: 5,
            move: 4,
            maxMove: 4,
            armor: 0
        }
    })
    const newSession = {
        status: MatchStatus.ACTIVE,
        hostPlayerId: currentUser.id,
        players,
        map: TestGround.map((row, i) => 
                row.map((tile:Tile, j) => {
                    return {
                        ...tile,
                        x:i,
                        y:j,
                        firewallId: tile.firewallId ? 'gray' : '',
                        minionId: tile.type === TileType.NETWORK_LINE ? 'gray' : ''
                    }
                })
            ),
        ticks: 0,
        turnTickLimit: 15
    }
    return newSession
}