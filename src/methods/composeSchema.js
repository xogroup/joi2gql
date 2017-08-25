'use strict';

const {
    GraphQLObjectType,
    GraphQLSchema
} = require('graphql');

const buildFields = (obj) => {
    const attrs = {};

    for (let key in obj) {
        attrs[key] = {
            type   : obj[key],
            args   : obj[key]._typeConfig.args,
            resolve: obj[key]._typeConfig.resolve
        };
    }

    return attrs;
};

module.exports = (schema) => {
    const attrs = {};

    if (schema.query) {
        attrs.query = new GraphQLObjectType({
            name  : 'Query',
            fields: buildFields(schema.query)
        });
    }

    return new GraphQLSchema( attrs );
};
