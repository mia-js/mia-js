/**
 * @jsx React.DOM
 */

var React = require('react');
var ReactAsync = require('react-async');
var request = require('superagent');
var Link = require('react-router-component').Link;

module.exports = React.createClass({

    getInitialState: function () {
        return {title: ''};
    },

    onChange: function (e) {
        this.setState({title: e.target.value});
    },

    handleSubmit: function (e) {
        e.preventDefault();
        if (this.state.title != "") {
            var data = {name: this.state.title};
            this.setState({title: ''});
            this.addItem(data, function (err, data) {
                if (err) {
                    this.props.handleRefresh({type: "danger", message: "Can not add item to server"});
                }
                else {
                    this.props.handleRefresh();
                }
            }.bind(this));
        }
    },

    addItem: function (data, callback) {
        this.props.handleRefresh({type: "warning", message: "Uploading item to server"});
        request.post('http://localhost:3000/demo/v1/todo/').send(data)
            .on('error', function (err) {
                console.log(err);
            }).end(function (err, res) {
            res && res.body && res.body.status == 200 ? callback(null, res) : callback(err, null);
        });
    },

    render: function () {
        return (
            <form className="form-inline" onSubmit={this.handleSubmit}>
                <div className="form-group">
                <input onChange={this.onChange} value={this.state.title} />
                    </div>
                <button type="submit" className="btn btn-primary">Add</button>
            </form>

        );

        //<input type="text" className="form-control" onChange={this.props.onChange} onKeyDown= {this.props.onKeyDown} defaultValue={this.props.item.name}/>
    }
});

