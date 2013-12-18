describe('Service: InventoryService', function() {

    var log = {};
    var storageStub = {};
    var pStub = {};
    
    // load the service's module
    beforeEach(function() {

        pStub = {
            id : 1,
            stub : 'I\'m a stub',
            price : 12.50,
            inventory : 5
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
     * and a valid price
     * and a valid inventory
     * When add is triggered
     * Then the inventory must be added to the existing one
     * and a new average price must be calculated
     * and the product entity must be updated
     * and return the update result
     * </pre>
     */
    it('should add and update the price and inventory of am product', function() {
        
        // given
        var id = 1;
        var price = 10.50;
        var qty = 3;
        
        var updatedQty = qty+pStub.inventory;
        var average = (qty*price)+(pStub.inventory*pStub.price)/updatedQty;

        // when
        var updatedItem = InventoryService.add(id,price,qty);
        
        // then
        expect(storageStub.get).toHaveBeenCalledWith('products',id);
        expect(storageStub.update).toHaveBeenCalledWith('products',pStub);
        
        expect(updatedItem.inventory).toEqual(updatedQty);
        expect(updatedItem.price).toEqual(average);
        
    });
    /**
     * <pre>
     * Given a non-existing product id
     * When add is triggered
     * Then false must be returned
     * </pre>
     */
    it('shouldn\'t add inventory or update the price of a product', function() {
        // given
        var id = 5;
        var price = 10;
        var qty = 5;
        
        // when
        var updatedItem = InventoryService.add(id,price,qty);
        
        // then
        expect(storageStub.get).toHaveBeenCalledWith('products',id);
        expect(storageStub.update).not.toHaveBeenCalled();
        
        expect(updatedItem).toEqual(false);
        
    });
    /**
     * <pre>
     * Given an existing product id
     * and a invalid price
     * When add is triggered
     * Then must be logged: 'InventoryService.add: -Invalid price, price={{price}}'
     * and false must be returned
     * </pre>
     */
    it('shouldn\'t add inventory or update the price of a product', function() {
        // given
        var id = 1;
        var price = -5.40;
        
        // when
        var updatedItem = InventoryService.add(id,price);
        
        // then
        expect(storageStub.get).toHaveBeenCalledWith('products',id);
        expect(storageStub.update).not.toHaveBeenCalled();
        
        expect(log.error).toHaveBeenCalledWith('InventoryService.add:  -Invalid price, price=' + price);
        
        expect(updatedItem).toEqual(false);
    });
    /**
     * <pre>
     * Given an existing product id
     * and a valid price
     * and a invalid inventory (negative one)
     * When add is triggered
     * Then must be logged: 'InventoryService.add: -Invalid inventory, inventory={{inventory}}' 
     * and false must be returned
     * </pre>
     */
    it('shouldn\'t add inventory or update the price of a product', function() {
        // given
        var id = 1;
        var price = 5.40;
        var inventory = -3;
        
        // when
        var updatedItem = InventoryService.add(id,price,inventory);
        
        // then
        expect(storageStub.get).toHaveBeenCalledWith('products',id);
        expect(storageStub.update).not.toHaveBeenCalled();
        
        expect(log.error).toHaveBeenCalledWith('InventoryService.add:  -Invalid inventory, inventory=' + inventory);
        
        expect(updatedItem).toEqual(false);
    });

});
