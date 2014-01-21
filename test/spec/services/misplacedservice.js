'use strict';

describe('Service: Misplacedservice', function() {

    var seed = [
        {
            test : 100
        }, {}, {}, {}
    ];

    // load the service's module
    beforeEach(module('glowingCatalogApp'));

    // instantiate service
    var Misplacedservice = null;
    beforeEach(inject(function(_Misplacedservice_) {
        Misplacedservice = _Misplacedservice_;
    }));

    it('should do something', function() {
        expect(!!Misplacedservice).toBe(true);
    });

    it('should calc', function() {

        var actual = Misplacedservice.recalc(200, 0, seed, 'test');

        expect(actual[0].test).toEqual(100);
        expect(actual[1].test).toEqual(33.33);
        expect(actual[2].test).toEqual(33.33);
        expect(actual[3].test).toEqual(33.34);
    });

    it('should calc neg', function() {

        var actual = Misplacedservice.recalc(90, 0, seed, 'test');

        expect(actual[0].test).toEqual(100);
        expect(actual[1].test).toEqual(0);
        expect(actual[2].test).toEqual(0);
        expect(actual[3].test).toEqual(0);
    });

    it('should recalc', function() {
        var ins = Misplacedservice.recalc(200, 0, seed, 'test');
        ins[1].test = 50.00;
        var actual = Misplacedservice.recalc(200, 1, ins, 'test');

        expect(actual[0].test).toEqual(100);
        expect(actual[1].test).toEqual(50);
        expect(actual[2].test).toEqual(25);
        expect(actual[3].test).toEqual(25);
    });

    it('should not crash', function() {
        var seed = [
            {}, {}, {}, {}, {}, {}
        ];

        var actual = Misplacedservice.recalc(232, -1, seed, 'test');

        expect(actual[0].test).toEqual(38.66);
        expect(actual[1].test).toEqual(38.66);
        expect(actual[2].test).toEqual(38.67);
        expect(actual[3].test).toEqual(38.67);
        expect(actual[3].test).toEqual(38.67);
        expect(actual[3].test).toEqual(38.67);
    });

});
