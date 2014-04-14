describe('Service: SchedulingService', function () {
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

    spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
    logMock.debug = jasmine.createSpy('$log.debug');
    loggerMock.getLogger = jasmine.createSpy('logger.getLogger');

    module(function ($provide) {
      $provide.value('$log', logMock);
      $provide.value('logger', loggerMock);
      $provide.value('Schedule', ScheduleMock);
      $provide.value('SchedulingKeeper', SchedulingKeeperMock);
      $provide.value('DataProvider', DataProviderMock);
    });
  });

  beforeEach(inject(function(_SchedulingService_) {
    SchedulingService = _SchedulingService_;
  }));

  it('initializes an order object', function () {
    expect(SchedulingService).not.toBeUndefined();
    expect(SchedulingService).not.toBe('object');
  });

});
