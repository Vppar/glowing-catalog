describe('Service: SchedulingServiceSave', function () {
    var fakeNow = 1386444467895;
    var logMock = {};
    var loggerMock = {};
    var ScheduleMock = {};
    var SchedulingKeeperMock = {};
    var DataProviderMock = {};

    var SchedulingService;

    // load the service's module
    beforeEach(function () {

        module('tnt.catalog.scheduling.service');
        module('tnt.catalog.scheduling.entity');

        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        logMock.debug = jasmine.createSpy('$log.debug');
        loggerMock.getLogger = jasmine.createSpy('logger.getLogger');

        DataProviderMock.customers = [
            {
                id : 1,
                name : 'Foo Bar'
            }
        ];

        SchedulingKeeperMock.create = jasmine.createSpy('SchedulingKeeper.create');

        module(function ($provide) {
            $provide.value('$log', logMock);
            $provide.value('logger', loggerMock);
            $provide.value('SchedulingKeeper', SchedulingKeeperMock);
            $provide.value('DataProvider', DataProviderMock);
        });
    });

    beforeEach(inject(function (_SchedulingService_, _Schedule_) {
        SchedulingService = _SchedulingService_;
        Schedule = _Schedule_;
        
    }));

    it('calls SchedulingKeeper.create() if order is valid', function () {
        var validSchedule = new Schedule({
            date : new Date(),
            created : new Date(),
            status : true,
            documentUUID : '123',
            items : [
                {}
            ],
            uuid:'123'
        });

        var result = SchedulingService.create(validSchedule);
        expect(SchedulingKeeperMock.create).toHaveBeenCalledWith(validSchedule);
    });

});
