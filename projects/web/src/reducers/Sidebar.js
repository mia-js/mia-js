import {TOGGLE_SIDEBAR} from '../actions/Sidebar'

export default function Reducers(state = {
    isSidebarOpen: true
}, action) {
    switch (action.type) {
        case TOGGLE_SIDEBAR:
            return Object.assign({}, state, {
                isSidebarOpen: !state.isSidebarOpen
            });
        default:
            return state;
    }
}
