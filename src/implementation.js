'use strict';

const singleton = require('nc-singleton');
const Hoek      = require('hoek');

const defaultOptions = {
    msg: 'hey'
};

const Plugin = function Plugin() {
    this.options = defaultOptions;

    return singleton.call(this, Plugin);
};

Hoek.merge(Plugin.prototype, {
    config: require('./methods/config'),
    sayHey: require('./methods/say-hey')
});

/**
 * Export the Instance to the World
 */
module.exports = Plugin;