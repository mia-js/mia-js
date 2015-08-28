/**
 * @jsx React.DOM
 */

var React = require('react');
var ReactAsync = require('react-async');
var request = require('superagent');
var Link = require('react-router-component').Link;
var Head = require('./../components/common/head.jsx');
var Scripts = require('./../components/common/scripts.jsx');
var ToDoList = require('./../components/list.jsx');

var Home = React.createClass({
    render: function () {

        var title = "A ToDo List";
        var subTitle = "using React.js";

        return (
            <html>
                <Head title={title}/>
                <body>
                    <div className="container">
                        <div className="headlines">
                            <h1>{title}</h1>
                            <h5>{subTitle}</h5>
                        </div>
                        <ToDoList/>
                    </div>
                    <Scripts/>
                </body>
            </html>
        );
    }
});

module.exports = Home;

