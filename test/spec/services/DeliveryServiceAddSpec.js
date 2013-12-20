xdescribe('Service: DeliveryServiceAddSpec', function() {

    var log = {};
    var storageStub = {};

    // load the service's module
    beforeEach(function() {

        // log mock
        log.error = jasmine.createSpy('$log.error');

        module('tnt.catalog.service.delivery');
        module(function($provide) {
            $provide.value('StorageService', storageStub);
            $provide.value('$log', log);
        });
    });

    beforeEach(inject(function(_DeliveryService_) {
        DeliveryService = _DeliveryService_;
    }));

    /**
     * <pre>
     * Givena valid delivery object
     * When add is triggered
     * Then a new delivery must be added to the storage
     * and the id of the delivery added must be returned
     * </pre>
     */
    it('should add a delivery to the storage', function() {
        // given

        // when

        // then

    });

    /**
     * <pre>
     * Given an invalid delivery object
     * Then must be logged: 'DeliveryService.add: -Invalid delivery object'
     * and false must be returned
     * </pre>
     */
    it('shouldn\'t add a delivery to the storage', function() {
        // given

        // when

        // then

    });

});