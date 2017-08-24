'use strict';


const Lab = require('lab');
const { script, assertions } = Lab;
const lab = exports.lab = script();
const { describe, it } = lab;
assertions.should();

const Human = require('./mocks/document');
const { GraphQLObjectType } = require('graphql');

const CoreModule = require('../src/implementation');
let instance;

describe('INSTANCE ', function() {
    instance = new CoreModule();

    it('should properly configure options', (done) => {
        instance.config({ author: 'Samuel Joli' });

        instance.options.should.deep.equal({
            name  : 'felicity-ql',
            author: 'Samuel Joli'
        });

        done();
    });

    it('should create GraphQL data type given a felicity constructor', (done) => {
        instance.compose(Human)
        .constructor.should.equal(GraphQLObjectType);
        done();
    });
});
