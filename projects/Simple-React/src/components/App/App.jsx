import React from 'react'
import { Route, Switch, NavLink } from 'react-router-dom'

import styles from './styles.css'
import ReactIcon from './assets/React-icon.svg'

class App extends React.Component {
  render () {
    return (
      <div className={styles.container}>
        <img src={ReactIcon} alt='Simple-React' className={styles.image}/>
        <h1>Simple-React</h1>
        <NavLink to="/">
          Back to index page
        </NavLink>
        <NavLink to="/page">
          Go to another page
        </NavLink>
        <Switch>
          <Route exact path="/" component={() => <h3>Index page</h3>}/>
          <Route path="/page" component={() => <h3>Another page</h3>}/>
          <Route path="*" component={() => <h3>Page not found</h3>}/>
        </Switch>
      </div>
    )
  }
}

export default App
