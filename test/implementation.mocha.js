'use strict';

const CoreModule = require('../src/implementation');
const options = require('./mocks/options');
let instance;

describe('INSTANCE ', function() {
    before(function(done) {
        instance = new CoreModule();
        instance.config(options);
        done();
    });

    it('should response with sum == 5 and msg == `hey`', function() {
        return instance
            .sayHey(1, 4)
            .then(function(result) {
                result.sum.should.be.equal(5);
                result.msg.should.be.equal('hey');
            });
    });
});
