/**
 * @jsx React.DOM
 */

var React = require('react');
var ReactAsync = require('react-async');
var request = require('superagent');
var Link = require('react-router-component').Link;
var Item = require('./item.jsx');
var Add = require('./add.jsx');
var Alert = require('./alert.jsx');

module.exports = React.createClass({

    getInitialState: function () {
        return {items: []};
    },

    getItemsListFromServer: function (callback) {
        request.get('http://localhost:3000/demo/v1/todo').on('error', function (err) {
            console.log(err);
        }).end(function (err, res) {
            var items = [];
            if (res && res.body.response && res.body.response && res.body.response) {
                items = res.body.response;
            }
            callback(err, {items: items});
        });
    },

    handleAlert: function (type, message) {
        var type = type || "success";
        this.setState({
            alert: {
                type: type,
                message: message
            }
        });
    },

    handleRefresh: function (alert) {
        if (alert && alert.type && alert.message) {
            this.handleAlert(alert.type, alert.message);
        }
        else {
            this.getItemsListFromServer(function (err, data) {
                if (err) {
                    this.handleAlert("danger", "Error occured while updating data on server. Try again later");
                }
                else {
                    this.handleAlert("success", "Last updated: " + new Date().getHours() + ":" + new Date().getMinutes());
                    this.setState({items: data.items});
                }
            }.bind(this));
        }
    },

    componentDidMount: function () {
        this.handleRefresh();
    },

    render: function () {
        var alert = this.state.alert && this.state.alert.type && this.state.alert.message ? <Alert type={this.state.alert.type} message={this.state.alert.message}/> : "";
        var items = this.state && this.state.items ? this.state.items : [];

        var listItem = items.map(function (item, i) {
            return (
                <Item key={'item'+item._id.toString()} item={item} handleRefresh={this.handleRefresh}/>
            );
        }.bind(this));

        return (
            <div>
                <div className="add">
                    <Add items={items} handleRefresh={this.handleRefresh}/>
                    <span className="text-center">{items.length} items</span>
                </div>
                {listItem}
                {alert}

            </div>
        );
    }
});
