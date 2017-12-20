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
        handleRemove: PropTypes.func.isRequired
    };

    render() {
        const {item} = this.props;
        const checked = item.status === "checked";
        const checkedClass = item.status === "checked" ? "checked" : "unchecked";

        return (
            <div className={styles.toDos}>
                <div className="input-group">
                    <span className="input-group-addon">
                        <input type="checkbox" onChange={this.props.handleCheck} data-id={item._id} checked={checked}/>
                    </span>
                    <input type="text" className={"form-control " + checkedClass} data-id={item._id}
                           onChange={this.props.handleChange} onBlur={this.props.handleUpdate}
                           onKeyDown={this.props.handleKeyDown}
                           value={item.name}/>
                    <span className={['input-group-addon', styles.delete].join(' ')} data-id={item._id}
                          onClick={this.props.handleRemove}>
                        <span className="fa fa-times" data-id={item._id} onClick={this.props.handleRemove}/>
                    </span>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(ListItem);
