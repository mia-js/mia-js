var Logger = require('mia-js-core/lib/logger').tag('test')
    , DeviceAuth = require('../deviceAndSessionAuth.js')
    , UserAuth = require('../userAuthManager.js');

// Test validator functions
describe("AuthManager", function () {
    var createdDeviceId
        , createdSessionId
        , loadedDeviceData1
        , loadedDeviceData2
        , loadedDeviceData3;

    it("must be defined", function (next) {
        expect(DeviceAuth).toBeDefined();
        expect(UserAuth).toBeDefined();
        next();
    });

    describe("Device Section", function () {
        describe("Test individual functions", function () {

            function createDeviceAndValidateSession(callback) {
                it("createDevice", function (next) {
                    DeviceAuth.createDevice({}, {}, 5).then(function (deviceId) {
                        expect(deviceId).not.toBeNull();
                        Logger.info("Created device: " + deviceId);
                        createdDeviceId = deviceId;
                        next();
                    }).fail(function (err) {
                        Logger.error(err);
                        expect(false).toBeTruthy();
                        next();
                    }).done();
                });

                it("updateDevice", function (next) {
                    DeviceAuth.updateDevice({}, createdDeviceId, {device: {model: 'iPhone7'}}).then(function (deviceId) {
                        expect(deviceId).not.toBeNull();
                        Logger.info("Updated device: " + deviceId);
                        createdDeviceId = deviceId;
                        next();
                    }).fail(function (err) {
                        Logger.error(err);
                        expect(false).toBeTruthy();
                        next();
                    }).done();
                });

                it("generateSessionId", function (next) {
                    DeviceAuth.generateSessionId({}, createdDeviceId, '1.1.1.1', ['12gebrauchtwagen.de'], 5).then(function (sessionId) {
                        expect(sessionId).not.toBeNull();
                        Logger.info("Created session: " + sessionId);
                        createdSessionId = sessionId;
                        next();
                    }).fail(function (err) {
                        Logger.error(err);
                        expect(false).toBeTruthy();
                        next();
                    }).done();
                });

                it("validateSessionToken", function (next) {
                    DeviceAuth.validateSessionToken({}, createdSessionId, '1.1.1.1', '12gebrauchtwagen.de').then(function (deviceData) {
                        expect(deviceData).not.toBeNull();
                        callback(deviceData);
                        Logger.info("Device data: " + deviceData);
                        next();
                    }).fail(function (err) {
                        Logger.error(err);
                        expect(false).toBeTruthy();
                        next();
                    }).done();
                });
            }

            createDeviceAndValidateSession(function (loadedDeviceData) {
                loadedDeviceData1 = loadedDeviceData;
            });
            createDeviceAndValidateSession(function (loadedDeviceData) {
                loadedDeviceData2 = loadedDeviceData;
            });
            createDeviceAndValidateSession(function (loadedDeviceData) {
                loadedDeviceData3 = loadedDeviceData;
            });
        });
    });

    describe("User Section", function () {
        var options = {salt: 'abcd', maxDeviceCount: 2};
        var maxDeviceCount = 2;

        describe("Test individual functions", function () {
            var createdUserData;

            it("deleteUser", function (next) {
                UserAuth.deleteUser('login1', 'group1').then(function () {
                    next();
                }).fail(function (err) {
                    Logger.info(err);
                    next();
                }).done();
            });

            it("signUpUser", function (next) {
                UserAuth.hashCredentials('group1', 'password1', options)
                    .then(passHash => {
                        return UserAuth.signUpUser({
                            login: 'login1',
                            group: 'group1',
                            email: 'test@test.abc',
                            passHash: passHash,
                            nativeLoginIsSet: true
                        }, options)
                    })
                    .then(function (userData) {
                        expect(userData).not.toBeNull();
                        createdUserData = userData;
                        Logger.info(userData);
                        next();
                    }).fail(function (err) {
                    Logger.error(err);
                    expect(false).toBeTruthy();
                    next();
                }).done();
            });

            it("_registerAccessTokenCheckingMaxDevices", function (next) {
                UserAuth._registerAccessTokenCheckingMaxDevices(createdUserData._id, {
                        token: 'abc',
                        appId: 'app1',
                        device: {
                            id: '123',
                            name: '1234',
                            tokenIssueDate: new Date(Date.now())
                        }
                    },
                    maxDeviceCount).then(function (userData) {
                    expect(userData).not.toBeNull();
                    next();
                }).fail(function (err) {
                    Logger.error(err);
                    expect(false).toBeTruthy();
                    next();
                }).done();
            });

            it("_registerAccessTokenCheckingMaxDevices", function (next) {
                UserAuth._registerAccessTokenCheckingMaxDevices(createdUserData._id, {
                        token: 'abc',
                        appId: 'app1',
                        device: {
                            id: '123',
                            name: '1234',
                            tokenIssueDate: new Date(Date.now())
                        }
                    },
                    maxDeviceCount).then(function (userData) {
                    expect(userData).toBeNull();
                    next();
                }).fail(function (err) {
                    Logger.error(err);
                    expect(false).toBeTruthy();
                    next();
                }).done();
            });

            it("_registerAccessTokenCheckingMaxDevices", function (next) {
                UserAuth._registerAccessTokenCheckingMaxDevices(createdUserData._id, {
                        token: 'fgngn',
                        appId: 'app1',
                        device: {
                            id: '456',
                            name: '32456',
                            tokenIssueDate: new Date(Date.now())
                        }
                    },
                    maxDeviceCount).then(function (userData) {
                    expect(userData).not.toBeNull();
                    next();
                }).fail(function (err) {
                    Logger.error(err);
                    expect(false).toBeTruthy();
                    next();
                }).done();
            });

            it("logoutAnyUserFromDevice", function (next) {
                UserAuth.logoutAnyUserFromDevice('456', 'app1').then(function (userData) {
                    expect(userData).not.toBeNull();
                    next();
                }).fail(function (err) {
                    Logger.error(err);
                    expect(false).toBeTruthy();
                    next();
                }).done();
            });
        });

        describe("Test composite functions", function () {
            var createdUserData1, createdUserData2;
            var deviceId1 = "551";
            var deviceId2 = "556";

            it("deleteUser", function (next) {
                UserAuth.deleteUser('login2', 'group2').then(function () {
                    next();
                }).fail(function (err) {
                    Logger.error(err);
                    next();
                }).done();
            });

            it("signUpUser", function (next) {
                UserAuth.hashCredentials('group2', 'password2', options)
                    .then(passHash => {
                        return UserAuth.signUpUser({
                            login: 'login2',
                            group: 'group2',
                            email: 'test2@test.abc',
                            passHash: passHash,
                            nativeLoginIsSet: true
                        }, options);
                    })
                    .then(function (userData) {
                        expect(userData).not.toBeNull();
                        createdUserData1 = userData;
                        Logger.info(userData);
                        next();
                    }).fail(function (err) {
                    Logger.error(err);
                    expect(false).toBeTruthy();
                    next();
                }).done();
            });

            it("deleteUser", function (next) {
                UserAuth.deleteUser('login3', 'group2').then(function () {
                    next();
                }).fail(function (err) {
                    Logger.error(err);
                    next();
                }).done();
            });

            it("signUpUser", function (next) {
                UserAuth.hashCredentials('group2', 'password3', options)
                    .then(passHash => {
                        return UserAuth.signUpUser({
                            login: 'login3',
                            group: 'group2',
                            email: 'test3@test.abc',
                            passHash: passHash,
                            nativeLoginIsSet: true
                        }, options);
                    })
                    .then(function (userData) {
                        expect(userData).not.toBeNull();
                        createdUserData2 = userData;
                        Logger.info(userData);
                        next();
                    }).fail(function (err) {
                    Logger.error(err);
                    expect(false).toBeTruthy();
                    next();
                }).done();
            });

            it("login user 1 on device 1", function (next) {
                UserAuth.loginUser({
                    login: 'login2',
                    group: 'group2',
                    password: 'password2',
                    deviceId: deviceId1,
                    appId: 'app3',
                    deviceName: 'Phone1',
                    options: options
                }).then(function (loginResult) {
                    expect(loginResult).not.toBeNull();
                    next();
                }).fail(function (err) {
                    Logger.error(err);
                    expect(false).toBeTruthy();
                    next();
                }).done();
            });

            it("login user 1 on device 2", function (next) {
                UserAuth.loginUser({
                    login: 'login2',
                    group: 'group2',
                    password: 'password2',
                    deviceId: deviceId2,
                    appId: 'app3',
                    deviceName: 'Phone2',
                    options: options
                }).then(function (loginResult) {
                    expect(loginResult).not.toBeNull();
                    next();
                }).fail(function (err) {
                    Logger.error(err);
                    expect(false).toBeTruthy();
                    next();
                }).done();
            });

            it("login user 2 on device 2", function (next) {
                UserAuth.loginUser({
                    login: 'login3',
                    group: 'group2',
                    password: 'password3',
                    deviceId: deviceId2,
                    appId: 'app3',
                    deviceName: 'Phone2',
                    options: options
                }).then(function (loginResult) {
                    expect(loginResult).not.toBeNull();
                    UserAuth.isUserLoggedInOnDeviceByLoginAndGroup('login3', 'group2', deviceId2, 'app3').then(function (userData) {
                        expect(userData).not.toBeNull();
                        UserAuth.isUserLoggedInOnDeviceByLoginAndGroup('login2', 'group2', deviceId2, 'app3').then(function (userData) {
                            expect(userData).toBeNull();
                            next();
                        }).done();
                    }).done();
                }).fail(function (err) {
                    Logger.error(err);
                    expect(false).toBeTruthy();
                    next();
                }).done();
            });

            it("login user 1 on device 2", function (next) {
                UserAuth.loginUser({
                    login: 'login2',
                    group: 'group2',
                    password: 'password2',
                    deviceId: deviceId2,
                    appId: 'app3',
                    deviceName: 'Phone2',
                    options: options
                }).then(function (loginResult) {
                    expect(loginResult).not.toBeNull();
                    UserAuth.isUserLoggedInOnDeviceByLoginAndGroup('login2', 'group2', deviceId2, 'app3').then(function (userData) {
                        expect(userData).not.toBeNull();
                        UserAuth.isUserLoggedInOnDeviceByLoginAndGroup('login3', 'group2', deviceId2, 'app3').then(function (userData) {
                            expect(userData).toBeNull();
                            next();
                        }).done();
                    }).done();
                }).fail(function (err) {
                    Logger.error(err);
                    expect(false).toBeTruthy();
                    next();
                }).done();
            });
        });
    });
});
