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
     * Given an existing id into the product storage
     * when get is triggered
     * then the product with that id must be returned
     * </pre>
     */
    it('should do something', function() {
        // given
        // when
        // then
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
        // when
        // then
    });

});
