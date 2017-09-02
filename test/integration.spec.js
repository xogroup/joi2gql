'use strict';

const Lab = require('lab');
const { script, assertions } = Lab;
const lab = exports.lab = script();
const { describe, it } = lab;
assertions.should();

const { graphql } = require('graphql');
const Joi         = require('joi');
const Felicity    = require('felicity');

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
        instance = new CoreModule();
        const query = '{ cyborg(id: 1) { name } }';
        const graphqlSchema = instance.composeSchema( internals.buildQuerySchema() );

        return graphql( graphqlSchema, query ).then((res) => {
            res.data.cyborg.name.should.equal('Samuel Joli');
        });
    });

    it('should execute a graphql query given a Joi schema', () => {
        instance = new CoreModule();
        const graphqlSchema = instance.composeSchema({
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
        instance = new CoreModule();
        let schema; // Will be redefined in internals.buildJoiSchema
        const joiSchemaOverride = Joi.object().keys({
            teamMembers: Joi.array().items(Joi.lazy(() => schema).description('Cyborg')) //TODO: Since schema is not defined, pull back in setup
        });

        const graphqlSchema = instance.composeSchema( internals.buildQuerySchema(joiSchemaOverride) );
        const query = `
            { 
                cyborg(id: 2) { 
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
            const result = response.data.cyborg;

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

    return Felicity.entityFor(schema);
};

internals.buildQuerySchema = (schemaOverride) => {
    const config = {
        name   : 'Cyborg',
        args   : { id: Joi.number() },
        resolve: function(root, args) {
            return database[args.id];
        }
    };
    const Cyborg = instance.composeType( internals.buildJoiSchema(schemaOverride), config );
    const schema = {
        query: {
            cyborg: Cyborg
        }
    };

    return schema;
};
