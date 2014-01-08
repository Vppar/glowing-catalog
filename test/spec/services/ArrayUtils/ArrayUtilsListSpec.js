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
    
    it('should not list', function() {
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
    
    it('should not list 2', function() {
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
        
        expect(ArrayUtils.list(sample, 'lala', 'gzusomg').length).toBe(0);
    });
    
    it('should list ', function() {
        var expected = [
            {
                property : 'valor',
                property1 : 'etc1',
                property2 : 'etc22'
            }
        ];
        var array = [
           {
            property : 'valor',
            property1 : 'etc1',
            property2 : 'etc22'
        }, {
            property : 'valor0',
            property1 : 'valor1',
            property2 : 'valor2'
        }];
        
        var property = 'property';
        
        var value = 'valor';
        
        var response = ArrayUtils.list(array, property, value);

        expect(expected).toEqual(response);
    });
    
    it('should list with numbers', function() {
        var sample = [];

        sample.push({
            id : 5,
            name : 1,
            lala : 2
        }, {
            id : 5,
            name : 3,
            lala : 6
        }, {
            id : 5,
            name : 5,
            lala : 6
        });
        
        expect(ArrayUtils.list(sample, 'lala', 6).length).toBe(2);
    });
    
    //FIXME
    xit('should list with objects', function() {
        var sample = [];

        sample.push({
            id : 5,
            name : {a:'a'},
            lala : {b:'b'}
        }, {
            id : 5,
            name : {c:'c'},
            lala : {e:'e'}
        }, {
            id : 5,
            name : {g:'g'},
            lala : {p:'p'}
        });
        
        console.log(ArrayUtils.list(sample, 'lala', {p:'p'}));
        
        expect(ArrayUtils.list(sample, 'lala', {p:'p'}).length).toBe(1);
    });
    
    //FIXME
    xit('should list with arrays', function() {
        var sample = [];

        sample.push({
            id : 5,
            name : ['a','b'],
            lala : ['c','d']
        }, {
            id : 5,
            name : ['c','d'],
            lala : ['e','g']
        }, {
            id : 5,
            name : ['r','f'],
            lala : ['o','i']
        });
        
        console.log(ArrayUtils.list(sample, 'lala', ['o','i']));
        
        expect(ArrayUtils.list(sample, 'lala', ['o','i']).length).toBe(1);
    });

});
