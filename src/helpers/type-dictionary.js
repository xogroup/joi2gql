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
    number : GraphQLInt,
    float  : GraphQLFloat,
    list   : GraphQLList,
    boolean: GraphQLBoolean,
    nonNull: GraphQLNonNull //TODO: This needs to be verified
};
