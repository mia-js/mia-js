import React from 'react'
import {connect} from 'react-redux'
import ListItem from './ListItem.jsx'
import {checkItem, changeItemName, handleUpdate, handleKeyDown, handleRemove} from '../../../actions/Todo'

class ListItemContainer extends React.Component {
    render() {
        return (
            <ListItem {...this.props}/>
        )
    }
}

const mapStateToProps = (state, ownProps) => ({});

const mapDispatchToProps = (dispatch, ownProps) => ({
    handleCheck: e => {
        return dispatch(checkItem(e, ownProps.config, ownProps.match.params.list));
    },
    handleChange: e => {
        return dispatch(changeItemName(e));
    },
    handleUpdate: e => {
        return dispatch(handleUpdate(e, ownProps.config, ownProps.match.params.list));
    },
    handleKeyDown: e => {
        return dispatch(handleKeyDown(e, ownProps.config, ownProps.match.params.list));
    },
    handleRemove: e => {
        return dispatch(handleRemove(e, ownProps.config, ownProps.match.params.list));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(ListItemContainer);
