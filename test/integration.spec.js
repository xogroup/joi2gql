'use strict';

const Lab = require('lab');
const { script, assertions } = Lab;
const lab = exports.lab = script();
const { describe, it } = lab;
assertions.should();

const Document = require('./mocks/document');
const { graphql } = require('graphql');
const Joi = require('joi');

const CoreModule = require('../src/implementation');
let instance;

const humans = {
    1: {
        name: 'Samuel Joli'
    },
    2: {
        name      : 'Motoko Kusanagi',
        age       : 31,
        occupation: {
            title: 'Military Officer',
            level: 'Major'
        },
        active      : true,
        affiliations: ['Section 9']
    }
};

describe('INTEGRATION', () => {
    instance = new CoreModule();

    it('should execute a graphql query given a GraphQL data type', () => {
        const config = {
            name   : 'Human',
            args   : { id: Joi.number() },
            resolve: function(root, args) {
                return humans[args.id];
            }
        };
        const Human = instance.composeType(Document, config);

        const schema = {
            query: {
                human: Human
            }
        };

        const query = '{ human(id: 1) { name } }';
        const graphqlSchema = instance.composeSchema(schema);

        return graphql( graphqlSchema, query ).then((res) => {
            res.data.human.name.should.equal('Samuel Joli');
        });
    });

    it('should execute a graphql query given a Joi schema', () => {
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

    it('should exec', () => {
        const config = {
            name   : 'Cyborg',
            args   : { id: Joi.number().integer() },
            resolve: function(root, args) {
                return humans[args.id];
            }
        };
        const Cyborg = instance.composeType(Document, config);
        const schema = {
            query: {
                cyborg: Cyborg
            }
        };
        const graphqlSchema = instance.composeSchema( schema );
        const query = `
            { 
                cyborg(id: 2) { 
                    name
                    age
                    occupation { 
                        title
                        level 
                    } 
                    active 
                    affiliations
                } 
             }
        `;

        return graphql( graphqlSchema, query ).then((response) => {
            console.log(response);
            const result = response.data.cyborg;

            result.name.should.equal('Motoko Kusanagi');
            result.age.should.equal(31);
            result.occupation.title.should.equal('Military Officer');
            result.occupation.level.should.equal('Major');
            result.active.should.equal(true);
            result.affiliations.should.deep.equal(['Section 9']);
        });
    });
});
