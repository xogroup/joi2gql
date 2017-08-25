'use strict';

const Constructor = require('./constructor');
const Hoek = require('hoek');

const defaultOptions = {
    name: 'xo-joiql'
};

Hoek.merge(Constructor.prototype, {
    options      : defaultOptions,
    config       : require('./methods/config'),
    composeType  : require('./methods/composeType'),
    composeSchema: require('./methods/composeSchema')
});

/**
 * Export the Instance to the World
 */
module.exports = Constructor;
