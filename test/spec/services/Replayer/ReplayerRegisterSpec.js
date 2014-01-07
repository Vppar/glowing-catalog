'use strict';

describe('Service: Replayer', function() {

    // load the service's module
    beforeEach(module('tnt.catalog.journal.replayer'));

    // instantiate service
    var Replayer = undefined;
    beforeEach(inject(function(_Replayer_) {
        Replayer = _Replayer_;
    }));

    
    /**
     * <pre>
     * @spec Replayer.registerHandlers#1
     * Given a list of valid handlers
     * when a register is triggered
     * then the handlers must be added to the local hash
     * </pre>
     */
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

    /**
     * <pre>
     * @spec Replayer.registerHandlers#2
     * Given a list of non function handlers
     * when a register is triggered
     * then an error must be raised
     * </pre>
     */
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
