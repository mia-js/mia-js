const _ = require('lodash');
const Q = require('q');
const MiaJs = require('mia-js-core');
const ObjectID = require('mia-js-core/lib/dbAdapters').MongoObjectID;
const Shared = MiaJs.Shared;

describe('generic-user-model', () => {
    const UserModel = Shared.models('generic-user-model');

    it('must be defined', () => {
        expect(UserModel).toBeDefined();
    });

    describe('initialize', () => {
        it('drop collection', next => {
            UserModel.drop((error, result) => {
                expect(error).toBeNull();
                expect(result).toBeTruthy();
                next();
            });
        });
    });

    describe('baseModel functions', () => {
        const testDoc = {
            _id: new ObjectID(),
            login: 'paul_brause',
            group: 'test',
            messaging: [{
                type: 'email',
                value: 'paul_brause@test.de'
            }]
        };
        const bulkDocA = {
            login: 'peter_lustig',
            group: 'test',
            messaging: [{
                type: 'email',
                value: 'peter_lustig@test.de'
            }, {
                type: 'email',
                value: 'pl@gmx.de'
            }],
            bulkWrite: true
        };
        const bulkDocB = {
            login: 'max_mustermann',
            group: 'test',
            messaging: [{
                type: 'email',
                value: 'max_mustermann@test.de'
            }, {
                type: 'phone',
                value: '00490123987654321'
            }, {
                type: 'email',
                value: 'max_mustermann@gmail.com'
            }],
            bulkWrite: true
        };
        const insertOne = next => {
            UserModel.insertOne(testDoc, (error, result) => {
                expect(error).toBeNull();
                expect(result.result.ok).toBe(1);
                expect(result.insertedCount).toBe(1);
                expect(result.insertedId).toBe(testDoc._id);
                next();
            });
        };
        const deleteOne = next => {
            UserModel.deleteOne({_id: testDoc._id}, (error, result) => {
                expect(error).toBeNull();
                expect(result.result.ok).toBe(1);
                expect(result.deletedCount).toBe(1);
                next();
            });
        };
        const insertMany = next => {
            UserModel.insertMany([bulkDocA, bulkDocB], (error, result) => {
                expect(error).toBeNull();
                expect(result.result.ok).toBe(1);
                expect(result.insertedCount).toBe(2);
                next();
            });
        };
        const deleteMany = next => {
            UserModel.deleteMany({bulkWrite: true}, (error, result) => {
                expect(error).toBeNull();
                expect(result.result.ok).toBe(1);
                expect(result.deletedCount).toBe(2);
                next();
            });
        };
        const ensureAllIndexes = next => {
            UserModel.ensureAllIndexes(async error => {
                const indexes = await UserModel.indexes();
                expect(error).toBeNull();
                // Model indexes don't contain _id index therefore add 1
                expect(indexes.length).toBe(UserModel.getIndexes().length + 1);
                next();
            });
        };

        it('getSingleIndexes', () => {
            expect(_.isArray(UserModel.getSingleIndexes())).toBeTruthy();
        });
        it('getCompoundIndexes', () => {
            expect(_.isArray(UserModel.getCompoundIndexes())).toBeTruthy();
        });
        it('getTextIndexes', () => {
            expect(_.isArray(UserModel.getTextIndexes())).toBeTruthy();
        });
        it('getAllIndexes', () => {
            expect(_.isArray(UserModel.getIndexes())).toBeTruthy();
        });
        it('ensureIndexes', next => {
            const singleIndexes = UserModel.getSingleIndexes();
            UserModel.ensureIndexes(singleIndexes, false, error => {
                expect(error).toBeNull();
                next();
            });
        });
        it('ensureAllIndexes', next => {
            ensureAllIndexes(next);
        });
        it('validate', next => {
            UserModel.validate({}, (error, result) => {
                expect(error.name).toBe('ValidationError');
                expect(error.err.length).toBe(2);
                expect(_.isObject(result)).toBeTruthy();
                next();
            });
        });
        it('db', () => {
            const env = Shared.config('environment');
            const databases = env.mongoDatabases;
            const dbName = Object.keys(databases)[0];
            const db = UserModel.db(dbName);
            expect(db.databaseName).toBe(dbName);
        });
        it('collection', next => {
            const env = Shared.config('environment');
            const databases = env.mongoDatabases;
            const dbName = Object.keys(databases)[0];
            UserModel.collection((error, collection) => {
                expect(error).toBeNull();
                expect(collection.namespace).toBe([dbName, UserModel.collectionName].join('.'));
                next();
            });
        });
        it('insertOne', next => {
            insertOne(() => {
                deleteOne(next);
            });
        });
        it('updateOne', next => {
            insertOne(() => {
                UserModel.updateOne({_id: testDoc._id}, {$set: {updated: 42}}, (error, result) => {
                    expect(error).toBeNull();
                    expect(result.result.ok).toBe(1);
                    expect(result.matchedCount).toBe(1);
                    expect(result.modifiedCount).toBe(1);

                    UserModel.findOne({_id: testDoc._id}, {_id: 0, updated: 1}, (error, doc) => {
                        expect(error).toBeNull();
                        expect(doc.updated).toBe(42);

                        deleteOne(next);
                    });
                });
            });
        });
        it('aggregate', next => {
            // @todo See https://jira.mongodb.org/browse/NODE-1117
            next();
            /*UserModel.aggregate([{$match: {_id: testDoc._id}}], (error, result) => {
                console.log(error, result);
                next();
            });*/
        });
        it('bulkWrite', next => {
            UserModel.bulkWrite([
                {
                    insertOne: bulkDocA
                },
                {
                    insertOne: bulkDocB
                }
            ], (error, result) => {
                expect(error).toBeNull();
                expect(result.ok).toBe(1);
                expect(result.insertedCount).toBe(2);

                deleteMany(next);
            });
        });
        it('count', next => {
            insertMany(() => {
                UserModel.count((error, count) => {
                    expect(error).toBeNull();
                    expect(count).toBe(2);

                    deleteMany(next);
                })
            })
        });
        it('createIndex', () => {
            // Tested in 'ensureIndexes' and 'ensureAllIndexes'
        });
        it('deleteMany', next => {
            insertMany(() => {
                deleteMany(next);
            })
        });
        it('deleteOne', next => {
            insertOne(() => {
                deleteOne(next);
            });
        });
        it('distinct', next => {
            insertMany(() => {
                UserModel.distinct('group', (error, distinctValues) => {
                    expect(error).toBeNull();
                    expect(distinctValues.length).toBe(1);
                    expect(distinctValues).toContain('test');

                    deleteMany(next);
                });
            })
        });
        it('drop', () => {
            // Tested in 'drop collection'
        });
        it('dropIndex', next => {
            ensureAllIndexes(async () => {
                const indexes = await UserModel.indexes();
                const index = indexes[indexes.length - 1];
                UserModel.dropIndex(index.name, (error, result) => {
                    expect(error).toBeNull();
                    expect(result.ok).toBe(1);
                    expect(result.nIndexesWas).toBe(indexes.length);

                    ensureAllIndexes(next);
                });
            })
        });
        it('find', next => {
            insertMany(() => {
                UserModel.find({bulkWrite: true}, {_id: 0, login: 1}, async (error, cursor) => {
                    const docs = await cursor.toArray();
                    expect(error).toBeNull();
                    expect(docs.length).toBe(2);
                    for (let i in docs) {
                        let doc = docs[i];
                        expect([bulkDocA.login, bulkDocB.login]).toContain(doc.login);
                    }

                    deleteMany(next);
                })
            })
        });
        it('findOne', () => {
            // Tested in 'updateOne'
        });
        it('findOneAndDelete', next => {
            insertOne(() => {
                UserModel.findOneAndDelete({_id: testDoc._id}, (error, result) => {
                    expect(error).toBeNull();
                    expect(result.ok).toBe(1);
                    expect(result.value._id.toString()).toBe(testDoc._id.toString());
                    next();
                });
            });
        });
        it('findOneAndReplace', next => {
            insertOne(() => {
                UserModel.findOneAndReplace({_id: testDoc._id}, {replaced: true}, (error, result) => {
                    expect(error).toBeNull();
                    expect(result.ok).toBe(1);
                    expect(result.lastErrorObject.n).toBe(1);
                    expect(result.lastErrorObject.updatedExisting).toBe(true);

                    UserModel.findOne({_id: testDoc._id}, (error, doc) => {
                        expect(error).toBeNull();
                        expect(doc.login).toBeUndefined();
                        expect(doc.replaced).toBe(true);

                        deleteOne(next);
                    });
                });
            })
        });
        it('findOneAndUpdate', next => {
            insertOne(() => {
                UserModel.findOneAndUpdate({_id: testDoc._id}, {
                    $unset: {group: 1},
                    $set: {updated: 42}
                }, (error, result) => {
                    expect(error).toBeNull();
                    expect(result.ok).toBe(1);
                    expect(result.lastErrorObject.n).toBe(1);
                    expect(result.lastErrorObject.updatedExisting).toBe(true);

                    UserModel.findOne({_id: testDoc._id}, (error, doc) => {
                        expect(error).toBeNull();
                        expect(doc.group).toBeUndefined();
                        expect(doc.updated).toBe(42);

                        deleteOne(next);
                    });
                });
            })
        });
        it('geoHaystackSearch', next => {
            UserModel.geoHaystackSearch(42, 177, (error, result) => {
                expect(error.name).toBe('MongoError');
                expect(error.message).toBe('no geoSearch index');
                expect(result).toBeUndefined();
                next();
            });
        });
        it('indexes', () => {
            // Tested in 'ensureAllIndexes'
        });
        it('indexExists', next => {
            ensureAllIndexes(async () => {
                const indexes = await UserModel.indexes();
                const index = indexes[indexes.length - 1];
                UserModel.indexExists(index.name, (error, indexExists) => {
                    expect(error).toBeNull();
                    expect(indexExists).toBeTruthy();
                    next();
                });
            })
        });
        it('indexInformation', next => {
            ensureAllIndexes(() => {
                UserModel.indexInformation((error, dbIndexes) => {
                    const modelIndexes = UserModel.getIndexes().map(index => {
                        return index.name;
                    });
                    expect(error).toBeNull();
                    for (let indexName in dbIndexes) {
                        if (indexName === '_id_') continue;
                        expect(modelIndexes).toContain(indexName);
                    }
                    next();
                });
            })
        });
        it('initializeOrderedBulkOp', next => {
            UserModel.initializeOrderedBulkOp()
                .then(OrderedBulkOperation => {
                    OrderedBulkOperation.insert(bulkDocA).insert(bulkDocB).execute((error, result) => {
                        expect(error).toBeNull();
                        expect(result.ok).toBe(1);
                        expect(result.nInserted).toBe(2);

                        deleteMany(next);
                    });
                })
                .catch(error => {
                    next.fail(error);
                });
        });
        it('initializeUnorderedBulkOp', next => {
            UserModel.initializeUnorderedBulkOp()
                .then(UnorderedBulkOperation => {
                    UnorderedBulkOperation.insert(bulkDocA).insert(bulkDocB).execute((error, result) => {
                        expect(error).toBeNull();
                        expect(result.ok).toBe(1);
                        expect(result.nInserted).toBe(2);

                        deleteMany(next);
                    });
                })
                .catch(error => {
                    next.fail(error);
                });
        });
        it('insertMany', next => {
            insertMany(() => {
                deleteMany(next);
            });
        });
        it('isCapped', async () => {
            expect(await UserModel.isCapped()).toBeUndefined();
        });
        it('listIndexes', next => {
            UserModel.listIndexes()
                .then(CommandCursor => {
                    return Q.ninvoke(CommandCursor, 'toArray');
                })
                .then(indexes => {
                    expect(indexes.length).toBe(UserModel.getIndexes().length + 1);
                    next();
                })
                .catch(error => {
                    next.fail(error);
                });
        });
        it('mapReduce', next => {
            const map = function () {
                var doc = this;
                doc.messaging.forEach(item => {
                    if (item.type === 'email') {
                        emit(doc.login, item.value);
                    }
                });
            };
            const reduce = function (login, emailAddresses) {
                return {
                    email_addresses: emailAddresses
                };
            };
            const options = {
                out: {inline: 1},
                query: {
                    bulkWrite: true
                }
            };
            insertMany(() => {
                UserModel.mapReduce(map, reduce, options, (error, result) => {
                    expect(error).toBeNull();
                    expect(result.length).toBe(2);
                    for (let i in result) {
                        let login = result[i];
                        expect(login.value.email_addresses.length).toBe(2);
                    }

                    deleteMany(next);
                });
            })
        });
        it('options', async () => {
            expect(await UserModel.options()).toEqual({});
        });
        it('parallelCollectionScan', next => {
            insertMany(() => {
                UserModel.parallelCollectionScan((error, cursors) => {
                    expect(error).toBeNull();
                    expect(cursors.length).toBe(1);

                    deleteMany(next);
                });
            })
        });
        it('reIndex', next => {
            ensureAllIndexes(() => {
                UserModel.reIndex((error, result) => {
                    expect(error).toBeNull();
                    expect(result).toBeTruthy();
                    next();
                });
            })
        });
        it('rename', next => {
            let originalName = UserModel.collectionName;
            UserModel.rename(UserModel.collectionName + 'Renamed', (error, result) => {
                expect(error).toBeNull();
                expect(_.isObject(result)).toBeTruthy();
                UserModel.collectionName = UserModel.collectionName + 'Renamed';

                UserModel.rename(originalName, (error, result) => {
                    expect(error).toBeNull();
                    expect(_.isObject(result)).toBeTruthy();
                    UserModel.collectionName = originalName;
                    next();
                })
            });
        });
        it('stats', async () => {
            expect(_.isObject(await UserModel.stats())).toBeTruthy();
        });
        it('updateMany', next => {
            insertMany(() => {
                UserModel.updateMany({bulkWrite: true}, {
                    $unset: {group: 1},
                    $set: {updated: 42}
                }, (error, {result}) => {
                    expect(error).toBeNull();
                    expect(result.ok).toBe(1);
                    expect(result.n).toBe(2);
                    expect(result.nModified).toBe(2);

                    UserModel.find({bulkWrite: true}, async (error, cursor) => {
                        const docs = await cursor.toArray();
                        for (let i in docs) {
                            let doc = docs[i];
                            expect(doc.group).toBeUndefined();
                            expect(doc.updated).toBe(42);
                        }
                        deleteMany(next);
                    });
                });
            });
        });
    });
});
