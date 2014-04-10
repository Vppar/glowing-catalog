'use strict';

describe('Service: ReportService', function () {

  var loggerMock = {};

  beforeEach(function () {
      loggerMock.getLogger = jasmine.createSpy('loggerMock.getLogger');
      module(function ($provide) {
          $provide.value('logger', loggerMock);
      });
  });

  // load the service's module
  beforeEach(module('tnt.catalog.report.service'));
  
  // instantiate service
  var ReportService;
  beforeEach(inject(function (_ReportService_) {
      ReportService = _ReportService_;
  }));

  it('should do something', function () {
    expect(!!ReportService).toBe(true);
  });

});
