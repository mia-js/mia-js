import 'isomorphic-fetch'

// Action key that carries API call info interpreted by this Redux middleware
export const CALL_API = 'Call API';

// Fetches an API response and ...
const callApi = (endpoint, options) => {
    return fetch(endpoint, options)
        .then(async (response) => {
            let body = undefined;
            try {
                body = await response.json();
            } catch (e) {
            }
            if (!response.ok || response.status === 204) {
                let statusMessage = undefined;
                if (body && body.errors && body.errors[0]) {
                    statusMessage = body.errors[0]['msg'];
                }
                return Promise.reject({
                    status: response.status,
                    statusText: response.statusText,
                    statusMessage,
                    body: body
                });
            }
            return body;
        })
        .then(json => {
            return json;
        });
};

// A Redux middleware that interprets actions with CALL_API info specified
// Performs the call and promises when such actions are dispatched
export default store => next => action => {
    const callAPI = action[CALL_API];

    if (typeof callAPI === 'undefined') {
        return next(action);
    }

    let {endpoint} = callAPI;
    let {actionParams} = callAPI;
    const {types, options} = callAPI;

    if (typeof endpoint === 'function') {
        endpoint = endpoint(store.getState())
    }
    if (typeof endpoint !== 'string') {
        throw new Error('Specify a string endpoint URL.')
    }
    if (!Array.isArray(types) || types.length !== 3) {
        throw new Error('Expected an array of three action types.')
    }
    if (!types.every(type => typeof type === 'string')) {
        throw new Error('Expected action types to be strings.')
    }
    if (_.isUndefined(actionParams)) {
        actionParams = {};
    }

    const actionWith = data => {
        const finalAction = Object.assign({}, action, data);
        delete finalAction[CALL_API];
        return finalAction;
    };

    const [requestType, successType, failureType] = types;
    next(actionWith(Object.assign({}, {type: requestType}, actionParams)));

    return callApi(endpoint, options).then(
        response => next(actionWith(Object.assign({}, {
            type: successType,
            response
        }, actionParams))),
        error => next(actionWith(Object.assign({}, {
            type: failureType,
            error: error
        }, actionParams)))
    )
}
