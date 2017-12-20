import React from 'react'
import PropTypes from 'prop-types'

class Add extends React.Component {
    static propTypes = {
        handleSubmit: PropTypes.func.isRequired
    };

    constructor(props, context) {
        super(props, context);

        this.state = {
            value: ''
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        if (this.state.value) {
            this.props.handleSubmit(this.state.value).then(() => {
                this.setState({value: ''});
            })
        }
    }

    render() {
        return (
            <form className="form-inline" onSubmit={this.handleSubmit}>
                <div className="form-group">
                    <input onChange={e => this.setState({value: e.target.value})} value={this.state.value}/>
                </div>
                <button type="submit" className="btn btn-primary">Add</button>
            </form>

        );
    }
}

export default Add;
