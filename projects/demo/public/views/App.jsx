/**
 * @jsx React.DOM
 */


var React = require('react');
var ReactAsync = require('react-async');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var NotFoundRoute = Router.NotFoundRoute;
var Locations = React.createFactory(Router.Locations);
var Location = React.createFactory(Router.Location);

var ToDoList = require('./pages/todoList.jsx');

var NotFound = Router.NotFound;
var NotFoundPage = require('./pages/notfound.jsx');

var App = React.createClass({
    render: function () {
        return (<RouteHandler/>);
    }
});

var routes = (
    <Route name="app" path="/web" handler={ToDoList}>
        <NotFoundRoute handler={NotFoundPage} />
    </Route>
);

App.run = function (path, callback) {
    Router.run(routes, path, function (Handler) {
        ReactAsync.renderToStringAsync(<Handler/>, callback);
    });
};

App.runSync = function () {
    Router.run(routes, Router.HistoryLocation, function (Handler) {
        React.render(<Handler />, document);
    });
};


module.exports = App;


