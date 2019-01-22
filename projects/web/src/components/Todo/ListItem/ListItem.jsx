import React from 'react'
import PropTypes from 'prop-types'
import withStyles from 'isomorphic-style-loader/lib/withStyles'
import styles from './styles.less'
import {InputGroup, Input, InputGroupAddon, InputGroupText} from 'reactstrap'

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
        const checkedClass = item.status === "checked" ? styles.checked : styles.unchecked;

        return (
            <div className={styles.toDos}>
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                            <Input addon type="checkbox"
                                   onChange={e => this.props.handleCheck(e, config, match.params.list)}
                                   data-id={item._id} checked={checked}/>
                        </InputGroupText>
                    </InputGroupAddon>
                    <Input type="text" className={['form-control', checkedClass].join(' ')} data-id={item._id}
                           onChange={e => this.props.handleChange(e)}
                           onBlur={e => this.props.handleUpdate(e, config, match.params.list)}
                           onKeyDown={e => this.props.handleKeyDown(e, config, match.params.list)}
                           value={item.name}/>
                    <InputGroupAddon addonType="append">
                        <InputGroupText className={styles.delete} data-id={item._id}
                                        onClick={e => this.props.handleRemove(e, config, match.params.list)}>
                            <span className="fa fa-times"/>
                        </InputGroupText>
                    </InputGroupAddon>
                </InputGroup>
            </div>
        );
    }
}

export default withStyles(styles)(ListItem);
