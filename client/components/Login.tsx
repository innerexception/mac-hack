import * as React from 'react';
import { onLogin } from './uiManager/Thunks'
import AppStyles from '../AppStyles';
import { Button, LightButton, TopBar } from './Shared'
import { getId } from './Util'

export default class Login extends React.Component {
    state = { name: '', sessionId: '', isSinglePlayer: false}

    render(){
        return (
            <div style={AppStyles.window}>
                {TopBar('MacHack')}
                <div style={{padding:'0.5em'}}>
                    <div style={{display:'flex'}}>
                        {LightButton(!this.state.isSinglePlayer, ()=>this.setState({isSinglePlayer: true}), 'Multiplayer')}
                        {LightButton(this.state.isSinglePlayer, ()=>this.setState({isSinglePlayer: false}), 'Singleplayer')}
                    </div>
                    {this.state.isSinglePlayer ? 
                        <div>
                            <h3 style={{margin:'0'}}>Handle</h3>
                            <input style={{...styles.loginInput, marginBottom:'0.5em'}} type="text" value={this.state.name} onChange={(e)=>this.setState({name:e.currentTarget.value})}/>
                            <h3 style={{margin:'0'}}>Match Name</h3>
                            <input style={{...styles.loginInput, marginBottom:'1em'}} type="text" value={this.state.sessionId} onChange={(e)=>this.setState({sessionId:e.currentTarget.value})}/>
                            {Button(this.state.name && this.state.sessionId as any, ()=>onLogin(getUser(this.state.name), this.state.sessionId), 'Ok')}
                        </div>
                        :
                        <div>
                            {Button(true, ()=>onLogin(getUser(this.state.name)), 'Ok')}
                        </div>
                    }
                    
                </div>
            </div>
        )
    }
}

const getUser = (name:string) => {
   return {
        name,
        id: getId(),
        teamColor: AppStyles.colors.white,
        respawnTurns: 0,
        character: null,
        x:-1,
        y:-1
    }
}

const styles = {
    loginInput: {
        boxShadow: 'none',
        border: '1px solid',
        minWidth:'10em'
    }
}