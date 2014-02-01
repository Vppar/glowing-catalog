'use strict';

describe('Service: InventoryKeeper', function() {

    // load the service's module
    beforeEach(module('tnt.catalog.inventory'));

    // instantiate service
    var Inventory = undefined;
    beforeEach(inject(function(_Inventory_) {
        Inventory = _Inventory_;
    }));

    /**
    * <pre>
    * @test Inventory.constructor#1
    * Validate the data on the returned object
    * </pre>
    */
    it('should validate data', function() {
        var inventory = new Inventory(10);
        expect(inventory.id).toEqual(10);
    });
    
    /** 
    * @test Inventory.constructor#2
    * Validate the read only fields
    * </pre>
    */
    it('should has read only id', function() {
        var inventory = new Inventory(10);
        expect(function(){inventory['id'] = 5;}).toThrow();
    });
});
