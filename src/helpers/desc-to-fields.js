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

const buildArgs = (args) => {
    let argAttrs = {};

    for (let key in args ) {
        argAttrs[key] = { type: typeDictionary[args[key]._type] };
    }

    return argAttrs;
};

module.exports = (constructor) => {
    const { name, args } = constructor._meta[0]; //TODO: Do I want to change this name on meta??

    const fields = buildObject(constructor._inner.children);

    const args2 = buildArgs(args);

    return { name, fields, args: args2 };
};
