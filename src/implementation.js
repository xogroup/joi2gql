'use strict';

const Constructor = require('./constructor');
const Hoek = require('hoek');

const defaultOptions = {
    name: 'xo-joiql'
};

Hoek.merge(Constructor.prototype, {
    options: defaultOptions,
    config : require('./methods/config'),
    compose: require('./methods/compose')
});

/**
 * Export the Instance to the World
 */
module.exports = Constructor;
