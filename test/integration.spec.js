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
        name: 'Samuel Joli'
    },
    2: {
        name      : 'Motoko Kusanagi',
        age       : 31,
        cyborgMods: 90.9,
        occupation: {
            title: 'Military Officer',
            level: 'Major'
        },
        active      : true,
        affiliations: ['Section 9'],
        teamMembers : [
            {
                name     : 'Saito',
                age      : 46,
                cyborgMod: 25.6
            }
        ]
    }
};

describe('INTEGRATION', () => {

    it('should execute a graphql query given a GraphQL data type', () => {

        const query = '{ test(id: 1) { name } }';
        const graphqlSchema = Vodou.transmuteSchema( internals.buildQuerySchema() );

        return graphql( graphqlSchema, query ).then((res) => {

            res.data.test.name.should.equal('Samuel Joli');
        });
    });

    it('should execute a graphql query given a Joi schema', () => {

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

        let schema; // Will be redefined in internals.buildJoiSchema
        const joiSchemaOverride = Joi.object().keys({
            teamMembers: Joi.array().items(Joi.lazy(() => schema).description('Cyborg')) //TODO: Since schema is not defined, pull back in setup
        });

        const graphqlSchema = Vodou.transmuteSchema( internals.buildQuerySchema(joiSchemaOverride) );
        const query = `
            { 
                test(id: 2) {
                    name
                    age
                    cyborgMods
                    occupation { 
                        title
                        level 
                    } 
                    active 
                    affiliations
                    teamMembers {
                        name
                        age
                    }
                } 
             }
        `;

        return graphql( graphqlSchema, query ).then((response) => {

            const result = response.data.test;

            result.name.should.equal('Motoko Kusanagi'); //String
            result.age.should.equal(31); //Int
            result.cyborgMods.should.equal(90.9); //Float
            result.occupation.title.should.equal('Military Officer'); //Object
            result.occupation.level.should.equal('Major');
            result.active.should.equal(true);
            result.affiliations.should.deep.equal(['Section 9']); //List
            result.teamMembers[0].name.should.equal('Saito');
        });
    });
});

internals.buildJoiSchema = (args) => {

    let schema = Joi.object().keys({
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

    if (args) {
        schema = schema.concat(args);
    }

    return schema;
};

internals.buildQuerySchema = (schemaOverride) => {

    const config = {
        name   : 'Test',
        args   : { id: Joi.number() },
        resolve: function (root, args) {

            return database[args.id];
        }
    };
    const Test = Vodou.transmuteType( internals.buildJoiSchema(schemaOverride), config );
    const schema = {
        query: {
            test: Test
        }
    };

    return schema;
};
