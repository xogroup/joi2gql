'use strict';

const Promise = require('bluebird');

module.exports = function(a, b) {
    const self = this;

    return Promise
        .resolve({
            msg: self.options.msg,
            sum: a + b
        });
};