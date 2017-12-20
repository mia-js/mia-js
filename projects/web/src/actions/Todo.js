import {CALL_API} from "../middleware/api"

/*
 * Action types
 */
export const COMPONENT_WILL_UNMOUNT = 'COMPONENT_WILL_UNMOUNT';
export const FETCH_TODOS = 'FETCH_TODOS';
export const FETCH_TODOS_SUCCESS = 'FETCH_TODOS_SUCCESS';
export const FETCH_TODOS_FAILURE = 'FETCH_TODOS_FAILURE';
export const REMOVE_ITEM = 'REMOVE_ITEM';
export const REMOVE_ITEM_SUCCESS = 'REMOVE_ITEM_SUCCESS';
export const REMOVE_ITEM_FAILURE = 'REMOVE_ITEM_FAILURE';
export const UPDATE_ITEM = 'UPDATE_ITEM';
export const UPDATE_ITEM_SUCCESS = 'UPDATE_ITEM_SUCCESS';
export const UPDATE_ITEM_FAILURE = 'UPDATE_ITEM_FAILURE';
export const CHANGE_ITEM_NAME = 'CHANGE_ITEM_NAME';
export const ADD_ITEM = 'ADD_ITEM';
export const ADD_ITEM_SUCCESS = 'ADD_ITEM_SUCCESS';
export const ADD_ITEM_FAILURE = 'ADD_ITEM_FAILURE';

/*
 * Action creators
 */
export const componentWillUnmount = () => ({
    type: COMPONENT_WILL_UNMOUNT
});
export const fetchTodos = (config, list) => ({
    [CALL_API]: {
        types: [FETCH_TODOS, FETCH_TODOS_SUCCESS, FETCH_TODOS_FAILURE],
        endpoint: config.api.root + 'v1/todo'
    }
});
const _addItem = (config, data) => ({
    [CALL_API]: {
        types: [ADD_ITEM, ADD_ITEM_SUCCESS, ADD_ITEM_FAILURE],
        endpoint: config.api.root + 'v1/todo/',
        options: {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(data)
        }
    }
});
const _removeItem = (config, itemId) => ({
    [CALL_API]: {
        types: [REMOVE_ITEM, REMOVE_ITEM_SUCCESS, REMOVE_ITEM_FAILURE],
        endpoint: config.api.root + 'v1/todo/' + itemId,
        options: {
            method: 'DELETE'
        }
    }
});
const _updateItem = (config, itemId, data) => ({
    [CALL_API]: {
        types: [UPDATE_ITEM, UPDATE_ITEM_SUCCESS, UPDATE_ITEM_FAILURE],
        endpoint: config.api.root + 'v1/todo/' + itemId,
        options: {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            body: JSON.stringify(data)
        }
    }
});
export const changeItemName = e => {
    e.preventDefault();
    const itemId = e.target.getAttribute('data-id');
    const name = e.target.value;

    return {
        type: CHANGE_ITEM_NAME,
        itemId,
        name
    }
};

/*
 * Thunk actions using redux-thunk
 */
export const checkItem = (e, config, list) => {
    return (dispatch, getState) => {
        e.preventDefault();
        const itemId = e.target.getAttribute('data-id');
        const checked = e.target.checked ? 'checked' : 'unchecked';
        const data = {
            status: checked
        };

        return dispatch(_updateItem(config, itemId, data))
            .then(action => {
                if (action.type === UPDATE_ITEM_FAILURE) {
                    return Promise.resolve();
                }
                return dispatch(fetchTodos(config, list));
            });
    };
};
export const handleUpdate = (e, config, list) => {
    return (dispatch, getState) => {
        e.preventDefault();
        const items = getState().Todo.items;
        const itemId = e.target.getAttribute('data-id');
        let item;

        for (let i in items) {
            item = items[i];
            if (item._id === itemId) {
                break;
            }
        }

        if (!item || !item['_dirty']) {
            return Promise.resolve();
        }

        const data = {
            name: item.name
        };

        return dispatch(_updateItem(config, itemId, data))
            .then(action => {
                if (action.type === UPDATE_ITEM_FAILURE) {
                    return Promise.resolve();
                }
                return dispatch(fetchTodos(config, list));
            });
    };
};
export const handleKeyDown = (e, config, list) => {
    return (dispatch, getState) => {
        if (e.keyCode === 13) {
            // Enter Key
            return dispatch(handleUpdate(e, config, list));
        }
        return Promise.resolve();
    };
};
export const handleRemove = (e, config, list) => {
    return (dispatch, getState) => {
        e.preventDefault();
        e.stopPropagation();
        const itemId = e.target.getAttribute('data-id');

        return dispatch(_removeItem(config, itemId))
            .then(action => {
                if (action.type === REMOVE_ITEM_FAILURE) {
                    return Promise.resolve();
                }
                return dispatch(fetchTodos(config, list));
            });
    }
};
export const handleSubmit = (name, config, list) => {
    return (dispatch, getState) => {
        const data = {
            name
        };

        return dispatch(_addItem(config, data))
            .then(action => {
                if (action.type === ADD_ITEM_FAILURE) {
                    return Promise.resolve();
                }
                return dispatch(fetchTodos(config, list));
            });
    }
};
