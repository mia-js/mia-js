import React from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import ListItem from '../ListItem'
import Add from '../Add'
import Alert from '../Alert'
import withStyles from 'isomorphic-style-loader/lib/withStyles'
import styles from './styles.less'
import {Helmet} from 'react-helmet'

class List extends React.Component {
    static propTypes = {
        match: PropTypes.object.isRequired,
        alert: PropTypes.object,
        items: PropTypes.array
    };

    render() {
        const {alert, items, match} = this.props;
        const {list} = match.params;
        return (
            <div>
                <Helmet>
                    <title>{'To do lists | ' + list[0].toUpperCase() + list.substring(1)}</title>
                </Helmet>
                <div className={styles.headlines}>
                    <h1>A ToDo List</h1>
                    <h5>using React.js</h5>
                </div>
                <div className={styles.add}>
                    <Add {...this.props}/>
                    <div className={styles.itemCount}>{_.isArray(items) ? items.length : 0} items</div>
                </div>
                {
                    _.isArray(items) &&
                    items.map(item => {
                        return (
                            <ListItem key={'item' + item._id.toString()} item={item} {...this.props}/>
                        );
                    })
                }
                {
                    !_.isUndefined(alert) && !_.isUndefined(alert.type) && !_.isUndefined(alert.message) &&
                    <Alert type={alert.type} message={alert.message}/>
                }
            </div>
        );
    }
}

export default withStyles(styles)(List);
