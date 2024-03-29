describe('Service: InventoryService', function() {

    var log = {};
    var storageStub = {};
    var pStub = {};
    
    // load the service's module
    beforeEach(function() {

        pStub = {
            id : 1,
            stub : 'I\'m a stub'
        };
        
        // storageService mock
        storageStub.get = jasmine.createSpy('StorageService.get').andCallFake(function(name,id) {
            if (id === 1) {
                return pStub;
            }
        });
            
        
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
     * Given an existing id into the product storage
     * when get is triggered
     * then the product with that id must be returned
     * </pre>
     */
    it('should return the product whith the specified id', function() {
        // given
        var id = 1;
        
        // when
        var product = InventoryService.get(id);
        
        // then
        
        expect(storageStub.get).toHaveBeenCalledWith('products',id);
        expect(product).toEqual(pStub);
    });
    
    /**
     * <pre>
     * Given a non-existent id into the product storage
     * when read is triggered
     * then must be logged: 'InventoryService.get: -Product not found, id={{id}}'
     * and undefined must be returned
     * </pre>
     */
    it('shouldn\'t return the product whith the specified id', function() {
        // given
        var id = 5;
     
        // when
        var product = InventoryService.get(id);
        
        // then
        expect(log.error).toHaveBeenCalledWith('InventoryService.get: -Product not found, id=' + id);
        expect(product).toBeUndefined();
    });

});
