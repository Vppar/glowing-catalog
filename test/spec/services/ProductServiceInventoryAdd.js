xdescribe('Service: Productservice', function() {

    // load the service's module
    beforeEach(module('glowingCatalogApp'));

    // instantiate service
    var Productservice;
    beforeEach(inject(function(_Productservice_) {
        Productservice = _Productservice_;
    }));

    it('should do something', function() {
        expect(!!Productservice).toBe(true);
    });

    /**
     * <pre>
     * Given an existing product id
     * and a valid price
     * and a valid quantity
     * When inventoryAdd is triggered
     * Then the quantity must be added to the existing one
     * and a new average price must be calculated
     * and the product entity must be updated
     * and return the update result
     * </pre>
     */
    it('should do something', function() {

    });
    /**
     * <pre>
     * Given a non-existing product id
     * When inventoryAdd is triggered
     * Then false must be returned
     * </pre>
     */
    it('should do something', function() {

    });
    /**
     * <pre>
     * Given an existing product id
     * and a invalid price
     * When inventoryAdd is triggered
     * Then must be logged: 'ProductService.inventoryAdd: -Invalid price, price={{price}}'
     * and false must be returned
     * </pre>
     */
    it('should do something', function() {

    });
    /**
     * <pre>
     * Given an existing product id
     * and a valid price
     * and a invalid quantity
     * When inventoryAdd is triggered
     * Then must be logged: 'ProductService.inventoryAdd: -Invalid quantity, quantity={{quantity}}' 
     * and false must be returned
     * </pre>
     */
    it('should do something', function() {

    });

});
