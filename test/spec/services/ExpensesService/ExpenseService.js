'use strict';

xdescribe('Service: ExpenseService', function() {

    // load the service's module
    beforeEach(module('glowingCatalogApp'));

    // instantiate service
    var ExpenseService;
    beforeEach(inject(function(_ExpenseService_) {
        ExpenseService = _ExpenseService_;
    }));

    it('should do something', function() {
        expect(!!ExpenseService).toBe(true);
    });

});
