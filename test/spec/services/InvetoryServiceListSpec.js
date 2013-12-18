describe('Service: InvetoryService', function() {

    var log = {};
    var storageStub = {};
    var products = [];

    // load the service's module
    beforeEach(function() {

        products.push({
            stub : 'I\'m a stub'
        });
        
        // storageService mock
        storageStub.list = jasmine.createSpy('StorageService.list').andReturn(products);
        
        log.error = jasmine.createSpy('$log.error');
        

        module('tnt.catalog.service.inventory');
        module(function($provide) {
            $provide.value('StorageService', storageStub);
            $provide.value('$log', log);
        });
    });
    
    beforeEach(inject(function(_InvetoryService_) {
        InvetoryService = _InvetoryService_;
    }));
    
    
    /**
     * <pre>
     * Given ?
     * when list is triggered
     * then the product list must be returned
     * </pre>
     */
    it('should return the product list', function(){
        // given
        
        // when
        var list = InvetoryService.list();
        
        // then
        expect(storageStub.list).toHaveBeenCalledWith('products');
        expect(list).toBe(products);
    });

});
