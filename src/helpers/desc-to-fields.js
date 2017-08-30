'use strict';

const typeDictionary = require('./type-dictionary');
const { GraphQLObjectType, GraphQLList } = require('graphql');
const Hoek = require('hoek');

const cache = {};
let recurse = false;
let needRecursion = [];
//const internals = {}; //TODO: move cache? Return to this idea after v1, I'll have a better idea of what will be shareable and internal

const setType = (schema) => { //Right now checking for whether or not type should be an int or float
    if (schema._tests.length) {
        return { type: typeDictionary[schema._tests[0].name] };
    }
    
    return { type: typeDictionary[schema._type] };
};

const buildObject = (fields, type) => {
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

        if (fields[i].schema._type === 'array') {
            let Type;
            let chain = 'schema._inner.items.0._flags.lazy';

            if (Hoek.reach(fields[i], chain)) {
                //TODO: This all needs to be refactored to something that is
                //more readable and performant. 
                recurse = true;
                Type = true;
                needRecursion.push({
                    key: fields[i].key,
                    type: 'array'
                })
                //console.log(fields[i].schema._inner.items[0]._description);
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

        attrs[fields[i].key] = setType(fields[i].schema);
    }

    const resolveCursion = (attrs, thing) => { //TODO: needs to be refactored elsewhere
        for (let i = 0, len = needRecursion.length; i < len; i++) {
            attrs[needRecursion[i].key] = { type: new GraphQLList(thing) }; //TODO: Need to check for whether or not it is an object or list
        }
        return attrs;
    }

    return function(thing) { //TODO: The core idea here is return a function always, and check for the prescence of a defined gql schema, if so resolve, which that func will check for an array needRecursion, which will be populated above when a reference of ._lazy is found.
        if (thing) {
            return resolveCursion(attrs, thing);
        }
        return attrs;
    }
    
    //return attrs;
};

const buildArgs = (args) => {
    let argAttrs = {};

    for (let key in args ) {
        argAttrs[key] = { type: typeDictionary[args[key]._type] };
    }

    return argAttrs;
};

module.exports = (constructor) => {
    let target;
    let fields;
    let compiledFields;
    const { name, args, resolve } = constructor._meta[0];
    
    compiledFields = buildObject(constructor._inner.children);

    if (recurse) {
        target = new GraphQLObjectType({
            name,
            fields: function() {
                return compiledFields(target);
            },
            args: buildArgs(args),
            resolve
        });
    } else {
        target = new GraphQLObjectType({
            name,
            fields: compiledFields(true),
            args: buildArgs(args),
            resolve
        });
    }

    //console.log(target._typeConfig.fields()); //TODO: Use this to verify lazy
    //loaded schemas

    return target;

};

/* 
    const returnedType = new GraphQLObject({
        name,
        fields: build(returnedType, args),
        args: buildArgs,
        resolve
    })
*/
