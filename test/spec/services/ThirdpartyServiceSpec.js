xdescribe('Service: ThirdpartyServiceSpec', function() {

    // load the service's module
    beforeEach(module('glowingCatalogApp'));

    // instantiate service
    var ThirdpartyService = null;
    beforeEach(inject(function(_ThirdpartyService_) {
        ThirdpartyService = _ThirdpartyService_;
    }));

    /**
     * It should inject the dependencies.
     */
    xit('should inject dependencies', function() {
        expect(!!ThirdpartyService).toBe(true);
    });

});
