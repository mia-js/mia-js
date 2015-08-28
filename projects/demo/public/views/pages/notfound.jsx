/**
 * @jsx React.DOM
 */

var React = require('react');
var ReactAsync = require('react-async');
var request = require('superagent');
var Link = require('react-router-component').Link;
var Head = require('./../components/common/head.jsx');
var Scripts = require('./../components/common/scripts.jsx');

var Home = React.createClass({
    render: function () {
        var title = "Ooops";
        return (
            <html>
                <Head title={title}/>
                <body>
                    <div id="container">
                        <div className="container text-center">
                            <h1>Nothing here to see goto</h1>
                            <br/>
                            <a href="/web/">See example</a>

                        </div>
                    </div>
                    <Scripts/>
                </body>
            </html>
        );
    }
});

module.exports = Home;

