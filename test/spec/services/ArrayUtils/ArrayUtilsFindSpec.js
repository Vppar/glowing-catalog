'use strict';

describe('Service: ArrayUtils', function() {

    // load the service's module
    beforeEach(module('tnt.utils.array'));

    // instantiate service
    var ArrayUtils = undefined;
    beforeEach(inject(function(_ArrayUtils_) {
        ArrayUtils = _ArrayUtils_;
    }));
    
    it('should find without duplicated', function() {
        // given
        var expected = {
            property : 'valor',
            property1 : 'etc1',
            property2 : 'etc22'
        };
        var array = [{
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
        // when
        var response = ArrayUtils.find(array, property, value);
        // then
        expect(expected).toEqual(response);

    });
    
    //FIXME
    xit('should find with array', function() {
        // given
        
        var array = [{
            property : ['valor', 'hello'],
            property1 : ['etc1'],
            property2 : ['etc22']
        }, {
            property : ['valor'],
            property1 : ['valor1'],
            property2 : ['valor2']
        }];
        var property = 'property';
        var value = ['valor'];
        // when
        var response = ArrayUtils.find(array, property, value);
        
        console.log('ArrayUtilsFindSpec_should find with array: ');
        console.log(response);
        // then
        expect(response.lenght>0).toBe(true);

    });
    
    it('should find with numbers', function() {
        var expected = {
                property : 4,
                property1 : 5,
                property2 : 6
            };
        
        var array = [{
            property : 1,
            property1 : 2,
            property2 : 3
        }, {
            property : 4,
            property1 : 5,
            property2 : 6
        }];
        var property = 'property';
        var value = 4;
        var response = ArrayUtils.find(array, property, value);
        
        expect(response).toEqual(expected);

    });
    
    //FIXME
    xit('should find with object', function() {
        var expected = {
                property :{a:'a'} ,
                property1 :{b:'b'} ,
                property2 :{c:'c'}
            };
        
        var array = [{
            property :{a:'a'} ,
            property1 :{b:'b'} ,
            property2 :{c:'c'}
        }, {
            property :{e:'e'} ,
            property1 :{f:'f'} ,
            property2 :{u:'u'}
        }];
        var property = 'property';
        var value = {a:'a'};
        var response = ArrayUtils.find(array, property, value);
        
        console.log('ArrayUtilsFindSpec_should find with object: ');
        console.log(response);
        
        expect(response).toEqual(expected);

    });
    
    it('should not find, invalid array', function() {
        // given
        var array = [];
        var property = 'property';
        var value = 'valor';
        // when
        var response = ArrayUtils.find(array, property, value);
        // then
        expect(response).toBeNull;

    });
    
    it('should not find, invalid property', function() {
        // given
        var array = [{
            property : 'valor',
            property1 : 'etc1',
            property2 : 'etc22'
        }, {
            property : 'valor0',
            property1 : 'valor1',
            property2 : 'valor2'
        }];
        var property = 'proper';
        var value = 'valor';
        // when
        var response = ArrayUtils.find(array, property, value);
        // then
        expect(response).toBeNull;

    });
    
    it('should not find, invalid value', function() {
        // given
        var array = [{
            property : 'valor',
            property1 : 'etc1',
            property2 : 'etc22'
        }, {
            property : 'valor0',
            property1 : 'valor1',
            property2 : 'valor2'
        }];
        var property = 'property';
        var value = 'valor0000';
        // when
        var response = ArrayUtils.find(array, property, value);
        // then
        expect(response).toBeNull;

    });

    it('should not find, invalid value', function() {
        // given
        var array = [{
            property : 'valor',
            property1 : 'etc1',
            property2 : 'etc22'
        }, {
            property : 'valor0',
            property1 : 'valor1',
            property2 : 'valor2'
        }];
        var property = 'property';
        var value = 'valor0000';
        // when
        var response = ArrayUtils.find(array, property, value);
        // then
        expect(response).toBeNull;

    });

    it('should throw', function() {
        // given
        var array = [{
            property : 'valor',
            property1 : 'etc1',
            property2 : 'etc22'
        }, {
            property : 'valor',
            property1 : 'valor1',
            property2 : 'valor2'
        }];
        var property = 'property';
        var value = 'valor';
        // then
        expect(function(){ArrayUtils.find(array, property, value);}).toThrow();
    });

});
