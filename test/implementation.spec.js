'use strict';

const Lab = require('lab');
const { script, assertions } = Lab;
const lab = exports.lab = script();
const { describe, it } = lab;
assertions.should();

const Document = require('./mocks/document');
const { GraphQLObjectType, GraphQLSchema } = require('graphql');
const { typeDictionary } = require('../src/helpers');
const Joi = require('joi');
const Felicity = require('felicity');

const CoreModule = require('../src/implementation');
let instance;

describe('UNIT', () => {
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
        it('should create a GraphQL data type given a felicity constructor', (done) => {
            const config = {
                name: 'Human'
            };

            instance.composeType(Document, config)
                .constructor.should.equal(GraphQLObjectType);
            done();
        });

        it('should create a GraphQL data type and correctly set the args', (done) => {
            const config = {
                name: 'Human',
                args: { id: Joi.number().integer() }
            };

            const expected = {
                type: typeDictionary.number
            };

            instance.composeType(Document, config)._typeConfig.args.id.should.deep.equal(expected);
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

            instance.composeType.bind(null, falseConstructor).should.throw('Type needs to be an object');
            done();
        });

        it('should assign name to Anon if one was not given', (done) => {
            const falseConstructor = {
                schema: {
                    meta: function(config) {
                        return {
                            _type : 'object',
                            _meta : [config],
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

        it('should properly construct a graphql data type given a felicity constructor that references itself', (done) => {
            const Joischema = Joi.object().keys({
                name      : Joi.string(),
                age       : Joi.number().integer(),
                cyborgMods: Joi.number(),
                occupation: Joi.object().keys({
                    title: Joi.string(),
                    level: Joi.string()
                }),
                active      : Joi.boolean(),
                teamMembers: Joi.array().items(Joi.lazy(() => Joischema).description('Cyborg'))
            });

            const FelicityConstructor = Felicity.entityFor(Joischema);

            const config = {
                name: 'Cyborg',
                args: { id: Joi.number().integer() },
                resolve: function(){}
            };

            instance.composeType(FelicityConstructor, config)
                .constructor.should.equal( GraphQLObjectType );

            done();
        });
    });

    describe('.composeSchema()', () => {
        it('successfully create a graphql schema', (done) => {
            const config = { name: 'Human' };
            const Human = instance.composeType(Document, config);
            const schema = {
                query: {
                    human: Human
                }
            };

            instance.composeSchema( schema ).constructor.should.equal( GraphQLSchema );
            done();
        });

        it('should successfully create a graphql schema given a joi schema and/or graphql data type', (done) => {
            const config = { name: 'Alien' };
            const Saiyan = instance.composeType(Document, config);
            const schema = {
                query: {
                    human: Saiyan,
                    hello: Joi.string().meta({ resolve: () => 'world' })
                }
            };

            instance.composeSchema( schema ).constructor.should.equal( GraphQLSchema );
            done();
        });
    });
});
