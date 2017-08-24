'use strict';

const Joi = require('joi');
const Felicity = require('felicity');

const schema = Joi.object().keys({
    name      : Joi.string(),
    age       : Joi.number(),
    occupation: Joi.object().keys({
        title: Joi.string(),
        level: Joi.string()
    })
}).meta({
    name: 'Human'
});

module.exports = Felicity.entityFor(schema);

