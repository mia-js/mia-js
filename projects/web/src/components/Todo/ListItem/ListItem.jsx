import React from 'react'
import PropTypes from 'prop-types'
import withStyles from 'isomorphic-style-loader/lib/withStyles'
import styles from './styles.less'

class ListItem extends React.Component {
    static propTypes = {
        item: PropTypes.object.isRequired,
        handleCheck: PropTypes.func.isRequired,
        handleChange: PropTypes.func.isRequired,
        handleUpdate: PropTypes.func.isRequired,
        handleKeyDown: PropTypes.func.isRequired,
        handleRemove: PropTypes.func.isRequired,
        config: PropTypes.object.isRequired,
        match: PropTypes.object.isRequired
    };

    render() {
        const {item, config, match} = this.props;
        const checked = item.status === "checked";
        const checkedClass = item.status === "checked" ? "checked" : "unchecked";

        return (
            <div className={styles.toDos}>
                <div className="input-group">
                    <span className="input-group-addon">
                        <input type="checkbox" onChange={e => this.props.handleCheck(e, config, match.params.list)}
                               data-id={item._id} checked={checked}/>
                    </span>
                    <input type="text" className={"form-control " + checkedClass} data-id={item._id}
                           onChange={e => this.props.handleChange(e)}
                           onBlur={e => this.props.handleUpdate(e, config, match.params.list)}
                           onKeyDown={e => this.props.handleKeyDown(e, config, match.params.list)}
                           value={item.name}/>
                    <span className={['input-group-addon', styles.delete].join(' ')} data-id={item._id}
                          onClick={e => this.props.handleRemove(e, config, match.params.list)}>
                        <span className="fa fa-times" data-id={item._id}
                              onClick={e => this.props.handleRemove(e, config, match.params.list)}/>
                    </span>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(ListItem);
