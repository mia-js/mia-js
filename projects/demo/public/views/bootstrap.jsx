/**
 * @jsx React.DOM
 */

var React = require('react');
var App = require('./App.jsx');

if (typeof window !== 'undefined') {
    App.runSync();
}