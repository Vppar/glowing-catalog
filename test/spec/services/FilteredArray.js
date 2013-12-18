'use strict';

describe('Service: FilteredArray', function() {

    // load the service's module
    beforeEach(module('tnt.utils.array'));

    // instantiate service
    var FilteredArray = undefined;
    beforeEach(inject(function(_FilteredArray_) {
        FilteredArray = _FilteredArray_;
    }));

    // FIXME do some more tests
    it('should filter', function() {
        var sample = new FilteredArray('id', 'name', 'lala');

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
        
        expect(sample.find(5, undefined, 'd').length).toBe(1);
    });
    
    it('should filter 2', function() {
        var sample = new FilteredArray('id', 'name', 'lala');

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
        
        expect(sample.find(5, undefined, 'e').length).toBe(2);
    });

});
