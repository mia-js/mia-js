const _ = require('lodash');
const MiaJs = require('mia-js-core');
const Shared = MiaJs.Shared;

describe('generic-user-model', () => {
    const UserModel = Shared.models('generic-user-model');

    it('must be defined', () => {
        expect(UserModel).toBeDefined();
    });

    describe('baseModel functions', () => {
        it('validate', next => {
            // @todo Test more cases
            UserModel.validate({}, (error, result) => {
                expect(error.name).toBe('ValidationError');
                expect(error.err.length).toBe(2);
                expect(_.isObject(result)).toBeTruthy();
                next();
            });
        });
        it('listIndexes', next => {
            UserModel.ensureAllIndexes(async error => {
                expect(error).toBeNull();

                const modelIndexes = await UserModel.getIndexes();
                const CommandCursor = await UserModel.listIndexes();
                const dbIndexes = await CommandCursor.toArray();

                // _id index not in model
                expect(modelIndexes.length + 1).toBe(dbIndexes.length);

                next();
            })
        });
    });
});
