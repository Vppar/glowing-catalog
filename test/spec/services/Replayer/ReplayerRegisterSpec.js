'use strict';

describe('Service: Replayer', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.journal.replayer');
        module('tnt.catalog.financial.math.service');
    });


    // instantiate service
    var Replayer = undefined;
    var FinancialMathService = undefined;
    beforeEach(inject(function(_Replayer_, _FinancialMathService_) {
        Replayer = _Replayer_;
        FinancialMathService = _FinancialMathService_;
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
