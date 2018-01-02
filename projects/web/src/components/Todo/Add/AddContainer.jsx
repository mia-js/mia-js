import React from 'react'
import {connect} from 'react-redux'
import Add from './Add.jsx'
import {handleSubmit} from '../../../actions/Todo'

class AddContainer extends React.Component {
    render() {
        return (
            <Add {...this.props}/>
        )
    }
}

const mapStateToProps = (state, ownProps) => ({});

const mapDispatchToProps = (dispatch, ownProps) => ({
    handleSubmit: name => {
        return dispatch(handleSubmit(name, ownProps.config, ownProps.match.params.list));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(AddContainer);
