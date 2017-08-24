'use strict';

const typeDictionary = require('./type-dictionary');
const { GraphQLObjectType } = require('graphql');

const cache = {};

const buildObject = (fields) => {
    let attrs = {};

    for (let i = 0, len = fields.length; i < len; i++) {
        if (fields[i].schema._type === 'object') {
            let key = fields[i].key;

            let Type = new GraphQLObjectType({
                name  : key.charAt(0).toUpperCase() + key.slice(1), //TODO: Is it worth bringing in lodash
                fields: buildObject(fields[i].schema._inner.children)
            });

            attrs[fields[i].key] = {
                type: Type
            };

            cache[fields[i].key] = Type;
        }

        if (cache[fields[i].key]) {
            continue;
        }

        attrs[fields[i].key] = { type: typeDictionary[fields[i].schema._type] };
    }

    return attrs;
};

module.exports = (constructor) => {
    const fields = constructor._inner.children;

    return buildObject(fields);
};
