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
    1: 'Samuel Joli'
};

describe('INTEGRATION', () => {
    instance = new CoreModule();

    it('should execute a graphql query', () => {
        const config = {
            name   : 'Human',
            args   : { id: Joi.number() }, //TODO: The args need to be defined at the query level otherwise this data will exist both on data type and query type with current implementation
            resolve: function(root, args) {
                return {
                    name: humans[args.id]
                };
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
});
