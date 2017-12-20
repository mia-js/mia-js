import React from 'react'
import _ from 'lodash'
import {connect} from 'react-redux'
import List from './List.jsx'
import PropTypes from 'prop-types'
import {componentWillUnmount, fetchTodos} from '../../../actions/Todo'

class ListContainer extends React.Component {
    static propTypes = {
        match: PropTypes.object.isRequired,
        willUnmount: PropTypes.func.isRequired,
        fetchTodos: PropTypes.func.isRequired,
        items: PropTypes.array
    };

    /**
     * Used to fetch needed data for SSR
     * @param {Object} store
     * @param {Object} match
     */
    static fetchData = (store, match) => {
        const state = store.getState();
        return store.dispatch(fetchTodos(state.App.config, match.params.list));
    };

    /**
     * componentDidMount() is invoked immediately after a component is mounted. Initialization that requires DOM nodes
     * should go here. If you need to load data from a remote endpoint, this is a good place to instantiate the network
     * request.
     *
     * This method is a good place to set up any subscriptions. If you do that, don’t forget to unsubscribe in
     * componentWillUnmount().
     *
     * Calling setState() in this method will trigger an extra rendering, but it will happen before the browser updates
     * the screen. This guarantees that even though the render() will be called twice in this case, the user won’t see
     * the intermediate state. Use this pattern with caution because it often causes performance issues. It can,
     * however, be necessary for cases like modals and tooltips when you need to measure a DOM node before rendering
     * something that depends on its size or position.
     */
    componentDidMount() {
        if (_.isUndefined(this.props.items)) {
            // Only if not done on server already (see fetchData())
            this.props.fetchTodos(this.props.match.params.list);
        }
    }

    /**
     * componentWillReceiveProps() is invoked before a mounted component receives new props. If you need to update the
     * state in response to prop changes (for example, to reset it), you may compare this.props and nextProps and
     * perform state transitions using this.setState() in this method.
     *
     * Note that React may call this method even if the props have not changed, so make sure to compare the current and
     * next values if you only want to handle changes. This may occur when the parent component causes your component
     * to re-render.
     *
     * React doesn’t call componentWillReceiveProps() with initial props during mounting. It only calls this method if
     * some of component’s props may update. Calling this.setState() generally doesn’t trigger
     * componentWillReceiveProps().
     */
    componentWillReceiveProps(nextProps) {
        if (_.isArray(this.props.items) && this.props.match.params.list !== nextProps.match.params.list) {
            // Refresh todos if navigating to another list
            nextProps.fetchTodos(nextProps.match.params.list);
        }
    }

    /**
     * componentWillUnmount() is invoked immediately before a component is unmounted and destroyed. Perform any
     * necessary cleanup in this method, such as invalidating timers, canceling network requests, or cleaning up any
     * subscriptions that were created in componentDidMount().
     */
    componentWillUnmount() {
        this.props.willUnmount();
    }

    render() {
        return (
            <List {...this.props}/>
        )
    }
}

const mapStateToProps = state => ({
    alert: state.Todo.alert,
    items: state.Todo.items
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    willUnmount: () => {
        return dispatch(componentWillUnmount());
    },
    fetchTodos: list => {
        return dispatch(fetchTodos(ownProps.config, list));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(ListContainer);
