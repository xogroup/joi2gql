'use strict';

const Lab = require('lab');
const { script, assertions } = Lab;
const lab = exports.lab = script();
const { describe, it } = lab;
assertions.should();

const {
    graphql
} = require('graphql');
const Joi = require('joi');

const internals  = {};
const Vodou = require('../src/implementation');

const database = {
    1: {
        a: 'xo group'
    },
    2: {
        a: 'string',
        b: 0,
        c: 0.1,
        d: {
            key1: 'string',
            key2: 'string'
        },
        experiment: ['Experiment'],
        e: true,
        collection: [
            {
                prop1: 'string',
                prop2: 46,
                prop3: 25.6
            }
        ]
    }
};

describe('INTEGRATION', () => {

    describe('Query', () => {

        it('should execute a graphql query given a converted schema', () => {

            const query = '{ subject(id: 1) { a } }';
            const graphqlSchema = Vodou.transmuteSchema( internals.buildQuerySchema() );

            return graphql( graphqlSchema, query ).then((res) => {

                res.data.subject.a.should.equal('xo group');
            });
        });

        it('should execute a graphql query when schema is given a Joi schema', () => {

            const graphqlSchema = Vodou.transmuteSchema({
                query: {
                    hello: Joi.string().meta({ resolve: () => 'world' })
                }
            });
            const query = '{ hello }';

            return graphql( graphqlSchema, query ).then((res) => {

                res.data.hello.should.equal('world');
            });
        });

        it('should execute a graphql query given a complex joi schema', () => {

            let schema;
            const joiSchemaOverride = Joi.object().keys({
                teamMembers: Joi.array().items(Joi.lazy(() => schema).description('Cyborg'));
            });

            const graphqlSchema = Vodou.transmuteSchema( internals.buildQuerySchema(joiSchemaOverride) );
            const query = `
                { 
                    subject(id: 2) {
                        a
                        b
                        c
                        d {
                            key1
                            key2
                        }
                        e
                        experiment
                        collection {
                            prop1
                            prop2
                            prop3
                        }
                    } 
                }
            `;

            return graphql( graphqlSchema, query ).then((response) => {

                const result = response.data.subject;

                result.a.should.equal('string'); //String
                result.b.should.equal(0); //Int
                result.c.should.equal(0.1); //Float
                result.d.key1.should.equal('string'); //Object
                result.e.should.equal(true);
                result.experiment.should.deep.equal(['Experiment']);
                //result.collection.should
            });
        });
    });

    describe('Mutation', () => {

        it('should execute a graphql mutation given a GraphQL data type', () => {

            const query = `
                {
                    inject( id: 2, item: { prop1: "string", prop2: 27, prop3: 4 }) {
                        a
                        collection {
                            prop1
                            prop2
                            prop3
                        }
                    }
                }
            `;
            const expected = {
                prop1: 'string',
                prop2: 27,
                prop3: 4
            };
            const graphqlSchema = Vodou.transmuteSchema( internals.buildMutationSchema() );

            return graphql( graphqlSchema, query ).then((res) => {

                const result = res.data.inject.collection[1];

                result.prop1.should.equal(expected.prop1);
                result.prop2.should.equal(expected.prop2);
                result.prop3.should.equal(expected.prop3);
            });
        });
    });
});

internals.buildJoiSchema = (args) => {

    let schema = Joi.object().keys({
        a: Joi.string(),
        b: Joi.number().integer(),
        c: Joi.number(),
        d: Joi.object().keys({
            key1: Joi.string(),
            key2: Joi.string()
        }),
        e: Joi.boolean(),
        experiment: Joi.array().items(Joi.string()),
        collection: Joi.array().items(Joi.object().keys({
            prop1: Joi.string(),
            prop2: Joi.number().integer(),
            prop3: Joi.number()
        }).meta({ name: 'collection' }))
    });

    if (args) {
        schema = schema.concat(args);
    }

    return schema;
};

internals.buildQuerySchema = (schemaOverride) => {

    const config = {
        name   : 'Subject',
        args   : { id: Joi.number() },
        resolve: function (root, args) {

            return database[args.id];
        }
    };
    const Subject = Vodou.transmuteType( internals.buildJoiSchema(schemaOverride), config );
    const schema = {
        query: {
            subject: Subject
        }
    };

    return schema;
};

internals.buildMutationSchema = (schemaOverride) => {

    const dataInjectionType = Joi.object().keys({
        prop1: Joi.string(),
        prop2: Joi.number().integer(),
        prop3: Joi.number()
    });

    const config = {
        name   : 'Subject',
        args   : { id: Joi.number(), item: dataInjectionType },
        resolve: function (root, args) {

            database[args.id].collection.push(args.item);
            return database[args.id];
        }
    };

    const Subject = Vodou.transmuteType( internals.buildJoiSchema(schemaOverride), config );
    const schema = {
        mutation: {
            inject: Subject
        }
    };

    return schema;
};
