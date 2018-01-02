const MiaJs = require('mia-js-core');
const path = require('path');

const Shared = MiaJs.Shared;
const Logger = MiaJs.Logger.tag('Web-ServerSideRendering');
const env = Shared.config('environment');

function thisModule() {
    let self = this;

    self.disabled = false;
    self.identity = 'Web-ServerSideRendering';
    self.version = '1.0';
    self.created = '2017-12-14T12:00:00';
    self.modified = '2017-12-14T12:00:00';
    self.group = 'web';

    self.list = (req, res) => {
        let webpackServerConfig;
        let Server;

        if (env && env.webpack && env.webpack.watchMode) {
            webpackServerConfig = require('../webpack.server.watch.config');

            // Disable gzip compression to allow server-sent events (HMR)
            res.setHeader('Cache-Control', 'no-transform');
            Server = res.serverBundle;
        } else {
            webpackServerConfig = require('../webpack.server.fs.config');

            try {
                Server = require(path.join(webpackServerConfig.output.path, webpackServerConfig.output.filename));
            } catch (e) {
                Logger.warn('Server bundle not found. Maybe you forgot to build it?');
            }
        }

        if (!Server) {
            res.status(404);
            return res.end();
        }

        const initialState = {};

        /**
         * Place for server side auth e.g. by cookie
         */

        Server.render(req.url, env, webpackServerConfig.output.publicPath, initialState)
            .then(output => {
                res.write(output);
                res.end();
            })
            .catch(({error, context}) => {
                if (error === 'RedirectException') {
                    res.writeHead(302, {
                        Location: context.url
                    });
                    return res.end();
                }
                Logger.error(error);
                res.status(500);
                res.end();
            });
    };

    return self;
}

module.exports = new thisModule();
