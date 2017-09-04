'use strict';

const Hoek = require('hoek');
const {
    descToFields
} = require('../helpers');

module.exports = (schema, config) => {
    config = config || { name: 'Anon' };
    const typeConstructor = schema.meta(config);

    Hoek.assert((typeConstructor._type === 'object'), 'Type needs to be an object');

    return descToFields( typeConstructor );
};
