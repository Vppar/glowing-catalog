xdescribe('Service: Productservice', function() {

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
        storageStub.list = jasmine.createSpy('StorageService.get').andReturn(pStub);
        
        log.error = jasmine.createSpy('$log.error');
        

        module('tnt.catalog.service.product');
        module(function($provide) {
            $provide.value('StorageService', storageStub);
            $provide.value('$log', log);
        });
    });
    
    beforeEach(inject(function(_ProductService_) {
        ProductService = _ProductService_;
    }));
    
    
    /**
     * <pre>
     * Given an existing id into the product storage
     * when get is triggered
     * then the product with that id must be returned
     * </pre>
     */
    it('should do something', function() {
        // given
        var id = 1;
        
        // when
        var product = ProductService.get(id);
        
        // then
        expect(storageStub.get).toHaveBeenCalledWith('products',id);
        expect(product).toEqual(stub);
        
    });
    
    /**
     * <pre>
     * Given a non-existent id into the product storage
     * when read is triggered
     * then must be logged: 'ProductService.get: -Product not found, id={{id}}'
     * and undefined must be returned
     * </pre>
     */
    it('should do something', function() {
        // given
        var id = 5;
     
        // when
        var product = ProductService.get(id);
        
        // then
        expect(storageStub.get).not.toHaveBeenCalled();
        expect(log.error).toHaveBeenCalledWith('ProductService.get: -Product not found, id=' + id);
        expect(product).toBeUndefined();
    });

});
