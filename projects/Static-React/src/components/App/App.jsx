import React from 'react'
import {Route, Switch} from 'react-router-dom'
import PropTypes from "prop-types";

import MainLayout from '../MainLayout/MainLayout.jsx'

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
                    <Route exact path="/" component={() => <h3>Index page</h3>}/>
                    <Route path="/page" component={() => <h3>Another page</h3>}/>
                    <Route path="*" component={() => <h3>Page not found</h3>}/>
                </Switch>
            </MainLayout>
        )
    }
}

export default App
