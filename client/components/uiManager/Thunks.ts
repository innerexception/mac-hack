import { dispatch } from '../../../client/App'
import { ReducerActions, MatchStatus, TileType, TileSubType } from '../../../enum'
import Thunderdome from '../../assets/Thunderdome'
import { toast } from './toast';
import { getRandomInt } from '../Util';
import { server } from '../../App'

export const setUser = (currentUser:object) => {
    dispatch({
        type: ReducerActions.SET_USER,
        currentUser
    })
}

export const onWSMessage = (data:any) => {
    if (!data ) {
        dispatch({
            type:'noop'
        })
    }
    else{
        const payload = JSON.parse(data.data)
        dispatch({...payload})
    }
}

export const onConnected= () => {
    dispatch({
        type: ReducerActions.CONNECTED
    })
}

export const onConnectionError= () => {
    dispatch({
        type: ReducerActions.CONNECTION_ERROR
    })
}

export const onLogin = (currentUser:Player, sessionId?:string) => {
    if(sessionId){
        dispatch({ type: ReducerActions.SET_USER, currentUser })
        server.publishMessage({type: ReducerActions.PLAYER_AVAILABLE, currentUser, sessionId})
    } 
    else {
        dispatch({ type: ReducerActions.START_SP, currentUser })
    }
}

export const onMatchStart = (currentUser:Player, session:Session) => {
    const players = session.players.map((player:Player, i) => {
        return {
            ...player,
            x: Math.max(1, getRandomInt(Thunderdome.length-1)),
            y: Math.max(1,getRandomInt(Thunderdome[0].length-1)),
            hp: 5,
            maxHp: 5,
            move: 4,
            maxMove: 4,
            armor: 0
        }
    })
    const newSession = {
        ...session,
        status: MatchStatus.ACTIVE,
        hostPlayerId: currentUser.id,
        players, //TODO, make basic map
        // map: Thunderdome.map((row, i) => 
        //         row.map((tile:Tile, j) => {
        //             let player = players.find(player=>player.x===i && player.y === j)
        //             return {
        //                 ...tile,
        //                 x:i,
        //                 y:j,
        //                 playerId: player ? player.id : null,
        //             }
        //         })
        //     ),
        ticks: 0,
        turnTickLimit: 15
    }
    sendSessionUpdate(newSession)
}

export const onMovePlayer = (player:Player, session:Session) => {
    sendReplaceMapPlayer(session, player)
}

export const onAttackTile = (attacker:Player, tile:Tile, session:Session) => {
    const target = session.players.find(player=>player.id === tile.playerId)
    if(target){
        //TODO add weapon accuracy to basic attacks? 
        //target.hp -= attacker.weapon.atk - target.armor
        sendReplaceMapPlayer(session, target)
        //TODO on other client, if your hp is ever < 0 you are teleported to the hub and are frozen for 20 secs
    } 

    sendReplaceMapPlayer(session, attacker)
}

export const onMatchTick = (session:Session) => {
    session.ticks++
    if(session.ticks >= session.turnTickLimit){
        onEndTurn(session)
        return
    }
    //TODO advance all network lines by one if possible (possible = unopposed, or of a winning color takes a segment, cannot pass any uncontrolled firewall), 
    //check for new network line color orders and start a segment fill
    //check for capture progress on firewalls 
    //(hacker present at a firewall touched by controlled network line and using capture ability) 
    //or hub (fully controlled network line touching) 
    //(capturing a final firewall causes unstoppable forward progress)
    //check victory

    sendSessionTick(session)
}

const onEndTurn = (session:Session) => {
    session.ticks = 0
    session.turn++
    session.players.forEach(player=>{
        if(player.id===session.activePlayerId) player.move = player.maxMove
        //TODO reduce cdr of abilities
        //Check for any status to wear off
        //Set next player active
    })
    sendSessionUpdate(session)
}

export const onUpdatePlayer = (player:Player, session:Session) => {
    sendReplacePlayer(session, player)
}

export const onChooseCharacter = (character:Character, session:Session) => {

}

export const onMatchWon = (session:Session) => {
    session.status = MatchStatus.WIN
    sendSessionUpdate(session)
}

export const onCleanSession = () => {
    dispatch({
        type: ReducerActions.MATCH_CLEANUP
    })
}

const sendSessionUpdate = (session:Session) => {
    server.publishMessage({
        type: ReducerActions.MATCH_UPDATE,
        sessionId: session.sessionId,
        session: {
            ...session
        }
    })
}

const sendSessionTick = (session:Session) => {
    server.publishMessage({
        type: ReducerActions.MATCH_TICK,
        sessionId: session.sessionId
    })
}

const sendReplacePlayer = (session:Session, player:Player) => {
    server.publishMessage({
        type: ReducerActions.PLAYER_REPLACE,
        sessionId: session.sessionId,
        player
    })
}

const sendReplaceMapPlayer = (session:Session, player:Player) => {
    server.publishMessage({
        type: ReducerActions.PLAYER_MAP_REPLACE,
        sessionId: session.sessionId,
        player
    })
}