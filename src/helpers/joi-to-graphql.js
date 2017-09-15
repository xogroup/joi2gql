'use strict';

const {
    GraphQLObjectType,
    GraphQLList
} = require('graphql');
const typeDictionary = require('./type-dictionary');
const Hoek           = require('hoek');
const internals      = {};
let cache            = {};
let lazyLoadQueue    = [];

module.exports = (constructor) => {
    let target;
    let compiledFields;
    const { name, args, resolve, description } = constructor._meta[0];

    compiledFields = internals.buildFields(constructor._inner.children);

    if (lazyLoadQueue.length) {
        target = new GraphQLObjectType({
            name,
            description,
            fields: function() {
                return compiledFields(target);
            },
            args: internals.buildArgs(args),
            resolve
        });
    } else {
        target = new GraphQLObjectType({
            name,
            description,
            fields: compiledFields(),
            args  : internals.buildArgs(args),
            resolve
        });
    }

    return target;
};

internals.buildEnumFields = (values) => {
    let attrs = {};

    for (let i = 0, len = values.length; i < len; i++) {
        attrs[values[i].value] = { value: values[i].derivedFrom };
    }

    return attrs;
};

internals.setType = (schema) => { // Helpful for Int or Float
    if (schema._tests.length) {
        if (schema._flags.presence) {
            return { type: new typeDictionary.required(typeDictionary[schema._tests[0].name]) };
        }

        return { type: typeDictionary[schema._tests[0].name] };
    }

    if (schema._flags.presence === 'required') {
        return { type: new typeDictionary.required(typeDictionary[schema._type]) };
    }

    if (schema._flags.allowOnly) { // GraphQLEnumType
        let name = Hoek.reach(schema, '_meta.0.name') || 'Anon';

        const config = {
            name,
            values: internals.buildEnumFields(schema._valids._set)
        };

        return { type: new typeDictionary.enum(config) };
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

internals.buildFields = (fields) => {
    let attrs = {};

    for (let i = 0, len = fields.length; i < len; i++) {
        let field = fields[i];
        let key = field.key;

        if (field.schema._type === 'object') {
            let Type = new GraphQLObjectType({
                name  : field.key.charAt(0).toUpperCase() + field.key.slice(1),
                fields: internals.buildFields(field.schema._inner.children)
            });

            attrs[key] = {
                type: Type
            };

            cache[key] = Type;
        }

        if (field.schema._type === 'array') {
            let Type;
            let pathToMethod = 'schema._inner.items.0._flags.lazy';

            if (Hoek.reach(field, pathToMethod)) {
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

    cache = Object.create(null); //Empty cache

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

