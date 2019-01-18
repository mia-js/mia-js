import React from 'react'
import {connect} from 'react-redux'
import MainLayout from './MainLayout.jsx'

const mapStateToProps = state => ({
    config: state.App.config,
    isSidebarOpen: state.Sidebar.isSidebarOpen
});

export default connect(mapStateToProps)(MainLayout);
