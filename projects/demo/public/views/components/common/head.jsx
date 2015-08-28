/** @jsx React.DOM */
var React = require('react');
var ReactAsync = require('react-async');
var request = require('superagent');
var Link = require('react-router-component').Link;

module.exports = React.createClass({
    render: function () {
        return (
            <head>
                <meta charSet="utf-8"/>
                <meta httpEquiv="content-type" content="text/html; charset=UTF8"/>
                <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <title>{this.props.title}</title>
                 {/*<!-- Google Fonts -->*/}
                <link rel="stylesheet" type="text/css" href="/assets/css/main.css"/>
                <script src="https://fb.me/react-0.13.3.js"></script>
                <script src="https://fb.me/JSXTransformer-0.13.3.js"></script>
            </head>

        );
    }
});
