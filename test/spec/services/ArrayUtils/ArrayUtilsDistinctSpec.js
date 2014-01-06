'use strict';

describe('Service: ArrayUtils', function() {

    // load the service's module
    beforeEach(module('tnt.utils.array'));

    // instantiate service
    var ArrayUtils = undefined;
    beforeEach(inject(function(_ArrayUtils_) {
        ArrayUtils = _ArrayUtils_;
    }));

    it('should list with string', function() {
        // given
   
        var expected = [
            'valor', 'valor2'
        ];

        var array = [{
            property : 'valor',
            property1 : 'etc1',
            property2 : 'etc22'
        }, {
            property : 'valor',
            property1 : 'valor1',
            property2 : 'valor2'
        }, {
            property : 'valor',
            property1 : 'valor1',
            property2 : 'valor'
        }, {
            property : 'valor2',
            property1 : 'valor',
            property2 : 'valor2'
        }];
        var property = 'property';
        
        //when
        var response = ArrayUtils.distinct(array, property);
        
        //then
        expect(expected).toEqual(response);

    });
    
    it('should list with array', function() {
        // given
        var expected = [
            'valor', 'valor2'
        ];

        var array = [{
            property : 'valor',
            property1 : 'etc1',
            property2 : 'etc22'
        }, {
            property : 'valor',
            property1 : 'valor1',
            property2 : 'valor2'
        }, {
            property : 'valor',
            property1 : 'valor1',
            property2 : 'valor'
        }, {
            property : 'valor2',
            property1 : 'valor',
            property2 : 'valor2'
        }];
        var property = ['property'];
        
        //when
        var response = ArrayUtils.distinct(array, property);
        
        //then
        expect(expected).toEqual(response);

    });
    
    it('should not list', function() {
        // given
        var array = [{
            property : 'valor',
            property1 : 'etc1',
            property2 : 'etc22'
        }, {
            property : 'valor',
            property1 : 'valor1',
            property2 : 'valor2'
        }, {
            property : 'valor',
            property1 : 'valor1',
            property2 : 'valor'
        }, {
            property : 'valor2',
            property1 : 'valor',
            property2 : 'valor2'
        }];
        var property = 'property3';
        
        //when
        var response = ArrayUtils.distinct(array, property);
        
        //then
        expect(response).toBeNull;

    });

});