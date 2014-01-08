'use strict';

describe('Service: ArrayUtils', function() {

    // load the service's module
    beforeEach(module('tnt.utils.array'));

    // instantiate service
    var ArrayUtils = undefined;
    beforeEach(inject(function(_ArrayUtils_) {
        ArrayUtils = _ArrayUtils_;
    }));

    it('should filter', function() {
        var sample = [{
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
        }];

        expect(ArrayUtils.filter(sample, {
            id : 5,
            lala : 'd'
        }).length).toBe(1);
    });

    it('should filter 2', function() {
        var sample = [{
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
        }];

        expect(ArrayUtils.filter(sample, {
            id : 5,
            lala : 'e'
        }).length).toBe(2);
    });
    
    it('should filter 0', function() {
        var sample = [{
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
        }];

        expect(ArrayUtils.filter(sample, {
            id : 7,
            lala : 'f'
        }).length).toBe(0);
    });
    
    it('should filter with numbers', function() {
        var sample = [{
            id : 5,
            name : 1,
            lala : 2
        }, {
            id : 5,
            name : 3,
            lala : 4
        }, {
            id : 5,
            name : 5,
            lala : 6
        }];

        expect(ArrayUtils.filter(sample, {
            id : 5,
            lala : 6
        }).length).toBe(1);
    });
    
    //FIXME 
    xit('should filter with arrays', function() {
        var sample = [{
            id : 5,
            name : ['a','b'],
            lala : ['d','dd']
        }, {
            id : 5,
            name : ['b','c'],
            lala : ['f','g']
        }, {
            id : 5,
            name : ['j','p'],
            lala : ['e','j']
        }];
        
        var response = ArrayUtils.filter(sample, {
            id : 5,
            lala : ['f','g']
        });
        
        console.log(response);
        
        expect(response.length).toBe(1);
    });
    
    //FIXME
    xit('should filter with objects', function() {
        var sample = [{
            id : 5,
            name : {x:'x'},
            lala : {g:'g'}
        }, {
            id : 5,
            name : {c:'c'},
            lala : {e:'e'}
        }, {
            id : 5,
            name : {b:'b'},
            lala : {y:'y'}
        }];
        
        var response = ArrayUtils.filter(sample, {
            id : 5,
            lala : {y:'y'}
        });
        
        console.log(response);
        
        expect(response.length).toBe(1);
    });
});
