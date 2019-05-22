import * as React from 'react'
import { onMatchStart, onUpdatePlayer } from './uiManager/Thunks'
import AppStyles from '../AppStyles'
import { TopBar, LightButton } from './Shared'

interface Props { 
    activeSession:Session
    currentUser:Player
}

export default class Lobby extends React.Component<Props> {

    state = { selectedAvatarIndex: 0, selectedTeamIndex: 0, teams: [AppStyles.colors.white, AppStyles.colors.grey2] }

    startMatch = () => {
        console.log(this.props)
        onMatchStart(
            this.props.currentUser, 
            this.props.activeSession)
    }

    getErrors = () => {
        let error, activeTeams=0
        if(this.props.activeSession.players.length < 4) error= 'Waiting for more to join...'
        if(this.props.activeSession.players.length > 8) error= 'Too many players in match...'
        if(activeTeams !== 2) error='There must be 2 teams...'
        return error
    }

    changeTeam = () => {
        const index = (this.state.selectedTeamIndex+1)%this.state.teams.length
        let team = this.state.teams[index]
        this.setState({selectedTeamIndex: index})
        onUpdatePlayer({...this.props.currentUser, teamColor:team}, this.props.activeSession)
    }

    render(){
        return (
            <div style={AppStyles.window}>
                {TopBar('MacHack')}
                <div style={{padding:'0.5em'}}>
                    <h3>{this.props.activeSession.sessionId} Lobby</h3>
                    <div style={{marginBottom:'1em', alignItems:'center', overflow:'auto', maxHeight:'66vh'}}>
                        {this.props.activeSession.players.map((player:Player) => 
                            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%'}}>
                                <div style={{marginRight:'0.5em'}}>
                                    {LightButton(player.id === this.props.currentUser.id, this.changeTeam, 'Change Team')}
                                </div>
                            </div>
                        )}
                    </div>
                    <div>{this.getErrors()}</div>
                    {this.getErrors() ? '' : 
                        <div style={AppStyles.buttonOuter} 
                            onClick={this.startMatch}>
                            <div style={{border:'1px solid', borderRadius: '3px', opacity: this.getErrors() ? 0.5 : 1}}>Start</div>
                        </div>}
                </div>
            </div>
            
        )
    }
}

const styles = {
    nameTag: {
        background: 'white',
        border: '1px solid',
        width: '100%',
        padding: '0.25em',
        marginBottom: '5px',
        minWidth:'10em',
        display:'flex',
        justifyContent: 'space-between'
    }
}