describe('Service: InventoryService', function() {

    var log = {};
    var storageStub = {};
    var pStub = {};
    
    // load the service's module
    beforeEach(function() {

        pStub = {
            id : 1,
            quantity : 20,
            price : 10,
            stub : 'I\'m a stub'
                
        };
        
        // storageService mock
        storageStub.get = jasmine.createSpy('StorageService.get').andCallFake(function(name,id) {
            if (id === 1) {
                return pStub;
            }
        });
        
        storageStub.update = jasmine.createSpy('StorageService.update').andReturn(true);
            
        
        log.error = jasmine.createSpy('$log.error');
        

        module('tnt.catalog.service.inventory');
        module(function($provide) {
            $provide.value('StorageService', storageStub);
            $provide.value('$log', log);
        });
    });
    
    beforeEach(inject(function(_InventoryService_) {
        InventoryService = _InventoryService_;
    }));
    

    /**
     * <pre>
     * Given an existing product id
     * and a valid quantity
     * When inventoryRemove is triggered
     * Then the quantity must be subtracted from the existing one
     * and the product entity must be updated
     * and return the update result
     * </pre>
     */
    it('should remove a certain quantity from an inventory item', function() {
        // given
        var id = 1;
        var qty = 10;
        
        // when
        var isUpdated = InventoryService.remove(id,qty);
        
        // then
        expect(storageStub.get).toHaveBeenCalledWith('products',id);
        expect(storageStub.update).toHaveBeenCalled();
        expect(isUpdated).toEqual(true);
    });
    /**
     * <pre>
     * Given a non-existing product id
     * When inventoryRemove is triggered
     * Then false must be returned
     * </pre>
     */
    it('shouldn\'t remove a certain quantity from an inventory item', function() {
        // given
        var id = 5;
        
        // when
        var isUpdated = InventoryService.remove(id);
        
        // then
        expect(storageStub.get).toHaveBeenCalledWith('products',id);
        expect(storageStub.update).not.toHaveBeenCalled();
        expect(isUpdated).toEqual(false);
    });
    /**
     * <pre>
     * Given an existing product id
     * and a invalid quantity
     * When inventoryRemove is triggered
     * Then must be logged: 'InvetoryService.remove: -Invalid quantity, quantity={{quantity}}' 
     * and false must be returned
     * </pre>
     */
    it('shouldn\'t remove a certain quantity from an inventory item', function() {
        // given
        var id = 1;
        var qty = -10.5;
       
        // when
        var isUpdated = InventoryService.remove(id,qty);
        
        // then
        expect(storageStub.get).toHaveBeenCalledWith('products',id);
        expect(storageStub.update).not.toHaveBeenCalled();
        expect(log.error).toHaveBeenCalledWith('InvetoryService.remove: -Invalid quantity, quantity=' + qty);
        expect(isUpdated).toEqual(false);
    });

});
