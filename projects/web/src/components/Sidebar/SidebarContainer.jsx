import React from 'react'
import {connect} from 'react-redux'
import Sidebar from './Sidebar.jsx'
import {toggleSidebar} from './actions'
import {withRouter} from 'react-router-dom'

const mapStateToProps = state => ({
    isSidebarOpen: state.Sidebar.isSidebarOpen
});

const mapDispatchToProps = dispatch => ({
    toggleSidebar: () => {
        dispatch(toggleSidebar())
    }
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Sidebar));
