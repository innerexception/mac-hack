import * as React from 'react';
import AppStyles from '../AppStyles';
import { TopBar } from './Shared';
import { EmptyTile, TileSubType, TileType } from '../../enum'
import { LightButton, Button } from './Shared'
import { getRandomInt } from './Util'
import * as FileSaver from 'file-saver'

export default class Editor extends React.Component {

    state = { 
        map: [[EmptyTile]],
        selectedTile: EmptyTile,
        tileBrush: TileType.GRID,
        tileRune: 'a'
    }

    setTileType = async (nextTile:Tile) => {
        await this.setState({selectedTile: nextTile})
        let newTile = {
            ...this.state.selectedTile,
            type: this.state.tileBrush,
            subType: this.state.tileRune
        }
        this.state.map[this.state.selectedTile.x][this.state.selectedTile.y] = newTile
        this.setState({map: this.state.map})
    }

    setTileMinionSpawn = () => {
        let newTile = {
            ...this.state.selectedTile,
            isSpawner: !this.state.selectedTile.isSpawner
        }
        this.state.map[this.state.selectedTile.x][this.state.selectedTile.y] = newTile
        this.setState({map: this.state.map, selectedTile:newTile})
    }

    setTilePlayerSpawn = () => {
        let newTile = {
            ...this.state.selectedTile,
            isCharacterSpawn: !this.state.selectedTile.isCharacterSpawn
        }
        this.state.map[this.state.selectedTile.x][this.state.selectedTile.y] = newTile
        this.setState({map: this.state.map, selectedTile:newTile})
    }

    setTileColor = () => {
        let newTile = {
            ...this.state.selectedTile,
            teamColor: this.state.selectedTile.teamColor === AppStyles.colors.white ? AppStyles.colors.grey2 : AppStyles.colors.white
        }
        this.state.map[this.state.selectedTile.x][this.state.selectedTile.y] = newTile
        this.setState({map: this.state.map, selectedTile:newTile})
    }

    setTileFirewall = () => {
        let newTile = {
            ...this.state.selectedTile,
            isFirewall: !this.state.selectedTile.isFirewall
        }
        this.state.map[this.state.selectedTile.x][this.state.selectedTile.y] = newTile
        this.setState({map: this.state.map, selectedTile:newTile})
    }
    clearTile = () => {
        let newTile = {
            ...EmptyTile,
            x: this.state.selectedTile.x,
            y: this.state.selectedTile.y
        }
        this.state.map[this.state.selectedTile.x][this.state.selectedTile.y] = newTile
        this.setState({map: this.state.map, selectedTile:newTile})
    }

    chooseFile = async (e:FileList) => {
        const data = await new Response(e[0]).text()
        this.setState({map: JSON.parse(data)})
    }

    saveFile = () => {
        var file = new File([JSON.stringify(this.state.map)], "mapExport.json", {type: "text/json;charset=utf-8"});
        FileSaver.saveAs(file);
    }

    setMapWidth = (w:number) => {
        let map = new Array(w).fill([])
        this.setState({map})
    }

    setMapHeight = (h: number) => {
        let map = this.state.map.map((row, x) => new Array(h).fill({...EmptyTile, x}))
        map = map.map((row, x) => row.map((tile, y) => {return {...tile, y}}))
        this.setState({map})
    }
    
    render(){
        return (
            <div style={{...AppStyles.window, padding:'0.5em', maxWidth:'25em'}}>
                {TopBar('Editor')}
                <div>
                    <input type="file" onChange={ (e) => this.chooseFile(e.target.files) }/>
                </div>
                <div>
                    W: <input type='number' value={this.state.map.length} onChange={(e)=>this.setMapWidth(+e.currentTarget.value)}/>
                    H: <input type='number' value={this.state.map[0].length} onChange={(e)=>this.setMapHeight(+e.currentTarget.value)}/>
                </div>
                <div style={styles.tileInfo}>
                    <h4 style={{margin:0}}>{this.state.selectedTile.type} {this.state.selectedTile.x}, {this.state.selectedTile.y}</h4>
                    <div>
                        {Object.keys(TileType).map((key:TileType) => 
                            <div style={{display:'flex', flexWrap:'wrap'}}>
                                <h6>{key}</h6>
                                {TileSubType[key].map((subType) => 
                                    <div onClick={()=>this.setState({tileBrush: key, tileRune:subType})} style={{fontFamily:'Grid', color: AppStyles.colors.grey3, fontSize:'2em', lineHeight:'0.8em'}}>
                                        {subType}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {LightButton(true, this.setTileMinionSpawn, 'Net Spawner')}
                    {LightButton(true, this.setTilePlayerSpawn, 'Player Spawner')}
                    {LightButton(true, this.setTileColor, 'Team')}
                    {LightButton(true, this.setTileFirewall, 'Firewall')}
                    {LightButton(true, this.clearTile, 'Clear')}
                </div>
                <div style={styles.mapFrame}>
                    <div style={{display:'flex'}}>
                        {this.state.map.map((row) => 
                            <div>
                                {row.map((tile:Tile) => 
                                    <div style={{
                                            ...styles.tile, 
                                            background: 'transparent',
                                            borderStyle: isSelectedTile(tile, this.state.selectedTile) ? 'dashed' : 'dotted'
                                        }} 
                                        onClick={()=>this.setTileType(tile)}> 
                                        <div style={{fontFamily:'Grid', color: AppStyles.colors.grey3, fontSize:'2em', lineHeight:'0.8em'}}>{tile.subType}</div>
                                        {tile.isSpawner && <div style={{fontFamily:'Item', color: tile.teamColor, fontSize:'0.5em', textAlign:'left', position:'absolute', top:0,left:0}}>a</div>}
                                        {tile.isFirewall && <div style={{fontFamily:'Item', color: tile.teamColor, fontSize:'0.5em', textAlign:'left',position:'absolute', bottom:0,left:0}}>b</div>}
                                        {tile.type === TileType.HUB && <div style={{fontFamily:'Item', color: tile.teamColor, fontSize:'0.5em', textAlign:'left',position:'absolute', top:0,right:0}}>c</div>}
                                        {tile.isCharacterSpawn && <div style={{fontFamily:'Item', color: tile.teamColor, fontSize:'0.5em', textAlign:'left',position:'absolute', bottom:0,right:0}}>d</div>}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {Button(true, this.saveFile, 'Export')}
            </div>
        )
    }
}

const isSelectedTile = (tile:Tile, selectedTile?:Tile) => {
    if(selectedTile){
        if(tile.x === selectedTile.x && tile.y === selectedTile.y) 
            console.log(tile + ' equals '+ selectedTile)
        return tile.x === selectedTile.x && tile.y === selectedTile.y
    }
    return false
}

const styles = {
    mapFrame: {
        position:'relative' as 'relative',
        backgroundImage: 'url('+require('../assets/whiteTile.png')+')',
        backgroundRepeat: 'repeat',
        overflow:'auto',
        maxHeight:'60vh',
        maxWidth:'100%'
    },
    tileInfo: {
        height: '5em',
        backgroundImage: 'url('+require('../assets/whiteTile.png')+')',
        backgroundRepeat: 'repeat',
        marginBottom: '0.5em',
        padding: '0.5em',
        border: '1px dotted',
        display:'flex',
        justifyContent:'space-between',
        flexWrap:'wrap' as 'wrap',
        overflow:'auto'
    },
    tile: {
        width: '2em',
        height:'1.7em',
        border: '1px',
        position:'relative' as 'relative'
    },
}