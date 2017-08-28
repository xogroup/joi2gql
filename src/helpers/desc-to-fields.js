'use strict';

const typeDictionary = require('./type-dictionary');
const { GraphQLObjectType } = require('graphql');

const cache = {};
//const internals = {}; //TODO: move cache? Return to this idea after v1, I'll have a better idea of what will be shareable and internal

const setType = (schema) => { //Right now checking for whether or not type should be an int or float
    if (schema._tests.length) {
        return { type: typeDictionary[schema._tests[0].name] };
    }

    return { type: typeDictionary[schema._type] };
};

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
            continue; //TODO: May want to just return the cache, look into tradeoffs
        }

        attrs[fields[i].key] = setType(fields[i].schema);
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
    const { name, args, resolve } = constructor._meta[0]; //TODO: Do I want to change this name on meta??

    return {
        name,
        fields: buildObject(constructor._inner.children),
        args  : buildArgs(args),
        resolve
    };
};
