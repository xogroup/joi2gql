'use strict';

const {
    GraphQLObjectType,
    GraphQLList
} = require('graphql');
const typeDictionary = require('./type-dictionary');
const Hoek           = require('hoek');
const internals      = {};
const cache          = {};
let recurse          = false;
let lazyLoadQueue    = [];

module.exports = (constructor) => {
    let target;
    let compiledFields;
    const { name, args, resolve } = constructor._meta[0];

    compiledFields = internals.buildObject(constructor._inner.children);

    if (recurse) {
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
        attrs[lazyLoadQueue[i].key] = { type: new typeDictionary[lazyLoadQueue[i].type](recursiveType) };
    }

    return attrs;
};

internals.buildObject = (fields) => {
    let attrs = {};

    for (let i = 0, len = fields.length; i < len; i++) {
        if (fields[i].schema._type === 'object') {
            let key = fields[i].key;

            let Type = new GraphQLObjectType({
                name  : key.charAt(0).toUpperCase() + key.slice(1), //TODO: Is it worth bringing in lodash
                fields: internals.buildObject(fields[i].schema._inner.children)
            });

            attrs[fields[i].key] = {
                type: Type
            };

            cache[fields[i].key] = Type;
        }

        if (fields[i].schema._type === 'array') {
            let Type;
            let chain = 'schema._inner.items.0._flags.lazy';

            if (Hoek.reach(fields[i], chain)) {
                recurse = true; //Indicates that this a type that needs to be lazy loaded
                Type = fields[i].schema._inner.items[0]._description;

                lazyLoadQueue.push({
                    key : fields[i].key,
                    type: fields[i].schema._type
                });
            } else {
                Type = new GraphQLList(typeDictionary[fields[i].schema._inner.items[0]._type]);
            }

            attrs[fields[i].key] = {
                type: Type
            };

            cache[fields[i].key] = Type;
        }

        if (cache[fields[i].key]) {
            continue; //TODO: May want to just return the cache, look into tradeoffs
        }

        attrs[fields[i].key] = internals.setType(fields[i].schema);
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

