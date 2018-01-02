import React from 'react'
import {connect} from 'react-redux'
import MainLayout from './MainLayout.jsx'
import {toggleSidebar} from "../../actions/Sidebar"

class MainLayoutContainer extends React.Component {
    render() {
        return (
            <MainLayout {...this.props}>
                {this.props.children}
            </MainLayout>
        )
    }
}

const mapStateToProps = state => ({
    config: state.App.config,
    isSidebarOpen: state.Sidebar.isSidebarOpen
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    toggleSidebar: () => {
        dispatch(toggleSidebar())
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(MainLayoutContainer);
