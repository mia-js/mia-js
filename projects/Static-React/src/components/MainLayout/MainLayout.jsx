import React from 'react'
import {NavLink} from 'react-router-dom'
import withStyles from 'isomorphic-style-loader/lib/withStyles'

import styles from './styles.css'
import ReactIcon from './assets/React-icon.svg'

class MainLayout extends React.Component {
    render() {
        return (
            <div className={styles.container}>
                <img src={ReactIcon} alt='Simple-React' className={styles.image}/>
                <h1>Static-React</h1>
                <NavLink to="/">
                    Back to index page
                </NavLink>
                <NavLink to="/page">
                    Go to another page
                </NavLink>
                {this.props.children}
            </div>
        )
    }
}

export default withStyles(styles)(MainLayout)
