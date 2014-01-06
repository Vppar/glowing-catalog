'use strict';

describe('Service: Replayer', function() {

    // load the service's module
    beforeEach(module('tnt.catalog.journal.replayer'));

    // instantiate service
    var Replayer = undefined;
    beforeEach(inject(function(_Replayer_) {
        Replayer = _Replayer_;
    }));

    it('should register', function() {

        var func = function() {

        };

        var func2 = function() {

        };

        var handlers = [
            func, func2
        ];

        expect(function() {
            Replayer.registerHandlers(handlers);
        }).not.toThrow();
    });

    it('should throw', function() {

        var func = function() {

        };
        
        var handlers = [
            func, 'teste'
        ];

        expect(function() {
            Replayer.registerHandlers(handlers);
        }).toThrow();

    });

});
