'use strict';

describe('Service: FinancialMathService', function () {

    var loggerMock = {};

    beforeEach(function () {
        loggerMock.getLogger = jasmine.createSpy('loggerMock.getLogger');
        module(function ($provide) {
            $provide.value('logger', loggerMock);
        });
    });
    // load the service's module
    beforeEach(module('tnt.catalog.financial.math.service'));

    // instantiate service
    var FinancialMathService;
    beforeEach(inject(function (_FinancialMathService_) {
        FinancialMathService = _FinancialMathService_;
    }));

    it('should do something', function () {
        expect(!!FinancialMathService).toBe(true);
    });

});
