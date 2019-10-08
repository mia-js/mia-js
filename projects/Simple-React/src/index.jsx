import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter} from 'react-router-dom'
import App from './components/App'
import routes from '../routes'
import RoutesHandler from '../../generic/libs/routesHandler/v1/routesHandler'

ReactDOM.render(
    <BrowserRouter
        basename={RoutesHandler.getPublicPath(routes)}>
        <App/>
    </BrowserRouter>,
    document.getElementsByTagName('body')[0]
);
