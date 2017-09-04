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
    GraphQLList
} = require('graphql');
const {
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
const CoreModule = require('../src/implementation');
let instance;

/*
Red Green RefactorA
Red: What is in a good failing test?
1. What were you testing
2. What should it do
3. What was the actual output
4. What was the expected output

R.I.T.E.
- Readable
- Isolated or Integrated
- Thorough
- Explicit

TODO: Keep the code in a unit test to a minimum
Use factory functions for test setup and tear down
All tests should not share mutable state.
*/

describe('UNIT', () => {
    it('should properly configure options', (done) => {
        instance = new CoreModule();
        instance.config({ author: 'Samuel Joli' });

        instance.options.should.deep.equal({
            name  : 'xo-joiql',
            author: 'Samuel Joli'
        });

        done();
    });

    describe('.composeType()', () => {
        it('should error when joi schema is not an object', (done) => {
            instance = new CoreModule();
            const joiSchema = string();

            instance.composeType.bind(null, joiSchema).should.throw('Type needs to be an object');
            done();
        });

        it('should create a GraphQL data type given a joi schema', (done) => {
            instance = new CoreModule();
            const config = {
                name: 'Human'
            };

            instance.composeType(internals.buildJoiSchema(), config).constructor.should.equal( GraphQLObjectType );
            done();
        });

        it('should assign name to Anon if one was not given', (done) => {
            instance = new CoreModule();
            const joiSchema = object().keys({
                name: string(),
                age : number().integer()
            });

            instance.composeType(joiSchema).name.should.equal('Anon');
            done();
        });

        it('should properly create a GraphQL data type and support string scalar types', (done) => {
            instance = new CoreModule();
            const joiSchema = object().keys({
                a: string()
            });

            instance.composeType(joiSchema)._typeConfig.fields.a.type.should.equal( GraphQLString );
            done();
        });

        it('should properly create a GraphQL data type and support id scalar types', (done) => {
            instance = new CoreModule();
            const joiSchema = object().keys({
                a: string().guid()
            });

            instance.composeType(joiSchema)._typeConfig.fields.a.type.should.equal( GraphQLID );
            done();
        });

        it('should properly create a GraphQL data type and support float scalar types', (done) => {
            instance = new CoreModule();
            const joiSchema = object().keys({
                a: number()
            });

            instance.composeType(joiSchema)._typeConfig.fields.a.type.should.equal( GraphQLFloat );
            done();
        });

        it('should properly create a GraphQL data type and support int scalar types', (done) => {
            instance = new CoreModule();
            const joiSchema = object().keys({
                a: number().integer()
            });

            instance.composeType(joiSchema)._typeConfig.fields.a.type.should.equal( GraphQLInt );
            done();
        });

        it('should properly create a GraphQL data type and support boolean scalar types', (done) => {
            instance = new CoreModule();
            const joiSchema = object().keys({
                a: boolean()
            });

            instance.composeType(joiSchema)._typeConfig.fields.a.type.should.equal( GraphQLBoolean );
            done();
        });

        it('should properly create a GraphQL data type and support list scalar types', (done) => {//TODO: Arrays need items, go down to scalar types! API.MD
            instance = new CoreModule();
            const joiSchema = object().keys({
                a: array().items(string())
            });

            instance.composeType(joiSchema)._typeConfig.fields.a.type.should.deep.equal( new GraphQLList(GraphQLString) );
            done();
        });

        it('should error when using array type without specifying a scalar type as an item', (done) => {
            instance = new CoreModule();
            const joiSchema = object().keys({
                a: array()
            });

            instance.composeType.bind(null, joiSchema).should.throw('Need to provide scalar type as an item when using joi array');
            done();
        });

        it('should create a GraphQL data type and correctly set the args', (done) => {
            instance = new CoreModule();
            const config = {
                name: 'Human',
                args: { id: number().integer() }
            };

            const expected = {
                type: typeDictionary.number
            };

            instance.composeType(internals.buildJoiSchema(), config).constructor.should.equal( GraphQLObjectType );
            instance.composeType(internals.buildJoiSchema(), config)._typeConfig.args.id.should.deep.equal(expected);
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

            const subject = instance.composeType(joiSchema, config);

            (subject._typeConfig.fields instanceof Function).should.be.true;
            subject._typeConfig.fields().prop3.type._typeConfig.name.should.equal(typeName);
            subject.constructor.should.equal( GraphQLObjectType ); //TODO: Drawback of checking just for constructor
            done();
        });

        it('should properly construct a graphql data type given a recursive felicity constructor nested in an array', (done) => { //TODO: Update Api.MD for this use case
            instance = new CoreModule();
            const config = {
                name   : 'Cyborg',
                args   : { id: number().integer() },
                resolve: function() {}
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

            instance.composeType(joiSchema, config).constructor.should.equal( GraphQLObjectType );
            done();
        });
    });

    describe('.composeSchema()', () => {
        it('successfully create a graphql schema', (done) => {
            instance = new CoreModule();
            const config = { name: 'Human' };
            const Human = instance.composeType(internals.buildJoiSchema(), config);
            const schema = {
                query: {
                    human: Human
                }
            };

            instance.composeSchema( schema ).constructor.should.equal( GraphQLSchema );
            done();
        });

        it('should successfully create a graphql schema given a joi schema and/or graphql data type', (done) => {
            instance = new CoreModule();
            const subject = new CoreModule();
            const config = { name: 'Alien' };
            const Saiyan = instance.composeType(internals.buildJoiSchema(), config);
            const schema = {
                query: {
                    human: Saiyan,
                    hello: string().meta({ resolve: () => 'world' })
                }
            };

            subject.composeSchema( schema ).constructor.should.equal( GraphQLSchema );
            done();
        });

        it('should throw when query, mutation, or subscription is not defined', (done) => {
            instance = new CoreModule();
            instance.composeSchema.bind(null, {}).should.throw();
            done();
        });

        it('should throw an error when schema is not provided', (done) => {
            instance = new CoreModule();
            instance.composeSchema.bind(null).should.throw('Must provide a schema');
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
