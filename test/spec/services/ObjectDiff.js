'use strict';

describe('Service: Objectdiff', function() {

    // load the service's module
    beforeEach(module('tnt.utils.object'));

    // instantiate service
    var ObjectDiff = undefined;
    beforeEach(inject(function(_ObjectDiff_) {
        ObjectDiff = _ObjectDiff_;
    }));

    it('shallow: should detect removed properties', function() {

        var a = {
            batata : 'lalala',
            banana : 'lelele'
        };

        var b = {
            batata : 'lalala'
        };

        var diff = {
            banana : null
        };

        expect(ObjectDiff.shallow(a, b)).toEqual(diff);
    });

    it('shallow: should detect added properties', function() {

        var a = {
            batata : 'lalala'
        };

        var b = {
            batata : 'lalala',
            banana : 'lelele'
        };

        var diff = {
            banana : 'lelele'
        };

        expect(ObjectDiff.shallow(a, b)).toEqual(diff);
    });

    it('shallow: should detect changed properties', function() {

        var a = {
            batata : 'lalala'
        };

        var b = {
            batata : 'lelele'
        };

        var diff = {
            batata : 'lelele'
        };

        expect(ObjectDiff.shallow(a, b)).toEqual(diff);
    });

    it('shallow: should detect deep equality', function() {

        var a = {
            batata : {
                banana : {
                    abacate : 'yay'
                }
            }
        };

        var b = {
            batata : {
                banana : {
                    abacate : 'yay'
                }
            }
        };

        var diff = {};

        expect(ObjectDiff.shallow(a, b)).toEqual(diff);
    });

    it('shallow: should detect deep changes', function() {

        var a = {
            batata : {
                banana : {
                    abacaxi : 'wow',
                    abacate : 'yay'
                }
            }
        };

        var b = {
            batata : {
                banana : {
                    abacaxi : 'yay'
                }
            }
        };

        var diff = {
            batata : {
                banana : {
                    abacaxi : 'yay'
                }
            }
        };

        expect(ObjectDiff.shallow(a, b)).toEqual(diff);
    });
    
    xit('deep: should detect deep changes', function() {

        var a = {
            batata : {
                banana : {
                    abacaxi : 'wow',
                    abacate : 'yay'
                }
            }
        };

        var b = {
            batata : {
                banana : {
                    abacaxi : 'yay'
                }
            }
        };

        var diff = {
            batata : {
                banana : {
                    abacaxi : 'yay',
                    abacate : null
                }
            }
        };

        expect(ObjectDiff.deep(a, b)).toEqual(diff);
    });

});
