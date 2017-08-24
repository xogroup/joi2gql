'use strict';

const typeDictionary = require('./type-dictionary');

module.exports = (description) => {
    const attrs = {};
    const fields = description.children;

    for (let key in fields) {
        attrs[key] = { type: typeDictionary[fields[key].type] };
    }

    return attrs;
};

