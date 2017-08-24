'use strict';

const {
    GraphQLObjectType
} = require('graphql');

const {
    descToFields
} = require('../helpers');

module.exports = (typeConstructor) => {
    let name;
    const description = typeConstructor.schema.describe();

    if (!(description.type === 'object')) {
        throw new Error('Type needs to be an object');
    }

    description.meta.forEach(function(item) { //TODO: Add meta to xodatahub
        if (item.name) {
            name = item.name;
        }
    });

    return new GraphQLObjectType({
        name,
        fields: descToFields(description) //TODO: should helper also create name?
    });
};
