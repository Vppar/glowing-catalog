'use strict';

describe('Service: ArrayUtils', function() {

    // load the service's module
    beforeEach(module('tnt.utils.array'));

    // instantiate service
    var ArrayUtils = undefined;
    beforeEach(inject(function(_ArrayUtils_) {
        ArrayUtils = _ArrayUtils_;
    }));

    // FIXME do some more tests
    it('should list', function() {
        var sample = [];

        sample.push({
            id : 5,
            name : 'a',
            lala : 'd'
        }, {
            id : 5,
            name : 'b',
            lala : 'e'
        }, {
            id : 5,
            name : 'c',
            lala : 'e'
        });
        
        expect(ArrayUtils.list(sample, 'lala', 'd').length).toBe(1);
    });
    
    it('should list 2', function() {
        var sample = [];

        sample.push({
            id : 5,
            name : 'a',
            lala : 'd'
        }, {
            id : 5,
            name : 'b',
            lala : 'e'
        }, {
            id : 5,
            name : 'c',
            lala : 'e'
        });
        
        expect(ArrayUtils.list(sample, 'lala', 'e').length).toBe(2);
    });
    
    it('should list 3', function() {
        var sample = [];

        sample.push({
            id : 5,
            name : 'a',
            lala : 'd'
        }, {
            id : 5,
            name : 'b',
            lala : 'e'
        }, {
            id : 5,
            name : 'c',
            lala : 'e'
        });
        
        expect(ArrayUtils.list(sample, 'bazinga', 'e').length).toBe(0);
    });

});
