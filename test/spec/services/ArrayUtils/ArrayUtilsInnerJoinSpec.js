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
        var array1 = [
            {
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
            }
        ];

        var array2 = [
            {
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
            }
        ];
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
        expect(response).toEqual(expected);

    });

    it('should inner join with numbers', function() {
        // given
        var array1 = [
            {
                property : 1,
                property1 : 2,
                property2 : 3
            }, {
                property : 4,
                property1 : 5,
                property2 : 6
            }, {
                property : 7,
                property1 : 8,
                property2 : 9
            }, {
                property : 10,
                property1 : 11,
                property2 : 12
            }
        ];

        var array2 = [
            {
                property : 1,
                property3 : 2,
                property4 : 3
            }, {
                property : 9,
                property3 : 8,
                property4 : 7
            }, {
                property : 6,
                property3 : 5,
                property4 : 4
            }, {
                property : 3,
                property3 : 2,
                property4 : 1
            }
        ];
        var property = 'property';

        var expected = [
            {
                property : 1,
                property1 : 2,
                property2 : 3,
                property3 : 2,
                property4 : 3
            }
        ];

        // when
        var response = ArrayUtils.innerJoin(array1, array2, property);
        // then
        expect(response).toEqual(expected);

    });
    
    //FIXME - return an empty array
    xit('should inner join with numbers', function() {
        // given
        var array1 = [ {
            property : {a:'a'},
            property1 : {b:'b'},
            property2 : {c:'c'}
        }, {
            property : {e:'e'},
            property1 : {f:'f'},
            property2 : {g:'g'}
        } ];

        var array2 = [ {
            property : {a:'a'},
            property3 : {e:'e'},
            property4 : {u:'u'}
        }, {
            property : {q:'q'},
            property3 : {g:'g'},
            property4 : {o:'o'}
        } ];
        var property = 'property';

        var expected = [
          {
            property : {a:'a'},
            property1 : {b:'b'},
            property2 : {c:'c'},
            property3 : {e:'e'},
            property4 : {u:'u'}
        }
        ];

        // when
        var response = ArrayUtils.innerJoin(array1, array2, property);
        // then
        expect(response).toEqual(expected);

    });

    //FIXME - return an empty array
    xit('should inner join with arrays', function() {
        // given
        var array1 = [ {
            property : ['yolo'],
            property1 : ['etc'],
            property2 : ['teste']
        }, {
            property : ['a','b'],
            property1 : ['b'],
            property2 : ['c']
        } ];

        var array2 = [ {
            property : ['yolo'],
            property3 : ['e'],
            property4 : ['u']
        }, {
            property : ['q'],
            property3 : ['g'],
            property4 : ['o']
        } ];
        var property = 'property';

        var expected = [
          {
              property : ['yolo'],
              property1 : ['etc'],
              property2 : ['teste'],
              property3 : ['e'],
              property4 : ['u']
        }
        ];

        // when
        var response = ArrayUtils.innerJoin(array1, array2, property);
        // then
        expect(response).toEqual(expected);

    });
    
    it('should not join, property existing only on a1', function() {
        // given
        var array1 = [
            {
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
            }
        ];

        var array2 = [
            {
                property2 : 'valor',
                property3 : 'lala1',
                property4 : 'lala2'
            }, {
                property2 : 'valory',
                property3 : 'valor6',
                property4 : 'valor7'
            }, {
                property2 : 'valor8',
                property3 : 'valor9',
                property4 : 'valor0'
            }, {
                property2 : 'valor1',
                property3 : 'valor2',
                property4 : 'valor3'
            }
        ];
        var property = 'property';

        // when
        var response = ArrayUtils.innerJoin(array1, array2, property);
        // then
        expect(response.length).toBe(0);

    });
    
    it('should not join, property existing only on a2', function() {
        // given
        var array1 = [
            {
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
            }
        ];

        var array2 = [
            {
                property6 : 'valor',
                property3 : 'lala1',
                property4 : 'lala2'
            }, {
                property6 : 'valory',
                property3 : 'valor6',
                property4 : 'valor7'
            }, {
                property6 : 'valor8',
                property3 : 'valor9',
                property4 : 'valor0'
            }, {
                property6 : 'valor1',
                property3 : 'valor2',
                property4 : 'valor3'
            }
        ];
        var property = 'property6';

        // when
        var response = ArrayUtils.innerJoin(array1, array2, property);
        // then
        expect(response.length).toBe(0);

    });
    
    it('should not join no matches', function() {
        // given
        var array1 = [
            {
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
            }
        ];

        var array2 = [
            {
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
            }
        ];
        var property = 'property';

        var expected = [];

        // when
        var response = ArrayUtils.innerJoin(array1, array2, property);
        // then
        expect(response).toEqual(expected);

    });

    it('should not join invalid property', function() {
        // given
        var array1 = [
            {
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
            }
        ];

        var array2 = [
            {
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
            }
        ];
        var property = 'prop';

        var expected = [];

        // when
        var response = ArrayUtils.innerJoin(array1, array2, property);
        // then
        expect(response).toEqual(expected);
    });

    it('should not join, invalid property', function() {
        // given
        var array1 = [
            {
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
            }
        ];

        var array2 = [
            {
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
            }
        ];
        var property = 'prop';

        var expected = [];

        // when
        var response = ArrayUtils.innerJoin(array1, array2, property);
        // then
        expect(response).toEqual(expected);
    });

    it('should not join null array', function() {
        // given
        var array1 = [
            {
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
            }
        ];

        var property = 'property';

        var expected = [];

        // when
        var response = ArrayUtils.innerJoin(array1, null, property);
        // then
        expect(response).toEqual(expected);
    });

});