xdescribe('Service: DeliveryServiceGetSpec', function() {

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
     * Given an existing id
     * when get is triggered
     * then the delivery with that id must be returned
     * </pre>
     */
    it('should return the delivery that have the same id passed', function() {
        // given

        // when

        // then

    });

    /**
     * <pre>
     * Given an non-existing id
     * When get is triggered
     * Then must be logged: 'DeliveryService.get: -Delivery not found, id={{id}}'
     * and undefined must be returned
     * </pre>
     */
    it('shouldn\'t return a delivery', function() {
        // given

        // when

        // then

    });

});