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
const Vodou = require('../src/implementation');

describe('UNIT', () => {

    describe('.transmuteType()', () => {

        it('should error when joi schema is not an object', (done) => {

            const joiSchema = string();

            Vodou.transmuteType.bind(null, joiSchema).should.throw('Type needs to be an object');
            done();
        });

        it('should create a GraphQL data type given a joi schema', (done) => {

            const config = {
                name: 'Human'
            };

            Vodou.transmuteType(internals.buildJoiSchema(), config).constructor.should.equal( GraphQLObjectType );
            done();
        });

        it('should assign name to Anon if one was not given', (done) => {

            const joiSchema = object().keys({
                name: string(),
                age : number().integer()
            });

            Vodou.transmuteType(joiSchema).name.should.equal('Anon');
            done();
        });

        it('should properly create a GraphQL data type and support descriptions', (done) => {

            const desc = 'Some description';
            const joiSchema = object().keys({
                a: string()
            });
            const config = {
                name       : 'A',
                description: desc
            };

            Vodou.transmuteType(joiSchema, config).description.should.equal(desc);
            done();
        });

        it('should properly create a GraphQL data type and support string scalar types', (done) => {

            const joiSchema = object().keys({
                a: string()
            });

            Vodou.transmuteType(joiSchema)._typeConfig.fields.a.type.should.equal( GraphQLString );
            done();
        });

        it('should properly create a GraphQL data type and support id scalar types', (done) => {

            const joiSchema = object().keys({
                a: string().guid()
            });

            Vodou.transmuteType(joiSchema)._typeConfig.fields.a.type.should.equal( GraphQLID );
            done();
        });

        it('should properly create a GraphQL data type and support float scalar types', (done) => {

            const joiSchema = object().keys({
                a: number()
            });

            Vodou.transmuteType(joiSchema)._typeConfig.fields.a.type.should.equal( GraphQLFloat );
            done();
        });

        it('should properly create a GraphQL data type and support int scalar types', (done) => {

            const joiSchema = object().keys({
                a: number().integer()
            });

            Vodou.transmuteType(joiSchema)._typeConfig.fields.a.type.should.equal( GraphQLInt );
            done();
        });

        it('should properly create a GraphQL data type and support boolean scalar types', (done) => {

            const joiSchema = object().keys({
                a: boolean()
            });

            Vodou.transmuteType(joiSchema)._typeConfig.fields.a.type.should.equal( GraphQLBoolean );
            done();
        });

        it('should properly create a GraphQL data type and support list scalar types', (done) => {//TODO: Arrays need items, go down to scalar types! API.MD

            const joiSchema = object().keys({
                a: array().items(string())
            });

            Vodou.transmuteType(joiSchema)._typeConfig.fields.a.type.should.deep.equal( new GraphQLList(GraphQLString) );
            done();
        });

        it('should error when using array type without specifying a scalar type as an item', (done) => {

            const joiSchema = object().keys({
                a: array()
            });

            Vodou.transmuteType.bind(null, joiSchema).should.throw('Need to provide scalar type as an item when using joi array');
            done();
        });

        it('should properly create a GraphQL data type and support required fields', (done) => {

            const joiSchema = object().keys({
                a: number().required()
            });

            Vodou.transmuteType(joiSchema)._typeConfig.fields.a.type.should.deep.equal( new GraphQLNonNull(GraphQLFloat) );
            done();
        });

        it('should properly create a GraphQL data type and support complex required fields', (done) => {

            const joiSchema = object().keys({
                a: number().integer().required()
            });

            Vodou.transmuteType(joiSchema)._typeConfig.fields.a.type.should.deep.equal( new GraphQLNonNull(GraphQLInt) );
            done();
        });

        it('should properly create a GraphQL data type and support enum scalar types', (done) => {

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

            Vodou.transmuteType(joiSchema)._typeConfig.fields.a.type._enumConfig.should.deep.equal(expected);
            done();
        });

        it('should properly create a GraphQL data type, support enum scalar types and assign Anon as name if one is not provided', (done) => {

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

            Vodou.transmuteType(joiSchema)._typeConfig.fields.a.type._enumConfig.should.deep.equal(expected);
            done();
        });

        it('should create a GraphQL data type and correctly set the args', (done) => {

            const config = {
                name: 'Human',
                args: { id: number().integer() }
            };

            const expected = {
                type: typeDictionary.number
            };

            Vodou.transmuteType(internals.buildJoiSchema(), config).constructor.should.equal( GraphQLObjectType );
            Vodou.transmuteType(internals.buildJoiSchema(), config)._typeConfig.args.id.should.deep.equal(expected);
            done();
        });

        it('should create a GraphQL data type and support input object type args', (done) => {

            const personInputType = object().keys({
                a: string()
            });
            const config = {
                name: 'Human',
                args: { person: personInputType }
            };
            const subject = Vodou.transmuteType(internals.buildJoiSchema(), config);

            subject.constructor.should.equal( GraphQLObjectType );
            subject._typeConfig.args.person.should.exist;

            done();
        });

        it('should construct graphql data type given a recurisve felicity constructor', (done) => {

            const typeName = 'Subject';
            const config = {
                name: typeName
            };
            const joiSchema = object().keys({
                prop1: string(),
                prop2: number().integer(),
                prop3: lazy(() => joiSchema).description(typeName)
            });

            const subject = Vodou.transmuteType(joiSchema, config);

            (subject._typeConfig.fields instanceof Function).should.be.true;
            subject._typeConfig.fields().prop3.type._typeConfig.name.should.equal(typeName);
            subject.constructor.should.equal( GraphQLObjectType ); //TODO: Drawback of checking just for constructor
            done();
        });

        it('should properly construct a graphql data type given a recursive felicity constructor nested in an array', (done) => { //TODO: Update Api.MD for this use case

            const config = {
                name   : 'Cyborg',
                args   : { id: number().integer() },
                resolve: function () {}
            };
            const joiSchema = object().keys({
                name      : string(),
                age       : number().integer(),
                cyborgMods: number(),
                occupation: object().keys({
                    title: string(),
                    level: string()
                }),
                active     : boolean(),
                teamMembers: array().items(lazy(() => joiSchema).description('Cyborg')) // May not need users to specify
            });

            Vodou.transmuteType(joiSchema, config).constructor.should.equal( GraphQLObjectType );
            done();
        });
    });

    describe('.transmuteSchema()', () => {

        describe('Root Query', () => {

            it('successfully create a graphql query schema', (done) => {

                const config = { name: 'Human' };
                const Human = Vodou.transmuteType(internals.buildJoiSchema(), config);
                const schema = {
                    query: {
                        human: Human
                    }
                };

                Vodou.transmuteSchema( schema ).constructor.should.equal( GraphQLSchema );
                done();
            });

        });

        describe('Root Mutation', () => {

            it('should successfully create a graphql mutation schema', (done) => {

                const config = { name: 'Human' };
                const Human = Vodou.transmuteType(internals.buildJoiSchema(), config);
                const schema = {
                    mutation: {
                        human: Human
                    }
                };

                Vodou.transmuteSchema( schema ).constructor.should.equal( GraphQLSchema );
                done();
            });
        });

        it('should successfully create a graphql schema given a joi schema and/or graphql data type', (done) => {

            const config = { name: 'Alien' };
            const Saiyan = Vodou.transmuteType(internals.buildJoiSchema(), config);
            const schema = {
                query: {
                    human: Saiyan,
                    hello: string().meta({ resolve: () => 'world' })
                }
            };

            Vodou.transmuteSchema( schema ).constructor.should.equal( GraphQLSchema );
            done();
        });

        it('should throw when query, mutation, or subscription is not defined', (done) => {

            Vodou.transmuteSchema.bind(null, {}).should.throw();
            done();
        });

        it('should throw an error when schema is not provided', (done) => {

            Vodou.transmuteSchema.bind(null).should.throw('Must provide a schema');
            done();
        });
    });
});


internals.buildJoiSchema = () => {

    const schema = object().keys({
        name      : string(),
        age       : number().integer(),
        cyborgMods: number(),
        occupation: object().keys({
            title: string(),
            level: string()
        }),
        active      : boolean(),
        affiliations: array().items(string())
    });

    return schema;
};
