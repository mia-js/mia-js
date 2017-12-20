import React from 'react'
import {Nav, NavItem, NavLink} from 'reactstrap'
import {Switch, Route, NavLink as RRNavLink} from 'react-router-dom'
import withStyles from 'isomorphic-style-loader/lib/withStyles'
import styles from './styles.less'
import PropTypes from 'prop-types'

const Todo = ({match}) => (
    <div>
        <NavItem>
            <NavLink tag={RRNavLink} to={`${match.url}/work`}>
                <span className="fa fa-list-alt" aria-hidden="true"/>Work
            </NavLink>
            <NavLink tag={RRNavLink} to={`${match.url}/private`}>
                <span className="fa fa-list-alt" aria-hidden="true"/>Private
            </NavLink>
        </NavItem>
    </div>
);

const Empty = () => (
    <div></div>
);

class Sidebar extends React.Component {
    static propTypes = {
        toggleSidebar: PropTypes.func.isRequired,
        isSidebarOpen: PropTypes.bool.isRequired
    };

    render() {
        const sidebarClassNames = ['fa'];
        if (this.props.isSidebarOpen) {
            sidebarClassNames.push('fa-chevron-circle-left');
        } else {
            sidebarClassNames.push('fa-chevron-circle-right');
        }
        return (
            <Nav className="navSidebar" vertical>
                <div className={styles.sidebarControl}>
                    <span className={sidebarClassNames.join(' ')} onClick={this.props.toggleSidebar}/>
                </div>
                {
                    this.props.isSidebarOpen &&
                    <Switch>
                        <Route path="/todo" component={Todo}/>
                        <Route path="*" component={Empty}/>
                    </Switch>
                }
            </Nav>
        )
    }
}

export default withStyles(styles)(Sidebar);
