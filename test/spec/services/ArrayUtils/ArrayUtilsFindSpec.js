'use strict';

describe('Service: ArrayUtils', function() {

    // load the service's module
    beforeEach(module('tnt.utils.array'));

    // instantiate service
    var ArrayUtils = undefined;
    beforeEach(inject(function(_ArrayUtils_) {
        ArrayUtils = _ArrayUtils_;
    }));

    it('should find', function() {
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

    it('should not find', function() {
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
