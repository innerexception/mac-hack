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
        tileBrush: TileType.GRID
    }

    setTileType = async (nextTile:Tile) => {
        await this.setState({selectedTile: nextTile})
        let newTile = {
            ...this.state.selectedTile,
            playerId: null as null,
            item: null as null,
            weapon: null as null,
            type: this.state.tileBrush,
            subType: (TileSubType as any)[this.state.tileBrush][getRandomInt((TileSubType as any)[this.state.tileBrush].length)]
        }
        this.state.map[this.state.selectedTile.x][this.state.selectedTile.y] = newTile
        this.setState({map: this.state.map})
    }

    setTileMinionSpawn = () => {
        let newTile = {
            ...this.state.selectedTile,
            minionSpawnerId: this.state.selectedTile.minionSpawnerId === 'red' ? 'blue' : 'red'
        }
        this.state.map[this.state.selectedTile.x][this.state.selectedTile.y] = newTile
        this.setState({map: this.state.map, selectedTile:newTile})
    }

    setTileHub = () => {
        let newTile = {
            ...this.state.selectedTile,
            hubId: this.state.selectedTile.hubId === 'red' ? 'blue' : 'red'
        }
        this.state.map[this.state.selectedTile.x][this.state.selectedTile.y] = newTile
        this.setState({map: this.state.map, selectedTile:newTile})
    }
    setTileFirewall = () => {
        let newTile = {
            ...this.state.selectedTile,
            firewallId: this.state.selectedTile.firewallId === 'red' ? 'blue' : 'red'
        }
        this.state.map[this.state.selectedTile.x][this.state.selectedTile.y] = newTile
        this.setState({map: this.state.map, selectedTile:newTile})
    }
    clearTile = () => {
        let newTile = {
            ...EmptyTile
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
                    <div style={{display:'flex'}}>
                        {Object.keys(TileType).map((key:TileType) => LightButton(true, ()=>this.setState({tileBrush: key}), key))}
                    </div>
                    {LightButton(true, this.setTileMinionSpawn, 'Minion Spawner')}
                    {LightButton(true, this.setTileHub, 'Hub')}
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
                                        <div style={{fontFamily:'Terrain', color: AppStyles.colors.grey3, fontSize:'2em'}}>{tile.subType}</div>
                                        {tile.minionSpawnerId && <div style={{fontFamily:'Item', color: AppStyles.colors.grey3, fontSize:'0.5em', textAlign:'left'}}>a</div>}
                                        {tile.firewallId && <div style={{fontFamily:'Item', color: AppStyles.colors.grey3, fontSize:'0.5em', textAlign:'left'}}>b</div>}
                                        {tile.hubId && <div style={{fontFamily:'Item', color: AppStyles.colors.grey3, fontSize:'0.5em', textAlign:'left'}}>c</div>}
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
        flexWrap:'wrap' as 'wrap'
    },
    tile: {
        width: '2em',
        height:'2em',
        border: '1px',
        position:'relative' as 'relative'
    },
}