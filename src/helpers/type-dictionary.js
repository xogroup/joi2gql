'use strict';

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLFloat,
    GraphQLInt,
    GraphQLList,
    GraphQLBoolean,
    GraphQLNonNull
} = require('graphql');

module.exports = {
    object : GraphQLObjectType,
    string : GraphQLString,
    integer: GraphQLInt,
    number : GraphQLFloat,
    array  : GraphQLList,
    boolean: GraphQLBoolean,
    nonNull: GraphQLNonNull //TODO: This needs to be verified
};

