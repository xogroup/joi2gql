'use strict';

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLFloat,
    GraphQLInt,
    GraphQLList,
    GraphQLBoolean,
    GraphQLNonNull
} = require('graphql');

module.exports = {
    object : GraphQLObjectType,
    string : GraphQLString,
    guid   : GraphQLID,
    integer: GraphQLInt,
    number : GraphQLFloat,
    array  : GraphQLList,
    boolean: GraphQLBoolean,
    nonNull: GraphQLNonNull //TODO: This needs to be verified
};

