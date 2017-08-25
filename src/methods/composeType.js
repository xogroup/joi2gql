'use strict';

const {
    GraphQLObjectType
} = require('graphql');

const {
    descToFields
} = require('../helpers');

module.exports = (constructor, config) => {
    config = config || { name: 'Anon' };
    const typeConstructor = constructor.schema.meta(config);

    if (!(typeConstructor._type === 'object')) {
        throw new Error('Type needs to be an object');
    }

    return new GraphQLObjectType(
        descToFields(typeConstructor)
    );
};
