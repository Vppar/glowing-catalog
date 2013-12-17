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
     * Given ?
     * when list is triggered
     * then a copy of the product list must be returned
     * </pre>
     */
    it('should do something', function(){
        
    });

});
