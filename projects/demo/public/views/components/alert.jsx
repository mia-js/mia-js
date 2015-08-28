/**
 * @jsx React.DOM
 */

var React = require('react');
var ReactAsync = require('react-async');
var request = require('superagent');
var Link = require('react-router-component').Link;

module.exports = React.createClass({
    render: function () {
        return (
            <div className={"alert alert-" + this.props.type} role="alert">{this.props.message}</div>
        );
    }
});