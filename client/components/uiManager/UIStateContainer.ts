import { connect } from 'react-redux'
import UIManager from './UIManager'

const mapStateToProps = (state:RState) => {
    return state
};

const mapDispatchToProps = (dispatch:any) => {
    return {
        
    }
};


const UIStateContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(UIManager);

export default UIStateContainer;