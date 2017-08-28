'use strict';

const Joi = require('joi');
const Felicity = require('felicity');

const schema = Joi.object().keys({
    name      : Joi.string(),
    age       : Joi.number().integer(),
    occupation: Joi.object().keys({
        title: Joi.string(),
        level: Joi.string()
    }),
    active      : Joi.boolean(),
    affiliations: Joi.array().items(Joi.string())
});

module.exports = Felicity.entityFor(schema);

