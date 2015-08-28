global.sharedInfo = null;
var Shared = require('mia-js-core/node_modules/shared')
    , MongoAdapter = require('mia-js-core/node_modules/dbAdapters').MongoAdapter
    , DeviceAuth = require('../generic-deviceAndSessionAuth.js')
    , UserAuth = require('../generic-deviceAndSessionAuth.js');

// Test validator functions
describe("AuthManager", function () {
    var createdDeviceId
        , createdSessionId
        , loadedDeviceData1
        , loadedDeviceData2
        , loadedDeviceData3
        , loadedUserData;

    it("must be defined", function (next) {
        expect(DeviceAuth).toBeDefined();
        expect(UserAuth).toBeDefined();
        next();
    });

    describe("Initialize", function () {
        it("do inits", function (next) {
            //initialize config
            Shared.initializeConfig('/config', process.argv[2]);
            //create new mongo db Adapter
            var mongoDbAdapter = new MongoAdapter();
            //register adapter
            Shared.registerDbAdapter('mongo', mongoDbAdapter);
            next();
        });
    });

    describe("Device Section", function () {
        describe("Test individual functions", function () {

            function createDeviceAndValidateSession(callback) {
                it("createDevice", function (next) {
                    DeviceAuth.createDevice({}, {}, 5).then(function (deviceId) {
                        expect(deviceId).not.toBeNull();
                        console.log("Created device: " + deviceId);
                        createdDeviceId = deviceId;
                        next();
                    }).fail(function (err) {
                        console.log(err);
                        expect(false).toBeTruthy();
                        next();
                    }).done();
                });

                it("updateDevice", function (next) {
                    DeviceAuth.updateDevice({}, createdDeviceId, {device: {model: 'iPhone7'}}).then(function (deviceId) {
                        expect(deviceId).not.toBeNull();
                        console.log("Updated device: " + deviceId);
                        createdDeviceId = deviceId;
                        next();
                    }).fail(function (err) {
                        console.log(err);
                        expect(false).toBeTruthy();
                        next();
                    }).done();
                });

                it("generateSessionId", function (next) {
                    DeviceAuth.generateSessionId({}, createdDeviceId, '1.1.1.1', ['12gebrauchtwagen.de'], 5).then(function (sessionId) {
                        expect(sessionId).not.toBeNull();
                        console.log("Created session: " + sessionId);
                        createdSessionId = sessionId;
                        next();
                    }).fail(function (err) {
                        console.log(err);
                        expect(false).toBeTruthy();
                        next();
                    }).done();
                });

                it("validateSessionToken", function (next) {
                    DeviceAuth.validateSessionToken({}, createdSessionId, '1.1.1.1', '12gebrauchtwagen.de').then(function (deviceData) {
                        expect(deviceData).not.toBeNull();
                        callback(deviceData);
                        console.log("Device data: " + deviceData);
                        next();
                    }).fail(function (err) {
                        console.log(err);
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
                    console.log(err);
                    next();
                }).done();
            });

            it("signUpUser", function (next) {
                UserAuth.signUpUser({
                    login: 'login1',
                    group: 'group1',
                    email: 'test@test.abc',
                    password: 'password1'
                }, options).then(function (userData) {
                    expect(userData).not.toBeNull();
                    createdUserData = userData;
                    console.log(userData);
                    next();
                }).fail(function (err) {
                    console.log(err);
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
                        console.log(err);
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
                        console.log(err);
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
                        console.log(err);
                        expect(false).toBeTruthy();
                        next();
                    }).done();
            });

            it("_isUserLoggedInOnDeviceByLoginAndGroup", function (next) {
                UserAuth._isUserLoggedInOnDeviceByLoginAndGroupWithId(createdUserData._id, '456', 'app1').then(function (isLoggedIn) {
                    expect(isLoggedIn).toBeTruthy();
                    next();
                }).fail(function (err) {
                    console.log(err);
                    expect(false).toBeTruthy();
                    next();
                }).done();
            });

            it("logoutAnyUserFromDevice", function (next) {
                UserAuth.logoutAnyUserFromDevice('456', 'app1').then(function (userData) {
                    expect(userData).not.toBeNull();
                    next();
                }).fail(function (err) {
                    console.log(err);
                    expect(false).toBeTruthy();
                    next();
                }).done();
            });

            it("_isUserLoggedInOnDeviceByLoginAndGroup", function (next) {
                UserAuth._isUserLoggedInOnDeviceByLoginAndGroupWithId(createdUserData._id, '456', 'app1').then(function (isLoggedIn) {
                    expect(isLoggedIn).toBeFalsy();
                    next();
                }).fail(function (err) {
                    console.log(err);
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
                    console.log(err);
                    next();
                }).done();
            });

            it("signUpUser", function (next) {
                UserAuth.signUpUser({
                    login: 'login2',
                    group: 'group2',
                    email: 'test2@test.abc',
                    password: 'password2'
                }, options).then(function (userData) {
                    expect(userData).not.toBeNull();
                    createdUserData1 = userData;
                    console.log(userData);
                    next();
                }).fail(function (err) {
                    console.log(err);
                    expect(false).toBeTruthy();
                    next();
                }).done();
            });

            it("deleteUser", function (next) {
                UserAuth.deleteUser('login3', 'group2').then(function () {
                    next();
                }).fail(function (err) {
                    console.log(err);
                    next();
                }).done();
            });

            it("signUpUser", function (next) {
                UserAuth.signUpUser({
                    login: 'login3',
                    group: 'group2',
                    email: 'test3@test.abc',
                    password: 'password2'
                }, options).then(function (userData) {
                    expect(userData).not.toBeNull();
                    createdUserData2 = userData;
                    console.log(userData);
                    next();
                }).fail(function (err) {
                    console.log(err);
                    expect(false).toBeTruthy();
                    next();
                }).done();
            });

            it("login user 1 on device 1", function (next) {
                UserAuth.loginUser('login2', 'group2', 'password2', deviceId1, 'app3', 'Phone1', options).then(function (loginResult) {
                    expect(loginResult).not.toBeNull();
                    next();
                }).fail(function (err) {
                    console.log(err);
                    expect(false).toBeTruthy();
                    next();
                }).done();
            });

            it("login user 1 on device 2", function (next) {
                UserAuth.loginUser('login2', 'group2', 'password2', deviceId2, 'app3', 'Phone2', options).then(function (loginResult) {
                    expect(loginResult).not.toBeNull();
                    next();
                }).fail(function (err) {
                    console.log(err);
                    expect(false).toBeTruthy();
                    next();
                }).done();
            });

            it("login user 2 on device 2", function (next) {
                UserAuth.loginUser('login3', 'group2', 'password2', deviceId2, 'app3', 'Phone2', options).then(function (loginResult) {
                    expect(loginResult).not.toBeNull();
                    UserAuth.isUserLoggedInOnDeviceByLoginAndGroup('login3', 'group2', deviceId2, 'app3').then(function (userData) {
                        expect(userData).not.toBeNull();
                        UserAuth.isUserLoggedInOnDeviceByLoginAndGroup('login2', 'group2', deviceId2, 'app3').then(function (userData) {
                            expect(userData).toBeNull();
                            next();
                        });
                    });
                }).fail(function (err) {
                    console.log(err);
                    expect(false).toBeTruthy();
                    next();
                }).done();
            });

            it("login user 1 on device 2", function (next) {
                UserAuth.loginUser('login2', 'group2', 'password2', deviceId2, 'app3', 'Phone2', options).then(function (loginResult) {
                    expect(loginResult).not.toBeNull();
                    UserAuth.isUserLoggedInOnDeviceByLoginAndGroup('login2', 'group2', deviceId2, 'app3').then(function (userData) {
                        expect(userData).not.toBeNull();
                        UserAuth.isUserLoggedInOnDeviceByLoginAndGroup('login3', 'group2', deviceId2, 'app3').then(function (userData) {
                            expect(userData).toBeNull();
                            next();
                        });
                    });
                }).fail(function (err) {
                    console.log(err);
                    expect(false).toBeTruthy();
                    next();
                }).done();
            });
        });
    });


//describe("User Section", function () {
//    var options = {salt: 'abcd', maxDevicesAllowed: 2};
//
//    describe("Test individual functions", function () {
//        it("_hashCredentials", function (next) {
//            UserAuth.hashCredentials('login1', 'password1', options).then(function (hash) {
//                expect(hash).toBeDefined();
//                console.log('User credentials hash: ' + hash);
//                next();
//            }).done();
//        });
//
//        it("_getUserDataByLoginAndGroup", function (next) {
//            UserAuth.getUserData('login1').then(function (userData) {
//                expect(userData).toBeDefined();
//                next();
//            }).done();
//        });
//
//        it("_checkUsersCredentials", function (next) {
//            UserAuth.checkUsersCredentials('login1', 'password1', options).then(function (userData) {
//                expect(userData).toBeDefined();
//                next();
//            }).done();
//        });
//
//        it("deleteUser", function (next) {
//            UserAuth.deleteUser('login1').then(function () {
//                next();
//            }).fail(function (err) {
//                console.log(err);
//                next();
//            }).done();
//        });
//
//        it("signUpUser", function (next) {
//            UserAuth.signUpUser('login1', 'password1', options).then(function (userData) {
//                expect(userData).toBeDefined();
//                console.log(userData);
//                next();
//            }).fail(function (err) {
//                console.log(err);
//                next();
//            }).done();
//        });
//
//        it("_getUserDataByLoginAndGroup", function (next) {
//            UserAuth.getUserData('login1').then(function (userData) {
//                expect(userData).toBeDefined();
//                loadedUserData = userData;
//                console.log(userData);
//                next();
//            }).fail(function (err) {
//                console.log(err);
//                expect(false).toBeTruthy();
//                next();
//            }).done();
//        });
//    });
//
//    describe("Test user workflows", function () {
//        it("No user is logged in on a device1", function (next) {
//            UserAuth.isUserLoggedInOnADevice('login1', loadedDeviceData1.id).then(function (loginCheckResult) {
//                expect(loginCheckResult).toBeDefined();
//                var deviceData = loginCheckResult.deviceData;
//                var isLoggedIn = loginCheckResult.isLoggedIn;
//                expect(isLoggedIn).toBeFalsy();
//                console.log(loginCheckResult);
//                next();
//            }).fail(function (err) {
//                console.log(err);
//                expect(false).toBeTruthy();
//                next();
//            }).done();
//        });
//
//        it("Login user on device 1", function (next) {
//            UserAuth.loginUser('login1', 'password1', loadedDeviceData1, 'Phone1', options).then(function (loginData) {
//                expect(loginData).toBeDefined();
//                expect(loginData.accessToken).toBeDefined();
//                expect(loginData.userData).toBeDefined();
//                console.log('Access token: ' + accessToken);
//                next();
//            }).fail(function (err) {
//                console.log(err);
//                expect(false).toBeTruthy();
//                next();
//            }).done();
//        });
//
//        it("User now is logged in on device 1", function (next) {
//            UserAuth.isUserLoggedInOnADevice('login1', loadedDeviceData1.id).then(function (loginCheckResult) {
//                expect(loginCheckResult).toBeDefined();
//                var deviceData = loginCheckResult.deviceData;
//                var isLoggedIn = loginCheckResult.isLoggedIn;
//                expect(isLoggedIn).toBeTruthy();
//                console.log(loginCheckResult);
//                next();
//            }).fail(function (err) {
//                console.log(err);
//                expect(false).toBeTruthy();
//                next();
//            }).done();
//        });
//
//        it("Login same user on another device 2", function (next) {
//            UserAuth.loginUser('login1', 'password1', loadedDeviceData2, 'Phone1', options).then(function (loginData) {
//                expect(loginData).toBeDefined();
//                expect(loginData.accessToken).toBeDefined();
//                expect(loginData.userData).toBeDefined();
//                console.log('Access token: ' + accessToken);
//                next();
//            }).fail(function (err) {
//                console.log(err);
//                expect(false).toBeTruthy();
//                next();
//            }).done();
//        });
//
//        it("Login same user with wrong password on device 2", function (next) {
//            UserAuth.loginUser('login1', 'password2', loadedDeviceData2, 'Phone1', options).then(function (loginData) {
//                expect(loginData).not.toBeDefined();
//                console.log('Access token: ' + accessToken);
//                next();
//            }).fail(function (err) {
//                console.log(err);
//                expect(true).toBeTruthy();
//                next();
//            }).done();
//        });
//
//        it("Login same user on another device 3 - should exceed max device number", function (next) {
//            UserAuth.loginUser('login1', 'password1', loadedDeviceData3, 'Phone3', options).then(function (loginData) {
//                expect(loginData).not.toBeDefined();
//                console.log('Access token: ' + accessToken);
//                next();
//            }).fail(function (err) {
//                console.log(err);
//                expect(true).toBeTruthy();
//                next();
//            }).done();
//        });
//    });
//});
});
