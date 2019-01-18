import React from 'react'
import {connect} from 'react-redux'
import ListItem from './ListItem.jsx'
import {checkItem, changeItemName, handleUpdate, handleKeyDown, handleRemove} from '../actions'
import {withRouter} from 'react-router-dom'

const mapStateToProps = state => {
    return {
        config: state.App.config
    }
};

const mapDispatchToProps = dispatch => ({
    handleCheck: (e, config, list) => {
        return dispatch(checkItem(e, config, list));
    },
    handleChange: e => {
        return dispatch(changeItemName(e));
    },
    handleUpdate: (e, config, list) => {
        return dispatch(handleUpdate(e, config, list));
    },
    handleKeyDown: (e, config, list) => {
        return dispatch(handleKeyDown(e, config, list));
    },
    handleRemove: (e, config, list) => {
        return dispatch(handleRemove(e, config, list));
    }
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ListItem));
