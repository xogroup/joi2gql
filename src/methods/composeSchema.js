'use strict';

const {
    GraphQLObjectType,
    GraphQLSchema
} = require('graphql');
const Hoek = require('hoek');
const {
    typeDictionary
} = require('../helpers');
const internals = {};

module.exports = (schema) => {
    Hoek.assert((schema !== undefined), 'Must provide a schema');

    const attrs = {};

    if (schema.query) {
        attrs.query = new GraphQLObjectType({
            name  : 'Query',
            fields: internals.buildFields(schema.query)
        });
    }

    return new GraphQLSchema( attrs );
};

internals.buildFields = (obj) => {
    const attrs = {};

    for (let key in obj) {
        if (obj[key].isJoi) {
            attrs[key] = {
                type   : typeDictionary[obj[key]._type],
                resolve: obj[key]._meta.find((item) => item.resolve instanceof Function).resolve
            };
        } else {
            attrs[key] = {
                type   : obj[key],
                args   : obj[key]._typeConfig.args,
                resolve: obj[key]._typeConfig.resolve
            };
        }
    }

    return attrs;
};
