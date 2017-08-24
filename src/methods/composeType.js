'use strict';

const {
    GraphQLObjectType
} = require('graphql');

const {
    descToFields
} = require('../helpers');

module.exports = (constructor, config) => {
    /*
        TODO: Recursive types, nested objects.
    */
    const typeConstructor = constructor.schema.meta(config);
    let name = 'Anon';

    if (!(typeConstructor._type === 'object')) {
        throw new Error('Type needs to be an object');
    }

    typeConstructor._meta.forEach(function(item) {
        if (item.name) {
            name = item.name;
        }
    });

    return new GraphQLObjectType({
        name,
        fields: descToFields(typeConstructor) //TODO: should helper also create name?
    });
};
