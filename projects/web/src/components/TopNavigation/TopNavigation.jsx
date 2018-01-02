import React from 'react'
import {Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink} from 'reactstrap'
import {NavLink as RRNavLink} from 'react-router-dom'
import PropTypes from 'prop-types'
import styles from './styles.less'
import withStyles from 'isomorphic-style-loader/lib/withStyles'
import LogoImage from '../../assets/img/miajs.png'

class TopNavigation extends React.Component {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        toggle: PropTypes.func.isRequired
    };

    render() {
        return (
            <Navbar color="inverse" className={['navbar-toggleable-sm', styles.topNavigation].join(' ')} inverse>
                <NavbarToggler right onClick={this.props.toggle}/>
                <NavbarBrand tag={RRNavLink} to="/">
                    <img src={LogoImage} alt="Logo image" style={{maxWidth: '5em', marginRight: '0.5em'}}/>
                    Frontend demo
                </NavbarBrand>
                <Collapse isOpen={this.props.isOpen} navbar>
                    <Nav className="ml-auto" navbar>
                        <NavItem>
                            <NavLink tag={RRNavLink} to="/todo" activeClassName="active">
                                <span className="fa fa-check-square-o"/> To do lists
                            </NavLink>
                        </NavItem>
                        <NavItem className="subNavItem">
                            {/* Sub nav items are hidden when sidebar is visible (media query) */}
                            <NavLink tag={RRNavLink} to="/todo/work" activeClassName="active">
                                Work
                            </NavLink>
                        </NavItem>
                        <NavItem className="subNavItem">
                            {/* Sub nav items are hidden when sidebar is visible (media query) */}
                            <NavLink tag={RRNavLink} to="/todo/private" activeClassName="active">
                                Private
                            </NavLink>
                        </NavItem>
                    </Nav>
                </Collapse>
            </Navbar>
        );
    }
}

export default withStyles(styles)(TopNavigation);
