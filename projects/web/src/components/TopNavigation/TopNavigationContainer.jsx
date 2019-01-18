import React from 'react'
import TopNavigation from './TopNavigation.jsx'

class TopNavigationContainer extends React.Component {
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
