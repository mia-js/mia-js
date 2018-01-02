import React from 'react'
import TopNavigation from './TopNavigation.jsx'
import PropTypes from 'prop-types'

class TopNavigationContainer extends React.Component {
    static propTypes = {
        config: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            isOpen: false
        };
    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    render() {
        return (
            <TopNavigation isOpen={this.state.isOpen} toggle={this.toggle} {...this.props}/>
        );
    }
}

export default TopNavigationContainer;
