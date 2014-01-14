'use strict';

describe('Service: ReceivableService', function() {

    // load the service's module
    beforeEach(module('glowingCatalogApp'));

    // instantiate service
    var ReceivableService;
    beforeEach(inject(function(_ReceivableService_) {
        ReceivableService = _ReceivableService_;
    }));

    it('should do something', function() {
        expect(!!ReceivableService).toBe(true);
    });

});
