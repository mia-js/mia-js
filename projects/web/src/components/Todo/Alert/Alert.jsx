import React from 'react'
import PropTypes from 'prop-types'

class Alert extends React.Component {
    static propTypes = {
        type: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired
    };

    render() {
        const {type, message} = this.props;
        return (
            <div className={"alert alert-" + type} role="alert">{message}</div>
        );
    }
}

export default Alert
