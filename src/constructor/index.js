'use strict';

const Constructor = function() {
    if (Constructor._instance) {
        return Constructor._instance;
    }

    if (!(this instanceof Constructor)) {
        return new Constructor();
    }

    Constructor._instance = this;
};

module.exports = Constructor;
