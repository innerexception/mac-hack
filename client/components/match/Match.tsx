import * as React from 'react'
import { onMatchTick } from '../uiManager/Thunks'
import AppStyles from '../../AppStyles';
import Map from './Map'
import { TopBar, Button } from '../Shared'

interface Props {
    currentUser: Player
    activeSession: Session
}

interface State {
    isHost: boolean
    interval: NodeJS.Timeout | number
    showMatchOptions: boolean
}

export default class Match extends React.Component<Props, State> {

    state = {
        interval: 0,
        isHost: this.props.activeSession.hostPlayerId === this.props.currentUser.id,
        showMatchOptions: false,
    }

    componentDidMount = () => {
        this.setState({interval: this.state.isHost ? setInterval(()=>onMatchTick(this.props.activeSession), 1000) : 0})
    }

    render(){
        return (
            <div style={AppStyles.window}>
                {TopBar('MacHack')}
                <div style={{padding:'0.5em', maxWidth:'25em'}}>
                    <Map map={this.props.activeSession.map} 
                        me={this.props.activeSession.players.find(player=>player.id===this.props.currentUser.id)}
                        isHost={this.state.isHost}
                        activeSession={this.props.activeSession}
                        players={this.props.activeSession.players}/>
                    <div style={{...styles.modal, display: this.state.showMatchOptions ? 'flex':'none'}}>
                        <div style={{display:'flex'}}>
                            options menu
                        </div>
                    </div>
                </div>
         </div>
        )
    }
}

const styles = {
    frame: {
        padding:'1em',
        position:'relative' as 'relative'
    },
    modal: {
        backgroundImage: 'url('+require('../../assets/tiny2.png')+')',
        backgroundRepeat: 'repeat',
        position:'absolute' as 'absolute',
        top:0, left:0, right:0, bottom:0,
        maxWidth: '20em',
        maxHeight: '20em',
        border: '1px solid',
        borderRadius: '5px',
        margin: 'auto',
        flexDirection: 'column' as 'column',
        justifyContent: 'flex-start'
    },
    circleButton: {
        cursor:'pointer',
        height:'2em',
        width:'2em',
        display:'flex',
        alignItems:'center',
        justifyContent: 'center'
    },
    choiceBtn: {
        margin: 0,
        cursor: 'pointer',
        border: '1px solid',
        padding: '0.5em',
        borderRadius: '5px',
    },
    disabled: {
        position:'absolute' as 'absolute',
        top:0,
        left:0,
        background:'black',
        opacity: 0.1,
        width:'100vw',
        height:'100vh'
    },
    toggleButton: {
        cursor:'pointer',
        border:'1px solid',
        borderRadius: '3px',
        padding:'0.5em'
    },
    scrollContainer: {
        overflow: 'auto',
        height: '66%',
        marginBottom:'0.5em',
        marginTop: '0.5em',
        background: 'white',
        border: '1px solid',
        padding: '0.5em'
    },
    unitRow: {
        display: 'flex',
        alignItems: 'center',
        width: '33%',
        justifyContent: 'space-between'
    }
}