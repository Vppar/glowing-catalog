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
     * and a valid quantity
     * When inventoryRemove is triggered
     * Then the quantity must be subtracted from the existing one
     * and the product entity must be updated
     * and return the update result
     * </pre>
     */
    it('should do something', function() {
        // given
        // when
        // then
    });
    /**
     * <pre>
     * Given a non-existing product id
     * When inventoryRemove is triggered
     * Then false must be returned
     * </pre>
     */
    it('should do something', function() {
        // given
        // when
        // then
    });
    /**
     * <pre>
     * Given an existing product id
     * and a invalid quantity
     * When inventoryRemove is triggered
     * Then must be logged: 'ProductService.inventoryRemove: -Invalid quantity, quantity={{quantity}}' 
     * and false must be returned
     * </pre>
     */
    it('should do something', function() {
        // given
        // when
        // then
    });

});
