import {
    COMPONENT_WILL_UNMOUNT,
    FETCH_TODOS_SUCCESS,
    FETCH_TODOS_FAILURE,
    UPDATE_ITEM_FAILURE,
    CHANGE_ITEM_NAME,
    REMOVE_ITEM_FAILURE,
    ADD_ITEM,
    ADD_ITEM_FAILURE
} from '../actions/Todo'

export default function Reducers(state = {
    items: undefined,
    alert: {
        type: undefined,
        message: undefined
    }
}, action) {
    let items;
    let nextItems = [];
    switch (action.type) {
        case COMPONENT_WILL_UNMOUNT:
            return Object.assign({}, state, {
                items: undefined
            });
        case FETCH_TODOS_SUCCESS:
            const now = new Date();
            items = action.response.response;
            for (let i in items) {
                let item = items[i];
                item['_dirty'] = false;
                nextItems.push(item);
            }
            return Object.assign({}, state, {
                items: nextItems,
                alert: {
                    type: 'success',
                    message: 'Last updated: ' + ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2)
                }
            });
        case FETCH_TODOS_FAILURE:
            return Object.assign({}, state, {
                items: [],
                alert: {
                    type: 'danger',
                    message: 'An error occurred while updating data on server. Try again later'
                }
            });
        case UPDATE_ITEM_FAILURE:
            return Object.assign({}, state, {
                alert: {
                    type: 'danger',
                    message: 'Can not edit item on server'
                }
            });
        case CHANGE_ITEM_NAME:
            items = state.items;
            const {itemId, name} = action;
            for (let i in items) {
                let item = items[i];
                if (item._id === itemId && item.name !== name) {
                    item['name'] = name;
                    item['_dirty'] = true;
                }
                nextItems.push(item);
            }
            return Object.assign({}, state, {
                items: nextItems
            });
        case REMOVE_ITEM_FAILURE:
            return Object.assign({}, state, {
                alert: {
                    type: 'danger',
                    message: 'Can not remove item on server'
                }
            });
        case ADD_ITEM:
            return Object.assign({}, state, {
                alert: {
                    type: 'warning',
                    message: 'Uploading item to server'
                }
            });
        case ADD_ITEM_FAILURE:
            return Object.assign({}, state, {
                alert: {
                    type: 'danger',
                    message: 'Can not add item to server'
                }
            });
        default:
            return state;
    }
}
