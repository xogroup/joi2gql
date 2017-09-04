'use strict';

const Lab = require('lab');
const { script, assertions } = Lab;
const lab = exports.lab = script();
const { describe, it } = lab;
assertions.should();

const {
    GraphQLObjectType,
    GraphQLSchema
} = require('graphql');
const {
    typeDictionary
} = require('../src/helpers');
const Joi      = require('joi');

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
        it('should create a GraphQL data type given a joi schema', (done) => {
            instance = new CoreModule();
            const config = {
                name: 'Human'
            };

            instance.composeType(internals.buildJoiSchema(), config).constructor.should.equal( GraphQLObjectType );
            done();
        });

        it('should create a GraphQL data type and correctly set the args', (done) => {
            instance = new CoreModule();
            const config = {
                name: 'Human',
                args: { id: Joi.number().integer() }
            };

            const expected = {
                type: typeDictionary.number
            };

            instance.composeType(internals.buildJoiSchema(), config).constructor.should.equal( GraphQLObjectType );
            instance.composeType(internals.buildJoiSchema(), config)._typeConfig.args.id.should.deep.equal(expected);
            done();
        });

        it('should error when joi schema is not an object', (done) => {
            instance = new CoreModule();
            const joiSchema = Joi.string();

            instance.composeType.bind(null, joiSchema).should.throw('Type needs to be an object');
            done();
        });

        it('should assign name to Anon if one was not given', (done) => {
            instance = new CoreModule();
            const joiSchema = Joi.object().keys({
                name: Joi.string(),
                age : Joi.number().integer()
            });

            instance.composeType(joiSchema).name.should.equal('Anon');
            done();
        });

        it('should construct graphql data type given a recurisve felicity constructor', (done) => {
            const typeName = 'Subject';
            const config = {
                name: typeName
            };
            const joiSchema = Joi.object().keys({
                prop1: Joi.string(),
                prop2: Joi.number().integer(),
                prop3: Joi.lazy(() => joiSchema).description(typeName)
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
                args   : { id: Joi.number().integer() },
                resolve: function() {}
            };
            const joiSchema = Joi.object().keys({
                name      : Joi.string(),
                age       : Joi.number().integer(),
                cyborgMods: Joi.number(),
                occupation: Joi.object().keys({
                    title: Joi.string(),
                    level: Joi.string()
                }),
                active     : Joi.boolean(),
                teamMembers: Joi.array().items(Joi.lazy(() => joiSchema).description('Cyborg')) // May not need users to specify
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
                    hello: Joi.string().meta({ resolve: () => 'world' })
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
    const schema = Joi.object().keys({
        name      : Joi.string(),
        age       : Joi.number().integer(),
        cyborgMods: Joi.number(),
        occupation: Joi.object().keys({
            title: Joi.string(),
            level: Joi.string()
        }),
        active      : Joi.boolean(),
        affiliations: Joi.array().items(Joi.string())
    });

    return schema;
};
