import { TileType, FourCoordinatesArray, Characters } from '../../enum'
import { Position, Toaster } from "@blueprintjs/core"
import AppStyles from '../AppStyles';

export const toast = Toaster.create({
    className: `recipe-toaster`,
    position: Position.TOP,
})

export const getObstructionAt = (coords:Tuple, map:Array<Array<Tile>>) => {
    let tile = map[coords.x][coords.y]
    return tile && tile.type === TileType.GAP || tile.playerId
}

export const getAIPlayer = () => {
    return {
        name:'Bot',
        id: getId(),
        teamColor: AppStyles.colors.grey2,
        respawnTurns: 0,
        character: null,
        x:-1,
        y:-1
    }
}

export const getRandomInt = (max:number) => Math.floor(Math.random() * Math.floor(max))

export const getId = ()=>Date.now() + ''+ Math.random()

export const getUncontrolledAdjacentNetworkLine = (node:Tile, map:Array<Array<Tile>>) => {
    let found
    for(var direction of FourCoordinatesArray){
        const candidateX = node.x + direction.x
        let candidate = map[candidateX] && map[candidateX][node.y+direction.y]
        if((candidate.type === TileType.NETWORK_LINE || candidate.isFirewall || candidate.isSpawner) && candidate.teamColor !== node.teamColor)
            found = candidate
    }
    return found as Tile
}

export const getControlledFirewall = (node:Tile, map:Array<Array<Tile>>) => {
    let found
    for(var direction of FourCoordinatesArray){
        const candidateX = node.x + direction.x
        let candidate = map[candidateX] && map[candidateX][node.y+direction.y]
        if(candidate.isFirewall&& candidate.teamColor === node.teamColor)
            found = candidate
    }
    return found as Tile
}

export const getInitialPaths = (map:Array<Array<Tile>>) => {
    let paths = new Array<Path>()
    map.forEach(row=>row.forEach(tile => {
        if(tile.isSpawner) {
            paths.push({ nodes: [tile] })
        }
    }))
    return paths
}
