'use strict';

const Hoek = require('hoek');

const {
    GraphQLObjectType
} = require('graphql');

const {
    descToFields
} = require('../helpers');

module.exports = (constructor, config) => {
    //TODO: If a constructor has recurse, advise to add that in the meta
    config = config || { name: 'Anon' };
    const typeConstructor = constructor.schema.meta(config);

    Hoek.assert((typeConstructor._type === 'object'), 'Type needs to be an object');

    //return new GraphQLObjectType( descToFields(typeConstructor) );
    return descToFields( typeConstructor );
};
