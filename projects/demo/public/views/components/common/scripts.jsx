/** @jsx React.DOM */
var React = require('react');
var ReactAsync = require('react-async');
var request = require('superagent');
var Link = require('react-router-component').Link;

module.exports = React.createClass({
    render: function () {
        return (
            <div>
    {/* Bootstrap core JavaScript. Placed at the end of the document so the pages load faster */}
                <script src="https://code.jquery.com/jquery-1.10.2.min.js"></script>
                <script src="/assets/js/bootstrap.min.js"></script>
                <script src="/assets/js/bundle.js"></script>
            </div>
        );
    }
});
