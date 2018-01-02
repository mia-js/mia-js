import React from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router'
import PropTypes from 'prop-types'
import 'isomorphic-fetch'
import App from './App.jsx'

class AppContainer extends React.Component {
    static propTypes = {
        context: PropTypes.object.isRequired,
        config: PropTypes.object.isRequired,
        userToken: PropTypes.string
    };
    static childContextTypes = {
        insertCss: PropTypes.func.isRequired
    };

    getChildContext() {
        return this.props.context;
    }

    render() {
        return (
            <App config={this.props.config}/>
        )
    }
}

const mapStateToProps = state => {
    return {
        config: state.App.config
    }
};

export default withRouter(connect(mapStateToProps)(AppContainer));
