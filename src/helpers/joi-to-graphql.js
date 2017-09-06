'use strict';

const {
    GraphQLObjectType,
    GraphQLList
} = require('graphql');
const typeDictionary = require('./type-dictionary');
const Hoek           = require('hoek');
const internals      = {};
const cache          = {};
let lazyLoadQueue    = [];

module.exports = (constructor) => {
    let target;
    let compiledFields;
    const { name, args, resolve } = constructor._meta[0];

    compiledFields = internals.buildObject(constructor._inner.children);

    if (lazyLoadQueue.length) {
        target = new GraphQLObjectType({
            name,
            fields: function() {
                return compiledFields(target);
            },
            args: internals.buildArgs(args),
            resolve
        });
    } else {
        target = new GraphQLObjectType({
            name,
            fields: compiledFields(),
            args  : internals.buildArgs(args),
            resolve
        });
    }

    //console.log(target._typeConfig.fields());
    return target;
};

internals.setType = (schema) => { // Helpful for Int or Float
    if (schema._tests.length) {
        return { type: typeDictionary[schema._tests[0].name] };
    }

    return { type: typeDictionary[schema._type] };
};

internals.processLazyLoadQueue = (attrs, recursiveType) => {
    for (let i = 0, len = lazyLoadQueue.length; i < len; i++) {
        if (lazyLoadQueue[i].type === 'object') {
            attrs[lazyLoadQueue[i].key] = { type: recursiveType };
        } else {
            attrs[lazyLoadQueue[i].key] = { type: new typeDictionary[lazyLoadQueue[i].type](recursiveType) };
        }
    }

    return attrs;
};

internals.buildObject = (fields) => {
    let attrs = {};

    for (let i = 0, len = fields.length; i < len; i++) {
        let field = fields[i];
        let key = field.key;

        if (field.schema._type === 'object') {
            let Type = new GraphQLObjectType({
                name  : field.key.charAt(0).toUpperCase() + field.key.slice(1), //TODO: Is it worth bringing in lodash
                fields: internals.buildObject(fields[i].schema._inner.children)
            });

            attrs[key] = {
                type: Type
            };

            cache[key] = Type;
        }

        if (field.schema._type === 'array') {
            let Type;
            let chain = 'schema._inner.items.0._flags.lazy';

            if (Hoek.reach(field, chain)) {
                Type = field.schema._inner.items[0]._description;

                lazyLoadQueue.push({
                    key,
                    type: field.schema._type
                });
            } else {
                Hoek.assert((field.schema._inner.items.length > 0), 'Need to provide scalar type as an item when using joi array');

                Type = new GraphQLList(typeDictionary[field.schema._inner.items[0]._type]);
            }

            attrs[key] = {
                type: Type
            };

            cache[key] = Type;
        }

        if (field.schema._type === 'lazy') {
            let Type = field.schema._description;

            lazyLoadQueue.push({
                key,
                type: 'object' //TODO: Hardcoded assumption
            });

            attrs[key] = {
                type: Type
            };

            cache[key] = Type;
        }

        if (cache[key]) {
            continue; //TODO: May want to just return the cache, look into tradeoffs
        }

        attrs[key] = internals.setType(field.schema);
    }


    return function(recursiveType) {
        if (recursiveType) {
            return internals.processLazyLoadQueue(attrs, recursiveType);
        }

        return attrs;
    };
};

internals.buildArgs = (args) => {
    let argAttrs = {};

    for (let key in args ) {
        argAttrs[key] = { type: typeDictionary[args[key]._type] };
    }

    return argAttrs;
};

