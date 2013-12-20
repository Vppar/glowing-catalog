xdescribe('Service: DeliveryServiceListSpec', function() {

    var log = {};
    var storageStub = {};

    var filter = {};
    var filterImpl = {};
    var timeFrameImpl = {};

    // load the service's module
    beforeEach(function() {

        // log mock
        log.error = jasmine.createSpy('$log.error');

        // storage mock
        storageStub.list = jasmine.createSpy('StorageService.list').andReturn(storageStub.deliveries);

        // filter mock
        filterImpl = jasmine.createSpy('filter').andCallFake(function(list, object) {
            return filteredExpenses;
        });
        timeFrameImpl = jasmine.createSpy('timeFrame').andCallFake(function(list, property, startDate, endDate) {
            return timeFilteredExpenses;
        });

        filter = jasmine.createSpy('$filter').andCallFake(function(name) {
            var selectedFilter = undefined;

            if (name === 'filter') {
                selectedFilter = filterImpl;
            } else if (name === 'timeFrame') {
                selectedFilter = timeFrameImpl;
            }

            return selectedFilter;
        });

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
     * Given ?
     * when list is triggered
     * then the deliveries list must be returned
     * </pre>
     */
    it('should return the list of deliveries', function() {
        // given

        // when

        // then

    });

    /**
     * <pre>
     * Givena valid filter parameter
     * when list is triggered
     * then the deliveries list filtered by the parameter must be returned
     * </pre>
     */
    it('should return a filtered list of deliveries', function() {

    });

    /**
     * <pre>
     * Given an invalid filter parameter
     * when list is triggered
     * Then must be logged: 'DeliveryService.list: -Invalid filter parameter, filter={{filter}}'
     * and undefined must be returned
     * </pre>
     */
    it('shouldn\'t return a list of deliveries from storage', function() {
        // given

        // when

        // then

    });

});