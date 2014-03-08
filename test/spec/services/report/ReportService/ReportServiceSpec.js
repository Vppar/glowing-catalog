'use strict';

describe('Service: ReportService', function () {

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
