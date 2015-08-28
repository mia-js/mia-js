/**
 * @jsx React.DOM
 */

var React = require('react');
var ReactAsync = require('react-async');
var request = require('superagent');
var Link = require('react-router-component').Link;

module.exports = React.createClass({

    getInitialState: function () {
        return {
            value: this.props.item.name,
            status: this.props.item.status,
            id: this.props.item._id,
            lastValue: this.props.item.name
        };
    },

    handleCheck: function (e) {
        e.preventDefault();
        var id = e.target.getAttribute('data-id');
        var checked = e.target.checked == true ? "checked" : "unchecked";
        console.log(checked);
        var data = {
            status: checked
        };
        this.updateItem(id, data, function (err, data) {
            if (err) {
                this.props.handleRefresh({type: "danger", message: "Can not edit item on server"});
            }
            else {
                this.props.handleRefresh();
            }
        }.bind(this));
        this.setState({status: checked});
    },

    handleChange: function (e) {
        this.setState({value: e.target.value});
    },

    handleKeyDown: function (e) {
        //Enter Key
        if (e.keyCode == 13) {
            this.handleUpdate(e)
        }
    },

    handleUpdate: function (e) {
        e.preventDefault();
        var id = e.target.getAttribute('data-id');
        if (this.state.lastValue != e.target.value) {
            var data = {
                name: e.target.value
            };
            this.updateItem(id, data, function (err, data) {
                if (err) {
                    this.props.handleRefresh({type: "danger", message: "Can not edit item on server"});
                }
                else {
                    this.setState({lastValue: e.target.value});
                    this.props.handleRefresh();
                }
            }.bind(this));
        }
    },

    handleRemove: function (e) {
        e.preventDefault();
        var id = e.target.getAttribute('data-id');
        this.removeItem(id, function (err, data) {
            if (err) {
                this.props.handleRefresh({type: "danger", message: "Can not remove item on server"});
            }
            else {
                this.props.handleRefresh();
            }
        }.bind(this));
    },

    removeItem: function (id, callback) {
        request.del('http://localhost:3000/demo/v1/todo/' + id).send().on('error', function (err) {
            console.log(err);
        }).end(function (err, res) {
            callback(err, res);
        });
    },

    updateItem: function (id, data, callback) {
        request.put('http://localhost:3000/demo/v1/todo/' + id).send(data).on('error', function (err) {
            console.log(err);
        }).end(function (err, res) {
            var items = [];
            if (res && res.body.response && res.body.response && res.body.response) {
                items = res.body.response;
            }
            callback(err, {items: items});
        });
    },

    render: function () {

        var checked = this.state.status == "checked";
        var checkedClass = this.state.status == "checked" ? "checked" : "unchecked";

        return (
            <div className="toDos">
                <div className="input-group">
                    <span className="input-group-addon">
                        <input type="checkbox" onChange={this.handleCheck} data-id={this.state.id} checked={checked}/>
                    </span>
                    <input type="text" className={"form-control " + checkedClass} data-id={this.state.id} onChange={this.handleChange} onBlur={this.handleUpdate} onKeyDown={this.handleKeyDown} value={this.state.value}/>
                    <span className="input-group-addon delete">
                        <span className="glyphicon glyphicon-remove"  data-id={this.state.id} onClick={this.handleRemove}></span>
                    </span>
                </div>
            </div>
        );
    }
});