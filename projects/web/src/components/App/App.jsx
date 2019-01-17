import React from 'react'
import {Switch, Route} from 'react-router-dom'
import PropTypes from 'prop-types'

import MainLayout from '../MainLayout'
import NotFound from '../NotFound'
import Index from '../Index'
import Todo from '../Todo'
import TodoList from '../Todo/List'

class App extends React.Component {
    static propTypes = {
        context: PropTypes.object.isRequired
    };

    // Don't use context anymore because it's deprecated!
    // React passes the information down automatically and any component in the subtree can access it by defining contextTypes.
    // We need it still for insertCss() in isomorphic-style-loader only
    static childContextTypes = {
        insertCss: PropTypes.func.isRequired
    };

    getChildContext() {
        return this.props.context;
    }

    render() {
        return (
            <MainLayout>
                <Switch>
                    <Route exact path="/" component={Index}/>
                    <Route exact path="/todo" component={Todo}/>
                    <Route exact path="/todo/:list" component={TodoList}/>
                    <Route path="*" component={NotFound}/>
                </Switch>
            </MainLayout>
        )
    }
}

export default App;
