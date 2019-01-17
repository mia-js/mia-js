import {combineReducers} from 'redux'
import App from '../components/App/reducers'
import Sidebar from '../components/Sidebar/reducers'
import Todo from '../components/Todo/reducers'

export default combineReducers({
    App,
    Sidebar,
    Todo
});
