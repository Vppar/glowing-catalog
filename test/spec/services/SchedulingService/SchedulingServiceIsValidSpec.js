describe('Service: SchedulingServiceIsValid', function () {
    var monthTime = 2592000;

    var fakeNow = 1386444467895;
    var logMock = {};
    var loggerMock = {};
    var ScheduleMock = {};
    var SchedulingKeeperMock = {};
    var DataProviderMock = {};

    var SchedulingService = null;

    // load the service's module
    beforeEach(function () {

        module('tnt.catalog.scheduling.service');

        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        logMock.debug = jasmine.createSpy('$log.debug');
        loggerMock.getLogger = jasmine.createSpy('logger.getLogger');

        DataProviderMock.customers = [
            {
                id : 1,
                name : 'Foo Bar'
            }
        ];

        module(function ($provide) {
            $provide.value('$log', logMock);
            $provide.value('logger', loggerMock);
            $provide.value('Schedule', ScheduleMock);
            $provide.value('SchedulingKeeper', SchedulingKeeperMock);
            $provide.value('DataProvider', DataProviderMock);
        });
    });

    beforeEach(inject(function (_SchedulingService_) {
        SchedulingService = _SchedulingService_;
    }));

    /**
     * Given a valid order When isValid is triggered Then true should be
     * returned
     */
    it('returns true if order is valid', function () {
        var validSchedule = {
            date : new Date(),
            created : new Date(),
            status : true,
            documentUUID : '123',
            items : [
                {}
            ]
        };

        var result = SchedulingService.isValid(validSchedule);
        expect(result.length).toBe(0);
    });

    /**
     * Given an invalid order When isValid is triggered Then false should be
     * returned
     */
    it('returns false if order is not valid', function () {
        var invalidSchedule = {
            date :null,
            created : null,
            status : false,
            items : null
        };

        var result = SchedulingService.isValid(invalidSchedule);
        expect(result.length).toBe(4);
    });

});
