import App, { dispatch } from '../../../client/App'
import { ReducerActions, MatchStatus, StatusEffect, MaxRespawnTurns } from '../../../enum'
import * as TestGround from '../../assets/TestGround.json'
import { getUncontrolledAdjacentNetworkLine, getInitialPaths, getControlledFirewall } from '../Util';
import { server } from '../../App'
import AppStyles from '../../AppStyles';
import Match from '../match/Match';

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
    const map = TestGround.map((row, i) => 
        row.map((tile:Tile, j) => {
            return {
                ...tile,
                x:i,
                y:j,
                virusColor: tile.isSpawner ? 'red' : '',
                isCapturableBy: {},
                maxCaptureTicks: tile.type === TileType.HUB ? 10 : 2
            }
        }))
    const newSession = {
        ...session,
        status: MatchStatus.ACTIVE,
        hostPlayerId: currentUser.id,
        activePlayerId: currentUser.id,
        map,
        ticks: 0,
        paths: getInitialPaths(map),
        turnTickLimit: 15,
        hubDamage: {}
    }

    sendSessionUpdate(newSession)
}

export const onMovePlayer = (player:Player, session:Session) => {
    sendReplaceMapPlayer(session, player)
}

export const onChooseVirus = (player:Player, color:string, session:Session) => {
    session.map[player.x][player.y].virusColor = color
    sendSessionUpdate(session)
}

export const onAttackTile = (attacker:Player, ability:Ability, tile:Tile, session:Session) => {
    const target = session.players.find(player=>player.id === tile.playerId)
    if(target){
        target.character.hp -= ability.damage - target.character.armor
        if(target.character.hp <= 0){
            target.character = null
            target.respawnTurns = MaxRespawnTurns
        }
        else {
            //TODO apply ability status effect
        }
        sendReplaceMapPlayer(session, target)
    } 

    sendReplaceMapPlayer(session, attacker)
}

export const onMatchTick = (session:Session) => {
    session.ticks++
    if(session.ticks >= session.turnTickLimit){
        onEndTurn(session)
        return
    }
    sendSessionTick(session)
}

export const onEndTurn = (session:Session) => {
    session.ticks = 0
    session.turn++
    session.players.forEach((player, i)=>{
        if(player.id===session.activePlayerId){
            player.character.move = player.character.maxMove
            session.activePlayerId = session.players[(i+1) % session.players.length].id
        }
        player.character.abilities.forEach(ability=>ability.cdr > 0 && ability.cdr--)
    })
    //TODO Check for any status to wear off
    
    
    //advance all network lines by one if possible (possible = unopposed, or of a winning color takes a segment, cannot pass any uncontrolled firewall), 
    session.paths.forEach(path=>{

        //walk every node in each path except the last one, 
        let count = 0
        for(var i=0; i< path.nodes.length; i++){
            //advance colors of sections by 1 position, 3 times
            if(i>0){
                //0th element is the spawner
                let previousNode = path.nodes[i-1]
                if(previousNode.virusColor !== path.nodes[i].virusColor){
                    path.nodes[i].virusColor = previousNode.virusColor
                    count++
                    if(count > 2) break
                }
            }
        }

        //special case for new insertion at ends of paths
        let currentEnd = path.nodes[path.nodes.length-1]
        //search the 4 directions from the end to find a tile of type Network Line that is not controlled by us
        let nextTile = getUncontrolledAdjacentNetworkLine(currentEnd, session.map)
        if(!nextTile){
            //we found a controlled firewall that was not added to the path yet, maybe
            nextTile = getControlledFirewall(currentEnd, session.map)
            if(nextTile){
                //Firewall is added
                nextTile.virusColor = currentEnd.virusColor
                path.nodes.push(nextTile)
            }
        }
        if(nextTile.isFirewall){
            if(nextTile.teamColor !== currentEnd.teamColor){
                //Must manually take firewalls
                nextTile.isCapturableBy[currentEnd.teamColor] = true
            }
        }
        else if(nextTile.isSpawner){
            //deal hub damage
            session.hubDamage[nextTile.teamColor] ? session.hubDamage[nextTile.teamColor]++ : session.hubDamage[nextTile.teamColor]=1
            nextTile.captureTicks++
            //TODO visual cue and ending the match
            let activePlayer = session.players.find(player=>player.id===session.activePlayerId)
            if(session.hubDamage[nextTile.teamColor] > 10){
                if(nextTile.teamColor === activePlayer.teamColor)
                    session.status = MatchStatus.LOSE
                else 
                    session.status = MatchStatus.WIN
            }
        }
        else if(nextTile.teamColor === AppStyles.colors.grey1) {
            //Next tile was unowned
            //Network line is taken
            nextTile.teamColor = currentEnd.teamColor
            nextTile.virusColor = currentEnd.virusColor
            path.nodes.push(nextTile)
        }
        else{
            //paths have met.
            //Next tile is owned by other team. find other path
            let otherPath = session.paths.find(path=>
                !!path.nodes.find(node=>node.x===nextTile.x && node.y===nextTile.y))
            //Network line is taken depending on color, only winning cases covered
            let capture = false

            if(nextTile.virusColor === 'red' && currentEnd.virusColor === 'blue')
                capture = true
            if(nextTile.virusColor === 'green' && currentEnd.virusColor === 'red')
                capture = true
            if(nextTile.virusColor === 'blue' && currentEnd.virusColor === 'green')
                capture = true
                
            if(capture){
                //check if previous node was a firewall, and mark as uncappable by losing team
                if(currentEnd.isFirewall)
                    currentEnd.isCapturableBy[nextTile.teamColor] = false
                
                //line is taken
                nextTile.teamColor = currentEnd.teamColor
                nextTile.virusColor = currentEnd.virusColor
                //remove tile from other path
                //add to our path
                path.nodes.push(otherPath.nodes.pop())
            }
        }
    })
    //(capturing a final firewall causes unstoppable forward progress)
    //check victory
    //TODO, remove captureTicks from any firewall which is not occupied at the end of any turn
    
    sendSessionUpdate(session)
}

export const onUpdatePlayer = (player:Player, session:Session) => {
    sendReplaceMapPlayer(session, player)
}

export const onApplyCapture = (player:Player, session:Session) => {
    let tile = session.map[player.x][player.y]
    if(tile.isFirewall && tile.teamColor !== player.teamColor) {
        tile.captureTicks++
        if(tile.captureTicks > tile.maxCaptureTicks){
            if(tile.teamColor == AppStyles.colors.grey1)
                tile.teamColor = player.teamColor
            else tile.teamColor = AppStyles.colors.grey1
            tile.captureTicks = 0
        }
    }
    player.character.abilities.forEach(ability=>{
        if(ability.effect === StatusEffect.CAPTURE) ability.cdr = ability.maxCdr
    })
    sendSessionUpdate(session)
}

export const onChooseCharacter = (player:Player, character:Character, session:Session) => {
    session.players.forEach(splayer=>{
        if(splayer.id===player.id){
            player.character = {...character}
            if(player.x===-1){
                let pad
                session.map.forEach(row=>row.forEach(tile=>{if(tile.isCharacterSpawn && tile.teamColor === player.teamColor && !tile.playerId) pad = tile}))
                player.x = pad.x
                player.y = pad.y
                session.map[pad.x][pad.y].playerId = player.id
            }
        } 
    })
    sendSessionUpdate(session)
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
    if(session.isSinglePlayer){
        dispatch({
            type: ReducerActions.MATCH_UPDATE,
            session: {...session}
        })
    }
    else
        server.publishMessage({
            type: ReducerActions.MATCH_UPDATE,
            sessionId: session.sessionId,
            session: {...session}
        })
}

const sendSessionTick = (session:Session) => {
    if(session.isSinglePlayer){
        dispatch({
            type: ReducerActions.MATCH_UPDATE,
            session: {...session}
        })
    }
    else
        server.publishMessage({
            type: ReducerActions.MATCH_TICK,
            sessionId: session.sessionId
        })
}

const sendReplaceMapPlayer = (session:Session, player:Player) => {
    if(session.isSinglePlayer){
        session.players.forEach(splayer=>{
            if(splayer.id === player.id){
                session.map.forEach(row => row.forEach(tile => {
                    if(tile.playerId && tile.playerId === player.id) delete tile.playerId
                }))
                var tile = session.map[player.x][player.y]
                tile.playerId = player.id
                splayer = {...player}
            } 
        })
        dispatch({
            type: ReducerActions.MATCH_UPDATE,
            session: {...session}
        })
    }
    else
        server.publishMessage({
            type: ReducerActions.PLAYER_MAP_REPLACE,
            sessionId: session.sessionId,
            player
        })
}