'use strict';

describe('Service: InventoryServiceSpec', function() {

    // load the service's module
    beforeEach(module('glowingCatalogApp'));

    // instantiate service
    var InventoryService = null;
    beforeEach(inject(function(_InventoryService_) {
        InventoryService = _InventoryService_;
    }));

    /**
     * It should inject the dependencies.
     */
    xit('should inject dependencies', function() {
        expect(!!InventoryService).toBe(true);
    });
    
});
