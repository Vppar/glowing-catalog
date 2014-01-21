'use strict';

describe('Service: Misplacedservice', function() {

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
        var actual = Misplacedservice.calc(200, 100, 4);
        
        expect(actual[0]).toEqual(100);
        expect(actual[1]).toEqual(33.33);
        expect(actual[2]).toEqual(33.33);
        expect(actual[3]).toEqual(33.34);
    });
    
    it('should recalc', function() {
        var ins = Misplacedservice.calc(200, 100, 4);
        ins[1] = 50.00;
        var actual = Misplacedservice.recalc(200, 1, ins);
        
        expect(actual[0]).toEqual(100);
        expect(actual[1]).toEqual(50);
        expect(actual[2]).toEqual(25);
        expect(actual[3]).toEqual(25);
    });

});
