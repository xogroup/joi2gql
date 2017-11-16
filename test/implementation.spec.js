'use strict';

const Lab = require('lab');
const { script, assertions } = Lab;
const lab = exports.lab = script();
const { describe, it } = lab;
assertions.should();

const {
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString,
    GraphQLID,
    GraphQLInt,
    GraphQLFloat,
    GraphQLBoolean,
    GraphQLList,
    GraphQLNonNull
} = require('graphql');
const {
    any,
    object,
    array,
    string,
    number,
    boolean,
    lazy
} = require('joi');
const {
    typeDictionary
} = require('../src/helpers');

const internals  = {};
const Joi2GQL = require('../src/implementation');

describe('UNIT', () => {

    describe('.transmuteType()', () => {

        it('should error when joi schema is not an object', async () => {

            const joiSchema = string();

            Joi2GQL.transmuteType.bind(null, joiSchema).should.throw('Type needs to be an object');
        });

        it('should create a GraphQL data type given a joi schema', async () => {

            const config = {
                name: 'Subject'
            };

            Joi2GQL.transmuteType(internals.buildJoiSchema(), config).constructor.should.equal( GraphQLObjectType );
        });

        it('should assign name to Anon if one was not given', async () => {

            const joiSchema = object().keys({
                a: string(),
                b: number().integer()
            });

            Joi2GQL.transmuteType(joiSchema).name.should.equal('Anon');
        });

        it('should properly create a GraphQL data type and support descriptions', async () => {

            const desc = 'Some description';
            const joiSchema = object().keys({
                a: string()
            });
            const config = {
                name       : 'A',
                description: desc
            };

            Joi2GQL.transmuteType(joiSchema, config).description.should.equal(desc);
        });

        it('should properly create a GraphQL data type and support string scalar types', async () => {

            const joiSchema = object().keys({
                a: string()
            });

            Joi2GQL.transmuteType(joiSchema)._typeConfig.fields.a.type.should.equal( GraphQLString );
        });

        it('should properly create a GraphQL data type and support id scalar types', async () => {

            const joiSchema = object().keys({
                a: string().guid()
            });

            Joi2GQL.transmuteType(joiSchema)._typeConfig.fields.a.type.should.equal( GraphQLID );
        });

        it('should properly create a GraphQL data type and support float scalar types', async () => {

            const joiSchema = object().keys({
                a: number()
            });

            Joi2GQL.transmuteType(joiSchema)._typeConfig.fields.a.type.should.equal( GraphQLFloat );
        });

        it('should properly create a GraphQL data type and support int scalar types', async () => {

            const joiSchema = object().keys({
                a: number().integer()
            });

            Joi2GQL.transmuteType(joiSchema)._typeConfig.fields.a.type.should.equal( GraphQLInt );
        });

        it('should properly create a GraphQL data type and support boolean scalar types', async () => {

            const joiSchema = object().keys({
                a: boolean()
            });

            Joi2GQL.transmuteType(joiSchema)._typeConfig.fields.a.type.should.equal( GraphQLBoolean );
        });

        it('should properly create a GraphQL data type and support list scalar types', async () => {//TODO: Arrays need items, go down to scalar types! API.MD

            const joiSchema = object().keys({
                a: array().items(string())
            });

            Joi2GQL.transmuteType(joiSchema)._typeConfig.fields.a.type.should.deep.equal( new GraphQLList(GraphQLString) );
        });

        it('should error when using array type without specifying a scalar type as an item', async () => {

            const joiSchema = object().keys({
                a: array()
            });

            Joi2GQL.transmuteType.bind(null, joiSchema).should.throw('Need to provide scalar type as an item when using joi array');
        });

        it('should properly create a GraphQL data type and support required fields', async () => {

            const joiSchema = object().keys({
                a: number().required()
            });

            Joi2GQL.transmuteType(joiSchema)._typeConfig.fields.a.type.should.deep.equal( new GraphQLNonNull(GraphQLFloat) );
        });

        it('should properly create a GraphQL data type and support complex required fields', async () => {

            const joiSchema = object().keys({
                a: number().integer().required()
            });

            Joi2GQL.transmuteType(joiSchema)._typeConfig.fields.a.type.should.deep.equal( new GraphQLNonNull(GraphQLInt) );
        });

        it('should properly create a GraphQL data type and support enum scalar types', async () => {

            const scalars = [
                {
                    value      : 'a',
                    derivedFrom: 0
                },
                {
                    value      : 'b',
                    derivedFrom: 1
                }
            ];
            const joiSchema = object().keys({
                a: any().only(scalars).meta({ name: 'A' })
            });
            const expected = {
                name  : 'A',
                values: {
                    a: { value: 0 },
                    b: { value: 1 }
                }
            };

            Joi2GQL.transmuteType(joiSchema)._typeConfig.fields.a.type._enumConfig.should.deep.equal(expected);
        });

        it('should properly create a GraphQL data type, support enum scalar types and assign Anon as name if one is not provided', async () => {

            const scalars = [
                {
                    value      : 'a',
                    derivedFrom: 0
                },
                {
                    value      : 'b',
                    derivedFrom: 1
                }
            ];
            const joiSchema = object().keys({
                a: any().only(scalars)
            });
            const expected = {
                name  : 'Anon',
                values: {
                    a: { value: 0 },
                    b: { value: 1 }
                }
            };

            Joi2GQL.transmuteType(joiSchema)._typeConfig.fields.a.type._enumConfig.should.deep.equal(expected);
        });

        it('should create a GraphQL data type and correctly set the args', async () => {

            const config = {
                name: 'Subject',
                args: { id: number().integer() }
            };

            const expected = {
                type: typeDictionary.number
            };

            Joi2GQL.transmuteType(internals.buildJoiSchema(), config).constructor.should.equal( GraphQLObjectType );
            Joi2GQL.transmuteType(internals.buildJoiSchema(), config)._typeConfig.args.id.should.deep.equal(expected);
        });

        it('should create a GraphQL data type and support input object type args', async () => {

            const personInputType = object().keys({
                a: string()
            });
            const config = {
                name: 'Subject',
                args: { person: personInputType }
            };
            const subject = Joi2GQL.transmuteType(internals.buildJoiSchema(), config);

            subject.constructor.should.equal( GraphQLObjectType );
            subject._typeConfig.args.person.should.exist;
        });

        it('should construct graphql data type given a recurisve felicity constructor', async () => {

            const typeName = 'Subject';
            const config = {
                name: typeName
            };
            const joiSchema = object().keys({
                prop1: string(),
                prop2: number().integer(),
                prop3: lazy(() => joiSchema).description(typeName)
            });

            const subject = Joi2GQL.transmuteType(joiSchema, config);

            (subject._typeConfig.fields instanceof Function).should.be.true;
            subject._typeConfig.fields().prop3.type._typeConfig.name.should.equal(typeName);
            subject.constructor.should.equal( GraphQLObjectType ); //TODO: Drawback of checking just for constructor
        });

        it('should properly construct a graphql data type given a recursive felicity constructor nested in an array', async () => { //TODO: Update Api.MD for this use case

            const config = {
                name   : 'Subject',
                args   : { id: number().integer() },
                resolve: function () {}
            };
            const joiSchema = object().keys({
                a: string(),
                b: number().integer(),
                c: number(),
                d: object().keys({
                    prop1: string(),
                    prop2: string()
                }),
                e: boolean(),
                f: array().items(lazy(() => joiSchema).description('Subject')) // May not need users to specify
            });

            Joi2GQL.transmuteType(joiSchema, config).constructor.should.equal( GraphQLObjectType );
        });
    });

    describe('.transmuteSchema()', () => {

        describe('Root Query', () => {

            it('successfully create a graphql query schema', async () => {

                const config = { name: 'Subject' };
                const Subject = Joi2GQL.transmuteType(internals.buildJoiSchema(), config);
                const schema = {
                    query: {
                        subject: Subject
                    }
                };

                Joi2GQL.transmuteSchema( schema ).constructor.should.equal( GraphQLSchema );
            });

        });

        describe('Root Mutation', () => {

            it('should successfully create a graphql mutation schema', async () => {

                const config = { name: 'Subject' };
                const Subject = Joi2GQL.transmuteType(internals.buildJoiSchema(), config);
                const schema = {
                    mutation: {
                        subject: Subject
                    }
                };

                Joi2GQL.transmuteSchema( schema ).constructor.should.equal( GraphQLSchema );
            });
        });

        describe('Root Subscription', () => {

            it('should successfully create a graphql subscription schema', async () => {

                const config = { name: 'Subject' };
                const Subject = Joi2GQL.transmuteType(internals.buildJoiSchema(), config);
                const schema = {
                    subscription: {
                        subject: Subject
                    }
                };

                Joi2GQL.transmuteSchema( schema ).constructor.should.equal( GraphQLSchema );
            });
        });

        it('should successfully create a graphql schema given a joi schema and/or graphql data type', async () => {

            const config = { name: 'Subject' };
            const Subject = Joi2GQL.transmuteType(internals.buildJoiSchema(), config);
            const schema = {
                query: {
                    subject: Subject,
                    hello: string().meta({ resolve: () => 'world' })
                }
            };

            Joi2GQL.transmuteSchema( schema ).constructor.should.equal( GraphQLSchema );
        });

        it('should throw when query, mutation, or subscription is not defined', async () => {

            Joi2GQL.transmuteSchema.bind(null, {}).should.throw();
        });

        it('should throw an error when schema is not provided', async () => {

            Joi2GQL.transmuteSchema.bind(null).should.throw('Must provide a schema');
        });
    });
});


internals.buildJoiSchema = () => {

    const schema = object().keys({
        a: string(),
        b: number().integer(),
        c: number(),
        d: object().keys({
            prop1: string(),
            prop2: string()
        }),
        e: boolean(),
        f: array().items(string())
    });

    return schema;
};
