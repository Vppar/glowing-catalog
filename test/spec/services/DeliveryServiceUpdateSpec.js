xdescribe('Service: DeliveryServiceUpdateSpec', function() {

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
     * Given a valid delivery object
     * and the delivery's id exists
     * When update is triggered
     * Then the delivery with this id must be updated in the storage
     * and true must be returned
     * </pre>
     */
    it('should update a delivery', function() {
        // given

        // when

        // then

    });

    /**
     * <pre>
     * Givena valid delivery object
     * and the delivery's id doesn't exists
     * When update is triggered
     * Then false must be returned
     * </pre>
     */
    it('shouldn\'t update a delivery', function() {
        // given

        // when

        // then

    });

    /**
     * <pre>
     * Givenan invalid delivery object
     * When update is triggered
     * Then false must be returned
     * </pre>
     */
    it('shouldn\'t update a delivery', function() {
        // given

        // when

        // then

    });

});