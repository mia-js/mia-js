import React from 'react'
import {Switch, Route} from 'react-router-dom'

import PropsRoute from '../PropsRoute'
import MainLayout from '../MainLayout'
import NotFound from '../NotFound'
import Index from '../Index'
import Todo from '../Todo'
import TodoList from '../Todo/List'

class App extends React.Component {
    render() {
        return (
            <MainLayout>
                <Switch>
                    <PropsRoute exact path="/" component={Index} {...this.props}/>
                    <PropsRoute exact path="/todo" component={Todo} {...this.props}/>
                    <PropsRoute exact path="/todo/:list" component={TodoList} {...this.props}/>
                    <Route path="*" component={NotFound}/>
                </Switch>
            </MainLayout>
        )
    }
}

export default App;
