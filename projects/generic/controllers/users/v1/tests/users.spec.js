var MiaJs = require('mia-js-core')
    , Q = require('q')
    , Shared = MiaJs.Shared
    , Encryption = MiaJs.Utils.Encryption
    , Request = MiaJs.Request;

Q.stopUnhandledRejectionTracking();

describe("Testing user service", function () {
    var env = Shared.config('environment');
    var _protocol = "http";
    var _hostName = "localhost";
    var _port = env.server.http.port;
    var random = Encryption.randHash();
    var _userData = {
        login: 'test_' + random,
        password: "a0657b9b264d02091618d21cfa91e92f",
        deviceName: "node-test",
        email: 'test_' + random + '@test.abc'
    };
    var _secretId = '6ff870ad33a86982550543e2f92623c5';
    var _secret = '10f2bde9a138ef5aeed40812b0a1594b';
    var _sessionId;

    it("authDevice", function (next) {
        var expectResult = true;
        Q().then(function () {
            return Q.ninvoke(Request, 'do', {
                protocol: _protocol,
                options: {
                    hostname: _hostName,
                    port: _port,
                    path: "/api/tests/generic/v1/devices",
                    method: 'POST'
                },
                timeout: 10000
            });
        }).then(function (data) {
            expect(data != null).toBe(expectResult);
            expect(data[0] != null).toBe(expectResult);
            var deviceId = data[0].response.id;
            return Q({
                deviceId: deviceId,
                key: Encryption.md5(_secret + deviceId) + _secretId
            });
        }).then(function (credentials) {
            return Q.ninvoke(Request, 'do', {
                protocol: _protocol,
                options: {
                    hostname: _hostName,
                    port: _port,
                    path: "/api/tests/generic/v1/devices/" + credentials.deviceId + "/sessions",
                    method: 'POST',
                    headers: {'key': credentials.key}
                },
                timeout: 10000
            });
        }).then(function (data) {
            expect(data != null).toBe(expectResult);
            expect(data[0] != null).toBe(expectResult);
            _sessionId = data[0].response.sessionId;
            next();
        }).fail(function (err) {
            expect(false).toBe(expectResult);
            next();
        }).done();
    });

    var _signUp = function (expectResult) {
        expectResult = expectResult !== false;
        it("signUp", function (next) {
            Q().then(function () {
                return Q.ninvoke(Request, 'do', {
                    protocol: _protocol,
                    options: {
                        hostname: _hostName,
                        port: _port,
                        path: "/api/tests/generic/v1/users/me",
                        method: 'POST',
                        headers: {'session': _sessionId}
                    },
                    json: true,
                    body: {
                        login: _userData.login,
                        password: _userData.password,
                        deviceName: _userData.deviceName,
                        email: _userData.email
                    },
                    timeout: 10000
                });
            }).then(function (data) {
                expect(data != null).toBe(expectResult);
                expect(data[0] != null).toBe(expectResult);
                expect(data[0].response.login == _userData.login).toBe(expectResult);
                expect(data[0].response.userId != null).toBe(expectResult);
                next();
            }).fail(function (err) {
                expect(false).toBe(expectResult);
                next();
            }).done();
        });
    };

    var _login = function (expectResult) {
        expectResult = expectResult !== false;
        it("login", function (next) {
            Q().then(function () {
                return Q.ninvoke(Request, 'do', {
                    protocol: _protocol,
                    options: {
                        hostname: _hostName,
                        port: _port,
                        path: "/api/tests/generic/v1/users/me/login/native",
                        method: 'POST',
                        headers: {'session': _sessionId}
                    },
                    json: true,
                    body: {
                        login: _userData.login,
                        password: _userData.password,
                        deviceName: _userData.deviceName
                    },
                    timeout: 10000
                });
            }).then(function (data) {
                expect(data != null).toBe(expectResult);
                expect(data[0] != null).toBe(expectResult);
                expect(data[0].response.login == _userData.login).toBe(expectResult);
                expect(data[0].response.userId != null).toBe(expectResult);
                next();
            }).fail(function (err) {
                expect(false).toBe(expectResult);
                next();
            }).done();
        });
    };

    var _logout = function (expectResult) {
        expectResult = expectResult !== false;
        it("logout", function (next) {
            Q().then(function () {
                return Q.ninvoke(Request, 'do', {
                    protocol: _protocol,
                    options: {
                        hostname: _hostName,
                        port: _port,
                        path: "/api/tests/generic/v1/users/me/logout",
                        method: 'POST',
                        headers: {'session': _sessionId}
                    },
                    timeout: 10000
                });
            }).then(function (data) {
                expect(data != null).toBe(expectResult);
                next();
            }).fail(function (err) {
                expect(false).toBe(expectResult);
                next();
            }).done();
        });
    };

    var _deleteUser = function (expectResult) {
        expectResult = expectResult !== false;
        it("delete user", function (next) {
            Q().then(function () {
                return Q.ninvoke(Request, 'do', {
                    protocol: _protocol,
                    options: {
                        hostname: _hostName,
                        port: _port,
                        path: "/api/tests/generic/v1/users/me",
                        method: 'DELETE',
                        headers: {'session': _sessionId}
                    },
                    timeout: 10000
                });
            }).then(function (data) {
                expect(data != null).toBe(expectResult);
                next();
            }).fail(function (err) {
                expect(false).toBe(expectResult);
                next();
            }).done();
        });
    };

    var _getProfile = function (expectResult) {
        expectResult = expectResult !== false;
        it("getProfile", function (next) {
            Q().then(function () {
                return Q.ninvoke(Request, 'do', {
                    protocol: _protocol,
                    options: {
                        hostname: _hostName,
                        port: _port,
                        path: "/api/tests/generic/v1/users/me",
                        method: 'GET',
                        headers: {'session': _sessionId}
                    },
                    timeout: 10000
                });
            }).then(function (data) {
                expect(data != null).toBe(expectResult);
                expect(data[0] != null).toBe(expectResult);
                expect(data[0].response.login == _userData.login).toBe(expectResult);
                expect(data[0].response.userId != null).toBe(expectResult);
                next();
            }).fail(function (err) {
                expect(false).toBe(expectResult);
                next();
            }).done();
        });
    };

    //==============
    //actual test

    _signUp();
    _login();
    _deleteUser();

    _getProfile(false);

    _signUp();
    _login();
    _getProfile();
    _logout();
    _deleteUser(false);
    _getProfile(false);
    _login();
    _deleteUser();
});
