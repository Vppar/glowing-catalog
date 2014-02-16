xdescribe('Service: DataProviderSpec', function() {

    // load the service's module
    beforeEach(module('glowingCatalogApp'));

    // instantiate service
    var DataProvider = null;
    beforeEach(inject(function(DataProvider) {
        DataProvider = _DataProvider_;
    }));

    xit('should do something', function() {
        expect(!!DataProvider).toBe(true);
    });

});
