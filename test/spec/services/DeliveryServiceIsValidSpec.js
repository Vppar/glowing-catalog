xdescribe('Service: DeliveryServiceIsValidSpec', function() {

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
     * Given a valid date
     * and a valid status
     * and a valid order
     * and at least one product
     * When isValid is triggered
     * Then true must be returned
     * </pre>
     */
    it('should consider the object a valid delivery', function() {
        // given

        // when

        // then

    });

    /**
     * <pre>
     * Given an invalid date
     * When isValid is triggered
     * Then must be logged: 'DeliveryService.isValid: -Invalid date, date={{date}}'
     * and false must be returned
     * </pre>
     */
    it('shouldn\'t consider the object a valid delivery', function() {
        // given

        // when

        // then

    });

    /**
     * <pre>
     * Given a invalid status
     * When isValid is triggered
     * Then must be logged: 'DeliveryService.isValid: -Invalid status,status={{status}}'
     * and false must be returned
     * </pre>
     */
    it('shouldn\'t consider the object a valid delivery', function() {
        // given

        // when

        // then

    });

    /**
     * <pre>
     * Given a invalid order
     * When isValid is triggered
     * Then must be logged: 'DeliveryService.isValid: -Invalid order,order={{order}}'
     * and false must be returned
     * </pre>
     */
    it('shouldn\'t consider the object a valid delivery', function() {
        // given

        // when

        // then

    });

    /**
     * <pre>
     * Given an empty product list
     * When isValid is triggered
     * Then must be logged: 'DeliveryService.isValid: -Empty product list,productList={{productList}}'
     * and false must be returned
     * </pre>
     */
    it('shouldn\'t consider the object a valid delivery', function() {
        // given

        // when

        // then

    });

});