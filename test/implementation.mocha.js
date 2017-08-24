'use strict';


const Lab = require('lab');
const { script, assertions, expect } = Lab;
const lab = exports.lab = script();
const { describe, it } = lab;
assertions.should();

const Human = require('./mocks/document');
const { GraphQLObjectType } = require('graphql');

const CoreModule = require('../src/implementation');
let instance;

describe('INSTANCE ', () => {
    instance = new CoreModule();

    it('should properly configure options', (done) => {
        instance.config({ author: 'Samuel Joli' });

        instance.options.should.deep.equal({
            name  : 'xo-joiql',
            author: 'Samuel Joli'
        });

        done();
    });

    describe('.composeType()', () => {
        it('should create GraphQL data type given a felicity constructor', (done) => {
            const config = {
                name: 'Human'
            };

            instance.composeType(Human, config)
                .constructor.should.equal(GraphQLObjectType);
            done();
        });

        it('should error when constructor is not an object', (done) => {
            const falseConstructor = {
                schema: {
                    meta: function() {
                        return {
                            _type: 'string',
                            _meta: []
                        };
                    }
                }
            };

            expect(() => { //TODO: Use chain syntax
                instance.composeType(falseConstructor);
            }).to.throw('Type needs to be an object');
            done();
        });

        it('if constructor does not have a meta name, it assigns Anon', (done) => {
            const falseConstructor = {
                schema: {
                    meta: function() {
                        return {
                            _type : 'object',
                            _meta : [{ key: 'value' }],
                            _inner: {
                                children: {}
                            }
                        };
                    }
                }
            };

            instance.composeType(falseConstructor).name.should.equal('Anon');
            done();
        });
    });
});
