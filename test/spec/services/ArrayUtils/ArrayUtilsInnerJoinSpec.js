'use strict';

describe('Service: ArrayUtils', function() {

    // load the service's module
    beforeEach(module('tnt.utils.array'));

    // instantiate service
    var ArrayUtils = undefined;
    beforeEach(inject(function(_ArrayUtils_) {
        ArrayUtils = _ArrayUtils_;
    }));

    it('should inner join', function() {
        // given
        var array1 = [{
            property : 'valor',
            property1 : 'etc1',
            property2 : 'etc22'
        }, {
            property : 'valor2',
            property1 : 'valor1',
            property2 : 'valor2'
        }, {
            property : 'valor2',
            property1 : 'valor1',
            property2 : 'valor'
        }, {
            property : 'valoru',
            property1 : 'valor',
            property2 : 'valor2'
        }];

        var array2 = [{
            property : 'valor',
            property3 : 'lala1',
            property4 : 'lala2'
        }, {
            property : 'valory',
            property3 : 'valor6',
            property4 : 'valor7'
        }, {
            property : 'valor8',
            property3 : 'valor9',
            property4 : 'valor0'
        }, {
            property : 'valor1',
            property3 : 'valor2',
            property4 : 'valor3'
        }];
        var property = 'property';

        var expected = [
            {
                property : 'valor',
                property1 : 'etc1',
                property2 : 'etc22',
                property3 : 'lala1',
                property4 : 'lala2'
            }
        ];

        // when
        var response = ArrayUtils.innerJoin(array1, array2, property);
        // then
        expect(expected).toEqual(response);

    });
    
    it('should not join no matches', function() {
        // given
        var array1 = [{
            property : 'valorv',
            property1 : 'etc1',
            property2 : 'etc22'
        }, {
            property : 'valor2',
            property1 : 'valor1',
            property2 : 'valor2'
        }, {
            property : 'valor2',
            property1 : 'valor1',
            property2 : 'valor'
        }, {
            property : 'valoru',
            property1 : 'valor',
            property2 : 'valor2'
        }];

        var array2 = [{
            property : 'valor',
            property3 : 'lala1',
            property4 : 'lala2'
        }, {
            property : 'valory',
            property3 : 'valor6',
            property4 : 'valor7'
        }, {
            property : 'valor8',
            property3 : 'valor9',
            property4 : 'valor0'
        }, {
            property : 'valor1',
            property3 : 'valor2',
            property4 : 'valor3'
        }];
        var property = 'property';

        var expected = [];

        // when
        var response = ArrayUtils.innerJoin(array1, array2, property);
        // then
        expect(expected).toEqual(response);

    });
    
    it('should not join invalid property', function() {
        // given
        var array1 = [{
            property : 'valor',
            property1 : 'etc1',
            property2 : 'etc22'
        }, {
            property : 'valor2',
            property1 : 'valor1',
            property2 : 'valor2'
        }, {
            property : 'valor2',
            property1 : 'valor1',
            property2 : 'valor'
        }, {
            property : 'valoru',
            property1 : 'valor',
            property2 : 'valor2'
        }];

        var array2 = [{
            property : 'valor',
            property3 : 'lala1',
            property4 : 'lala2'
        }, {
            property : 'valory',
            property3 : 'valor6',
            property4 : 'valor7'
        }, {
            property : 'valor8',
            property3 : 'valor9',
            property4 : 'valor0'
        }, {
            property : 'valor1',
            property3 : 'valor2',
            property4 : 'valor3'
        }];
        var property = 'prop';

        var expected = [];

        // when
        var response = ArrayUtils.innerJoin(array1, array2, property);
        // then
        expect(expected).toEqual(response);
    });
    
    it('should not join undefined', function() {
        // given
        var array1 = [{
            property1 : 'etc1',
            property2 : 'etc22'
        }, {
            property : 'valor2',
            property1 : 'valor1',
            property2 : 'valor2'
        }, {
            property : 'valor2',
            property1 : 'valor1',
            property2 : 'valor'
        }, {
            property : 'valoru',
            property1 : 'valor',
            property2 : 'valor2'
        }];

        var array2 = [{
            property3 : 'lala1',
            property4 : 'lala2'
        }, {
            property : 'valory',
            property3 : 'valor6',
            property4 : 'valor7'
        }, {
            property : 'valor8',
            property3 : 'valor9',
            property4 : 'valor0'
        }, {
            property : 'valor1',
            property3 : 'valor2',
            property4 : 'valor3'
        }];
        var property = 'prop';

        var expected = [];

        // when
        var response = ArrayUtils.innerJoin(array1, array2, property);
        // then
        expect(expected).toEqual(response);
    });
    
    it('should not join null array', function() {
        // given
        var array1 = [{
            property1 : 'etc1',
            property2 : 'etc22'
        }, {
            property : 'valor2',
            property1 : 'valor1',
            property2 : 'valor2'
        }, {
            property : 'valor2',
            property1 : 'valor1',
            property2 : 'valor'
        }, {
            property : 'valoru',
            property1 : 'valor',
            property2 : 'valor2'
        }];

        var property = 'prop';

        var expected = [];

        // when
        var response = ArrayUtils.innerJoin(array1, null, property);
        // then
        expect(expected).toEqual(response);
    });

});