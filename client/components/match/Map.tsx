import * as React from 'react'
import { onMovePlayer, onAttackTile, onApplyCapture, onChooseCharacter, onEndTurn, onChooseVirus } from '../uiManager/Thunks'
import AppStyles from '../../AppStyles';
import { FourCoordinatesArray, TileType, Directions, Characters, StatusEffect, Virii, MatchStatus } from '../../../enum'
import { Button, LightButton } from '../Shared'
import { compute } from '../Util';

interface Props {
    activeSession: Session
    me: Player
    players: Array<Player>
    map: Array<Array<Tile>>
    isHost: boolean
}

interface State {
    isPlayerAttacking: boolean
    attackAbility: Ability | null
    showDescription: Player | null
    showCharacterChooser: boolean
    showVirusChooser: boolean
    highlightTiles: Array<Array<boolean>>
    visibleTiles: Array<Array<boolean>>
}

export default class Map extends React.Component<Props, State> {

    state = {
        isPlayerAttacking: false,
        attackAbility: null as null,
        showDescription: null as null,
        showCharacterChooser: true,
        showVirusChooser: false,
        highlightTiles: [[false]],
        visibleTiles: getVisibleTilesOfPlayer(this.props.me, this.props.map),
        playerElRef: React.createRef()
    }

    componentDidMount = () => {
        window.addEventListener('keydown', (e)=>this.handleKeyDown(e.keyCode))
        this.startMovePlayer()
    }

    startMovePlayer = () => {
        this.setState({isPlayerAttacking:false, highlightTiles:[[false]]});
        if(this.state.playerElRef.current)
            (this.state.playerElRef.current as any).scrollIntoView({
                                                behavior: 'smooth',
                                                block: 'center',
                                                inline: 'center',
                                            })
    }
                
    getNotification = (notification:string) => {
            return (
                <div style={{...styles.disabled, display: 'flex'}}>
                    <div style={AppStyles.notification}>
                        <h3>{notification}</h3>
                    </div>
                </div>
            )
    }

    getCharacterChooser = () => 
        <div style={{...styles.disabled, display: 'flex'}}>
            <div style={AppStyles.notification}>
                <div style={{marginBottom:'0.5em'}}>
                    <div>Choose a Character</div>
                    {Characters.map(character => 
                        <div>
                            <div style={{fontFamily: 'Avatar'}}>{character.rune}</div>
                            {character.abilities.map(ability=>
                                <div>
                                    <h5>{ability.name}</h5>
                                    <h6>{ability.description}</h6>
                                </div>
                            )}
                            {LightButton(true, ()=>{onChooseCharacter(this.props.me, character, this.props.activeSession); this.setState({showCharacterChooser:false})}, character.id)}
                        </div>
                    )}
                </div>
            </div>
        </div>

    getVirusChooser = () => 
        <div style={{...styles.disabled, display: 'flex'}}>
            <div style={AppStyles.notification}>
                <div style={{marginBottom:'0.5em'}}>
                    <div>Choose a Virus</div>
                    {Virii.map(virusColor => 
                        <div>
                            <div>{virusColor}</div>
                            {LightButton(true, ()=>{onChooseVirus(this.props.me, virusColor, this.props.activeSession); this.setState({showVirusChooser:false})}, virusColor)}
                        </div>
                    )}
                </div>
            </div>
        </div>

    getMyInfo = () => {
        let player = this.props.me
        return <div style={styles.tileInfo}>
                    <div>
                        <div style={{display:'flex'}}>
                            <h6>Team:</h6>
                            <div style={{height:'1em', width:'1em', backgroundColor: player.teamColor}}/>
                        </div>
                        {player.character && 
                        <div>
                            <h6>{player.character.id}</h6>
                            <h6>Moves: {player.character.move} / {player.character.maxMove}</h6>
                        </div>}
                    </div>
                    {player.character?
                        <div style={{display:'flex', justifyContent:'space-between', width:'75%'}}>
                            {this.getActionButtons(player)}
                        </div>
                         : 
                        <div>
                            {player.respawnTurns === 0 ? LightButton(true, ()=>this.setState({showCharacterChooser: true}), 'Respawn')
                            :
                            <h4> You are Dead. Respawn available in {player.respawnTurns} turns.</h4>}
                        </div>
                    }
                </div>
    }
    

    moveUnit = (player:Player, direction:Directions) => {
        let candidateTile = {...this.props.map[player.x][player.y]}
        if(player.character.move > 0){
            switch(direction){
                case Directions.DOWN: candidateTile.y++
                     break
                case Directions.UP: candidateTile.y--
                     break
                case Directions.LEFT: candidateTile.x--
                     break
                case Directions.RIGHT: candidateTile.x++
                     break
            }
            if(!this.getObstruction(candidateTile.x, candidateTile.y)){
                candidateTile = {...this.props.map[candidateTile.x][candidateTile.y]}
                player.x = candidateTile.x
                player.y = candidateTile.y
                player.character.move--
                candidateTile.playerId = player.id
                this.setState({visibleTiles: getVisibleTilesOfPlayer(player, this.props.map)}, 
                    ()=>onMovePlayer(player, this.props.activeSession));
                if(this.state.playerElRef.current)
                    (this.state.playerElRef.current as any).scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                            inline: 'center',
                        })
            }
        }
    }

    getObstruction = (x:number, y:number) => {
        let tile = this.props.map[x][y]
        if(tile){
            if(tile.playerId) return true
            if(tile.type === TileType.GAP){
                return true 
            } 
            return false
        }
        return true
    }

    getAbilityHandler = (player:Player, ability:Ability) => {
        if(ability.effect === StatusEffect.CAPTURE) return ()=>onApplyCapture(player, this.props.activeSession)
        if(ability.effect === StatusEffect.EDIT_STREAM) return ()=>this.setState({showVirusChooser: true})
        else return ()=>this.showAttackTiles(player, ability)
    }

    showAttackTiles = (player:Player, ability:Ability) => {
        let highlightTiles = getTilesInRange(player, ability, this.props.map)
        this.setState({isPlayerAttacking: true, attackAbility:ability, highlightTiles})
    }

    hideAttackTiles = () => {
        this.setState({isPlayerAttacking: false, highlightTiles:[[false]]})
    }

    performAttackOnTile = (tile:Tile, ability:Ability) => {
        //TODO flash/shake tile's unit here with Posed?
        onAttackTile(this.props.me, ability, tile, this.props.activeSession)
        this.hideAttackTiles()
    }

    getActionButtons = (player:Player) => {
        if(player){
            let isOwner = player.id === this.props.me.id
            let tile = this.props.activeSession.map[player.x][player.y]
            if(isOwner){
                let buttons = player.character.abilities.map(ability=>
                    LightButton(getAbilityState(ability, this.props.map[player.x][player.y], player), this.getAbilityHandler(player, ability), ability.name))
                return <div style={{display:'flex', flexDirection:'column', flexWrap:'wrap', width:'50%'}}>    
                            {buttons}
                            {tile.isCharacterSpawn && tile.teamColor === player.teamColor && LightButton(true, ()=>this.setState({showCharacterChooser:true}), 'Change Character')}
                            {LightButton(this.props.me.id === this.props.activeSession.activePlayerId, ()=>onEndTurn(this.props.activeSession), 'End Turn')}
                       </div>
            }
        }
        return <span/>
    }

    getPlayerPortrait = (tile:Tile) => {
        let tileUnit = this.props.activeSession.players.find(player=>player.id === tile.playerId)
        if(tileUnit){
            return <div style={{...styles.unitFrame, opacity: getUnitOpacity(tileUnit, this.props.me, this.state.visibleTiles)}} 
                        ref={tileUnit.id === this.props.me.id && this.state.playerElRef as any}>
                        <div style={{fontFamily:'Avatar', fontSize:'1em', width:'1em', height:'1em', backgroundColor:tileUnit.teamColor, borderRadius:'50%'}}>{tileUnit.character.hp > 0 ? tileUnit.character.rune : 'U'}</div>
                    </div>
        }
        return <span/>
    }

    getTileClickHandler = (tile:Tile) => {
        if(this.state.isPlayerAttacking) return ()=>this.performAttackOnTile(tile, this.state.attackAbility)
        return ()=>this.setState({isPlayerAttacking:null, highlightTiles:[[false]]})
    }

    handleKeyDown = (keyCode:number) =>{
        if(this.props.me.character.hp > 0)
            switch(keyCode){
                case 65:
                    this.state.isPlayerAttacking ? this.hideAttackTiles():this.showAttackTiles(this.props.me, this.props.me.character.abilities.find(ability=>ability.name==='Attack'))
                    break
                case 38:
                    this.moveUnit(this.props.me, Directions.UP)
                    break
                case 40: 
                    this.moveUnit(this.props.me, Directions.DOWN)
                    break
                case 37: 
                    this.moveUnit(this.props.me, Directions.LEFT)
                    break
                case 39: 
                    this.moveUnit(this.props.me, Directions.RIGHT)
                    break
            }
    }

    render(){
        return (
            <div>
                {this.getMyInfo()}
                <div style={{position:'relative'}}>
                    <div style={styles.mapFrame}>
                        <div style={{display:'flex'}}>
                            {this.props.map.map((row, x) => 
                                <div>
                                    {row.map((tile:Tile, y) => 
                                        <div style={{
                                                ...styles.tile, 
                                                background: this.state.highlightTiles[x] && this.state.highlightTiles[x][y]===true ? AppStyles.colors.grey2 : 'transparent',
                                            }} 
                                            onClick={this.getTileClickHandler(tile)}>
                                            <div style={{position:'absolute', backgroundColor:'black', zIndex:2, top:0,left:0, opacity: 0.5, width:'100%', height: ((tile.captureTicks/tile.maxCaptureTicks)*100)+'%'}}/>
                                            <div style={{
                                                fontFamily:'Grid', 
                                                backgroundColor: getTileBackgroundColor(tile), 
                                                color: getTileForegroundColor(tile), 
                                                fontSize:'2em', 
                                                lineHeight:'0.8em', 
                                                opacity: getTerrainOpacity(tile, this.state.visibleTiles)}}>{tile.subType}</div>
                                            {tile.playerId && this.getPlayerPortrait(tile)}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {this.state.showCharacterChooser && this.getCharacterChooser()}
                    {this.state.showVirusChooser && this.getVirusChooser()}
                    {this.props.activeSession.status === MatchStatus.LOSE && this.getNotification("Your hub has been hacked!")}
                    {this.props.activeSession.status === MatchStatus.WIN && this.getNotification("You have hacked the enemy hub!")}
                </div>
                <div style={{marginTop:'0.5em'}}>
                    Turn will end in {this.props.activeSession.turnTickLimit - this.props.activeSession.ticks} sec
                </div>
            </div>
        )
    }
}

const getUnitOpacity = (player:Player, me:Player, visibleTiles: Array<Array<boolean>>) => {
    let isOwner = player.id === me.id
    if(isOwner) 
        return 1
    else 
        return visibleTiles[player.x][player.y] ? 0.5 : 0
}

const getTileBackgroundColor = (tile:Tile) => {
    if(tile.type === TileType.NETWORK_LINE || tile.isFirewall || tile.isSpawner || tile.type === TileType.HUB)
        return tile.teamColor
    else return 'transparent'
}

const getTileForegroundColor = (tile:Tile) => {
    if(tile.type === TileType.NETWORK_LINE) return tile.virusColor
    return AppStyles.colors.grey3
}

const getTerrainOpacity = (tile:Tile, visibleTiles: Array<Array<boolean>>) => {
    return visibleTiles[tile.x][tile.y] ? 1 : 0.5
}

const getTilesInRange = (player:Player, ability:Ability, map:Array<Array<Tile>>) => {
    let tiles = new Array(map.length).fill(null).map((item) => 
                    new Array(map[0].length).fill(false))
    //TODO: abilities may not be linear only
    FourCoordinatesArray.forEach((direction) => {
        let candidateX = player.x
        let candidateY = player.y
        for(var i=ability.range; i>0; i--){
            candidateX += direction.x
            candidateY += direction.y
            if(candidateY >= 0 && candidateX >= 0 
                && candidateX < map.length 
                && candidateY < map[0].length)
                tiles[candidateX][candidateY] = true
        }
    })
    return tiles
}

const getVisibleTilesOfPlayer = (player:Player, map:Array<Array<Tile>>) => {
    let tiles = new Array(map.length).fill(null).map((item) => 
                    new Array(map[0].length).fill(false))
    if(player.x > -1){
        return compute(player.x, player.y, player.character.sight, map)
    }
    return tiles
}

const getAbilityState = (ability:Ability, tile:Tile, player:Player) => {
    if(ability.effect === StatusEffect.CAPTURE){
        if(tile.isFirewall && tile.teamColor !== player.teamColor && ability.cdr === 0 && tile.isCapturableBy[player.teamColor])
            return true
        else return false
    } 
    if(ability.effect === StatusEffect.EDIT_STREAM){
        if(tile.isSpawner && tile.teamColor === player.teamColor)
            return true
        else return false
    }
    return ability.cdr === 0
}

const styles = {
    disabled: {
        pointerEvents: 'none' as 'none',
        alignItems:'center', justifyContent:'center', 
        position:'absolute' as 'absolute', top:0, left:0, width:'100%', height:'100%'
    },
    mapFrame: {
        position:'relative' as 'relative',
        backgroundImage: 'url('+require('../../assets/whiteTile.png')+')',
        backgroundRepeat: 'repeat',
        overflow:'auto',
        maxHeight:'60vh',
        maxWidth:'100%'
    },
    tileInfo: {
        height: '5em',
        backgroundImage: 'url('+require('../../assets/whiteTile.png')+')',
        backgroundRepeat: 'repeat',
        marginBottom: '0.5em',
        padding: '0.5em',
        border: '1px dotted',
        display:'flex',
        justifyContent:'space-between'
    },
    tile: {
        width: '2em',
        height:'1.7em',
        border: '1px',
        position:'relative' as 'relative'
    },
    tileItem: {
        fontFamily:'Item', color: AppStyles.colors.grey2, fontSize:'0.6em', position:'absolute' as 'absolute', top:0, left:0
    },
    levelBarOuter: {
        height:'0.25em',
        background: AppStyles.colors.white
    },
    unitFrame: {position: 'absolute' as 'absolute', top: '0px', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' as 'column', alignItems: 'center', zIndex:3}
}