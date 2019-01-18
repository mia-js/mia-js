import React from 'react'
import {connect} from 'react-redux'
import Add from './Add.jsx'
import {handleSubmit} from '../actions'
import {withRouter} from 'react-router-dom'

const mapStateToProps = state => ({
    config: state.App.config
});

const mapDispatchToProps = dispatch => ({
    handleSubmit: (name, config, list) => {
        return dispatch(handleSubmit(name, config, list));
    }
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Add));
